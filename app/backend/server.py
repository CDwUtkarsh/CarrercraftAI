from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
from jose import JWTError, jwt
import requests
import io
import json

from ml_model import predict_career_success, predict_resume_score
from nlp_utils import analyze_resume, extract_resume_features, extract_text_from_pdf, extract_skills
try:
    import PyPDF2
except Exception:
    PyPDF2 = None
from recommendation_engine import recommend_jobs, generate_learning_path, get_real_courses, get_youtube_courses, get_udemy_courses
from database import users_collection, resume_collection


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Lyzr config
LYZR_API_KEY = os.environ.get("LYZR_API_KEY")
LYZR_AGENT_ID = os.environ.get("LYZR_AGENT_ID")

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT configuration
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
ALGORITHM = 'HS256'
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer()
security_optional = HTTPBearer(auto_error=False)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Models ──────────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    email: str
    password: str
    name: str

class UserLogin(BaseModel):
    email: str
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: str
    name: str
    created_at: datetime

class CareerPredictionInput(BaseModel):
    age: int
    experience_years: int
    education_level: int
    num_skills: int
    location_tier: int
    job_changes: int

class JobRecommendationInput(BaseModel):
    skills: List[str]

class LearningPathInput(BaseModel):
    skills: List[str]
    target_role: str

# ── Helpers ──────────────────────────────────────────────────────────────────

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


async def get_current_user_optional(credentials: HTTPAuthorizationCredentials = Depends(security_optional)):
    if credentials is None:
        return None
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        return payload.get("sub")
    except Exception:
        return None

# ── Auth Routes ───────────────────────────────────────────────────────────────

@api_router.get("/")
async def root():
    return {"message": "Career Success & Recommendation Platform API"}


@api_router.post("/auth/signup")
async def signup(user_data: UserCreate):
    """Register a new user. Accepts JSON body with email, password, name."""
    existing = await users_collection.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")

    hashed_password = bcrypt.hashpw(user_data.password.encode(), bcrypt.gensalt()).decode()
    user_doc = {
        "email": user_data.email,
        "password": hashed_password,
        "name": user_data.name,
        "created_at": datetime.utcnow()
    }
    result = await users_collection.insert_one(user_doc)

    token = create_access_token({"sub": str(result.inserted_id)})
    return {
        "access_token": token,
        "user": {
            "id": str(result.inserted_id),
            "email": user_data.email,
            "name": user_data.name
        }
    }


@api_router.post("/auth/login")
async def login(user_data: UserLogin):
    """Authenticate user and return JWT token."""
    user = await users_collection.find_one({"email": user_data.email})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not bcrypt.checkpw(user_data.password.encode(), user["password"].encode()):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": str(user["_id"])})
    return {
        "access_token": token,
        "user": {
            "id": str(user["_id"]),
            "email": user["email"],
            "name": user.get("name", "")
        }
    }

# ── AI Chat ───────────────────────────────────────────────────────────────────

@api_router.post("/chat")
async def chat_endpoint(payload: dict):
    message = payload.get("message") if isinstance(payload, dict) else None
    if not message:
        raise HTTPException(status_code=400, detail="No message provided")

    # Fallback demo replies (used if Lyzr is unavailable)
    demo_replies = {
        "hello": "Hi there! 👋 I'm your AI Career Advisor. Ask me about resumes, interviews, salary negotiation, or career growth!",
        "hi":    "Hello! 😊 How can I help with your career today?",
        "resume": "To improve your resume: 1) Use quantifiable achievements, 2) Add keywords from job descriptions, 3) Use clear sections (Summary, Experience, Skills, Education), 4) Start bullets with action verbs like 'Led', 'Built', 'Optimized'.",
        "interview": "For interviews: 1) Research the company, 2) Use the STAR method, 3) Prepare achievement examples, 4) Ask thoughtful questions, 5) Send a follow-up thank-you email.",
        "salary": "Salary tips: 1) Research market rates, 2) Negotiate after the offer, 3) Consider total compensation, 4) Get agreements in writing.",
        "career": "Career growth: 1) Set clear milestones, 2) Build skills via courses, 3) Network in your field, 4) Find a mentor, 5) Take on stretch projects.",
        "skill":  "Top skills in 2025: Python, React, AWS, SQL, Machine Learning, Communication, and Project Management.",
        "job":    "Job search tips: 1) Tailor your resume per role, 2) Apply on company sites directly, 3) Network on LinkedIn, 4) Follow up after 1 week.",
    }
    message_lower = message.lower()
    fallback_reply = next(
        (v for k, v in demo_replies.items() if k in message_lower),
        f"Great question! I can help with resume tips, interview prep, salary negotiation, and career growth. Could you be more specific?"
    )

    # Try Lyzr API
    if LYZR_API_KEY and LYZR_AGENT_ID:
        try:
            response = requests.post(
                "https://agent-prod.studio.lyzr.ai/v3/inference/chat/",  # ← trailing slash required!
                json={
                    "user_id": "careercraft-user",
                    "agent_id": LYZR_AGENT_ID,
                    "session_id": "careercraft-session",
                    "message": message                   # ← "message" not "input"
                },
                headers={
                    "Content-Type": "application/json",
                    "x-api-key": LYZR_API_KEY
                },
                timeout=15
            )
            if response.status_code == 200:
                data = response.json()

                # Lyzr returns: {"response": "{\"result\": {\"message\": \"...\"}}", ...}
                # The "response" field is a JSON STRING — parse it!
                raw = data.get("response", "")
                if raw:
                    try:
                        parsed = json.loads(raw)
                        lyzr_reply = (
                            parsed.get("result", {}).get("message")
                            or parsed.get("message")
                            or parsed.get("output")
                            or raw
                        )
                    except (json.JSONDecodeError, AttributeError):
                        lyzr_reply = raw  # use raw string if not parseable

                    if lyzr_reply:
                        logging.info("Lyzr API responded successfully")
                        return {"reply": lyzr_reply}
            else:
                logging.warning(f"Lyzr returned {response.status_code}: {response.text[:200]}")

        except requests.exceptions.ConnectionError:
            logging.warning("Lyzr DNS resolution failed — using fallback")
        except requests.exceptions.Timeout:
            logging.warning("Lyzr request timed out — using fallback")
        except Exception as e:
            logging.warning(f"Lyzr API error: {e}")

    return {"reply": fallback_reply}

# ── Career Prediction ─────────────────────────────────────────────────────────

@api_router.post("/predict")
async def predict(input_data: CareerPredictionInput, user_id: Optional[str] = Depends(get_current_user_optional)):
    try:
        result = predict_career_success(
            input_data.age,
            input_data.experience_years,
            input_data.education_level,
            input_data.num_skills,
            input_data.location_tier,
            input_data.job_changes
        )
        if result is None:
            raise HTTPException(status_code=500, detail="Career model failed to generate prediction.")

        prediction_doc = {
            "id": str(uuid.uuid4()),
            "user_id": user_id or "anonymous",
            "input": input_data.model_dump(),
            "result": result,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        try:
            await db.predictions.insert_one(prediction_doc)
        except Exception:
            logging.warning("Could not save prediction to DB; continuing")

        return result
    except Exception as e:
        logging.exception("Career prediction error")
        raise HTTPException(status_code=500, detail=f"Career prediction failed: {str(e)}")

# ── Job Recommendations ───────────────────────────────────────────────────────

@api_router.post("/recommend_jobs")
async def recommend_jobs_endpoint(input_data: JobRecommendationInput, user_id: Optional[str] = Depends(get_current_user_optional)):
    try:
        jobs = recommend_jobs(input_data.skills, top_n=6)
        return {"jobs": jobs}
    except Exception as e:
        logging.exception("Job recommendation error")
        raise HTTPException(status_code=500, detail=f"Job recommendation failed: {str(e)}")

# ── Learning Path ─────────────────────────────────────────────────────────────

@api_router.post("/learning_path")
async def learning_path_endpoint(input_data: LearningPathInput, user_id: Optional[str] = Depends(get_current_user_optional)):
    try:
        resume_insights = None
        if user_id:
            try:
                latest_resume = await db.resume_analyses.find_one(
                    {"user_id": user_id},
                    sort=[("created_at", -1)]
                )
                if latest_resume:
                    resume_insights = latest_resume.get("result")
            except Exception as e:
                logging.warning(f"Could not fetch resume insights: {e}")

        path = generate_learning_path(
            user_skills=input_data.skills,
            target_role=input_data.target_role,
            resume_data=resume_insights
        )
        if not path:
            raise HTTPException(status_code=500, detail="Failed to generate learning path")
        return path
    except Exception as e:
        logging.exception("Learning path generation error")
        raise HTTPException(status_code=500, detail=f"Learning path generation failed: {str(e)}")

# ── Resume Analysis ───────────────────────────────────────────────────────────

@api_router.post("/analyze-resume")
async def analyze_resume_endpoint(
    resume_text: Optional[str] = Form(None),
    file: UploadFile = File(None),
    user_id: Optional[str] = Depends(get_current_user_optional)
):
    """Analyze resume (PDF upload or pasted text) and return ML score + course recommendations."""

    # Step 1: Extract text
    text = None
    if resume_text:
        text = resume_text
    elif file:
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are supported")
        if PyPDF2 is None:
            raise HTTPException(status_code=500, detail="PyPDF2 not installed in backend")
        try:
            contents = await file.read()
            text = extract_text_from_pdf(io.BytesIO(contents))
        except Exception:
            logging.exception("Failed to read uploaded PDF")
            raise HTTPException(status_code=500, detail="Could not extract text from resume")
    else:
        raise HTTPException(status_code=400, detail="No resume provided")

    if not text or not text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from resume")

    try:
        # Step 2: Feature extraction + ML score
        features = extract_resume_features(text)
        score = predict_resume_score(features)

        # Step 3: Feedback
        if score >= 85:
            feedback = "Excellent Resume 🚀 (Job Ready)"
        elif score >= 70:
            feedback = "Strong Resume 👍 (Minor Improvements Needed)"
        elif score >= 50:
            feedback = "Average Resume ⚠️ (Add more projects & skills)"
        else:
            feedback = "Weak Resume ❌ (Improve skills, projects and experience)"

        # Step 4: Skill extraction
        detected_skills = extract_skills(text)
        if not detected_skills:
            detected_skills = ["programming"]

        # Step 5: Real course recommendations
        courses = get_real_courses(detected_skills)

        logging.info(f"Detected Skills: {detected_skills}")
        logging.info(f"Real Courses Fetched: {len(courses)}")

        # Step 6: Save to DB (all variables now defined)
        resume_doc = {
            "user_id": user_id or "guest",
            "resume_score": score,
            "skills": detected_skills,
            "feedback": feedback,
            "courses_count": len(courses),
            "created_at": datetime.utcnow()
        }
        try:
            await resume_collection.insert_one(resume_doc)
        except Exception:
            logging.warning("Could not save resume analysis to DB; continuing")

        return {
            "resume_score": score,
            "feedback": feedback,
            "skills": detected_skills,
            "courses": courses,
            "analysis": {
                "word_count": features[0],
                "skills_count": features[1],
                "has_projects": features[2],
                "has_education": features[3],
                "has_experience": features[4],
            }
        }

    except Exception as e:
        logging.exception("Error analyzing resume")
        raise HTTPException(status_code=500, detail=f"Error analyzing resume: {str(e)}")

# ── Dashboard ─────────────────────────────────────────────────────────────────

@api_router.get('/dashboard')
async def dashboard_overview():
    try:
        predictions_made = await db.predictions.count_documents({}) if 'predictions' in await db.list_collection_names() else 0
    except Exception:
        predictions_made = 0

    try:
        resumes_analyzed = await db.analyzed_resumes.count_documents({}) if 'analyzed_resumes' in await db.list_collection_names() else 0
    except Exception:
        resumes_analyzed = 0

    try:
        users_count = await db.users.count_documents({}) if 'users' in await db.list_collection_names() else 0
    except Exception:
        users_count = 0

    if predictions_made > 20:
        user_level = 'Advanced'
    elif predictions_made > 5:
        user_level = 'Intermediate'
    else:
        user_level = 'Beginner'

    badges = ["Getting Started"] if users_count > 0 else []

    salary_trends = [
        {"role": "Software Engineer", "avg_salary": 95000},
        {"role": "Data Scientist", "avg_salary": 100000},
        {"role": "Product Manager", "avg_salary": 105000}
    ]

    top_skills = [
        {"skill": "Python", "demand": 42},
        {"skill": "React", "demand": 30},
        {"skill": "AWS", "demand": 22}
    ]

    return {
        "predictions_made": predictions_made,
        "resumes_analyzed": resumes_analyzed,
        "user_level": user_level,
        "badges": badges,
        "salary_trends": salary_trends,
        "top_skills": top_skills
    }

# ── Course Health Check ───────────────────────────────────────────────────────

@api_router.get('/health/courses')
async def courses_health():
    skills = ["python", "sql", "react"]
    diagnostics = {}

    try:
        yt_samples = get_youtube_courses(skills[0])
        diagnostics['youtube'] = {
            'enabled': True,
            'count': len(yt_samples),
            'samples': [{'title': c.get('title'), 'thumbnail': c.get('thumbnail'), 'link': c.get('link')} for c in yt_samples[:3]]
        }
    except Exception as e:
        diagnostics['youtube'] = {'enabled': False, 'error': str(e)}

    try:
        ud_samples = get_udemy_courses(skills[0])
        diagnostics['udemy'] = {
            'enabled': True,
            'count': len(ud_samples),
            'samples': [{'title': c.get('title'), 'thumbnail': c.get('thumbnail'), 'link': c.get('link')} for c in ud_samples[:3]]
        }
    except Exception as e:
        diagnostics['udemy'] = {'enabled': False, 'error': str(e)}

    try:
        from recommendation_engine import COURSE_LISTINGS
        diagnostics['fallback_count'] = len(COURSE_LISTINGS)
    except Exception:
        diagnostics['fallback_count'] = 0

    return diagnostics


# ── Mount Router ──────────────────────────────────────────────────────────────

app.include_router(api_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)