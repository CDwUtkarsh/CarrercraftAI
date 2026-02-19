from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
from jose import JWTError, jwt

from ml_model import predict_career_success
from nlp_utils import analyze_resume
from recommendation_engine import recommend_jobs, generate_learning_path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

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

# Models
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
    education_level: int  # 1=HS, 2=Bachelor, 3=Master, 4=PhD
    num_skills: int
    location_tier: int  # 1=Tier1, 2=Tier2, 3=Tier3
    job_changes: int

class ResumeAnalysisInput(BaseModel):
    resume_text: str

class JobRecommendationInput(BaseModel):
    skills: List[str]

class LearningPathInput(BaseModel):
    skills: List[str]
    target_role: str

# Helper functions
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Routes
@api_router.get("/")
async def root():
    return {"message": "Career Success & Recommendation Platform API"}

@api_router.post("/auth/signup")
async def signup(user: UserCreate):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password
    hashed_password = bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt())
    
    # Create user
    user_doc = {
        "id": str(uuid.uuid4()),
        "email": user.email,
        "name": user.name,
        "password": hashed_password.decode('utf-8'),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    
    # Create token
    access_token = create_access_token(data={"sub": user_doc["id"]})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {"id": user_doc["id"], "email": user.email, "name": user.name}
    }

@api_router.post("/auth/login")
async def login(user: UserLogin):
    # Find user
    db_user = await db.users.find_one({"email": user.email})
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Verify password
    if not bcrypt.checkpw(user.password.encode('utf-8'), db_user["password"].encode('utf-8')):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create token
    access_token = create_access_token(data={"sub": db_user["id"]})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {"id": db_user["id"], "email": db_user["email"], "name": db_user["name"]}
    }

@api_router.post("/predict")
async def predict(input_data: CareerPredictionInput, user_id: str = Depends(get_current_user)):
    result = predict_career_success(
        input_data.age,
        input_data.experience_years,
        input_data.education_level,
        input_data.num_skills,
        input_data.location_tier,
        input_data.job_changes
    )
    
    if result is None:
        raise HTTPException(status_code=500, detail="Model not trained. Run train_model.py first")
    
    # Save to database
    prediction_doc = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "input": input_data.model_dump(),
        "result": result,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.predictions.insert_one(prediction_doc)
    
    return result

@api_router.post("/analyze_resume")
async def analyze_resume_endpoint(
    resume_text: Optional[str] = Form(None),
    file: UploadFile = File(None),
    user_id: str = Depends(get_current_user)
):
    # Support either text input or PDF upload
    text = None
    if resume_text and resume_text.strip():
        text = resume_text.strip()
    elif file is not None:
        # Only accept PDFs
        filename = file.filename or ''
        if not filename.lower().endswith('.pdf'):
            raise HTTPException(status_code=400, detail='Uploaded file must be a PDF')

        # Try to extract text from PDF using PyPDF2
        try:
            import io
            try:
                from PyPDF2 import PdfReader
            except Exception:
                # PyPDF2 might be installed under different package name/version; try pypdf
                from pypdf import PdfReader

            content = await file.read()
            reader = PdfReader(io.BytesIO(content))
            pages_text = []
            for p in reader.pages:
                try:
                    pages_text.append(p.extract_text() or '')
                except Exception:
                    # some pages may fail to extract; continue
                    pages_text.append('')
            text = '\n'.join(pages_text).strip()
        except ImportError:
            raise HTTPException(status_code=500, detail='PDF parsing requires PyPDF2 or pypdf; please install it on the server')
        except Exception as e:
            raise HTTPException(status_code=500, detail=f'Failed to extract text from PDF: {str(e)}')

    if not text:
        raise HTTPException(status_code=400, detail='No resume text provided')

    result = analyze_resume(text)

    # Save to database
    analysis_doc = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "result": result,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.resume_analyses.insert_one(analysis_doc)

    return result

@api_router.post("/recommend_jobs")
async def recommend_jobs_endpoint(input_data: JobRecommendationInput, user_id: str = Depends(get_current_user)):
    jobs = recommend_jobs(input_data.skills, top_n=6)
    return {"jobs": jobs}

@api_router.post("/chat")
async def chat_endpoint(payload: dict):
    """Simple chat endpoint. Tries Gemini (Generative Language API) if GEMINI_API_KEY is set,
    falls back to OpenAI if OPENAI_API_KEY is set, otherwise returns a helpful placeholder response.
    """
    message = payload.get('message') if isinstance(payload, dict) else None
    if not message:
        raise HTTPException(status_code=400, detail='No message provided')

    # Prefer Gemini API if configured
    gemini_key = os.environ.get('GEMINI_API_KEY')
    openai_key = os.environ.get('OPENAI_API_KEY') or os.environ.get('OPENAI_API_KEY'.upper())

    gemini_error = None

    # Try Gemini (Generative Language API)
    if gemini_key:
        try:
            import requests
            url = f"https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:generateText?key={gemini_key}"
            body = {"prompt": {"text": message}}
            resp = requests.post(url, json=body, timeout=15)
        except Exception:
            logger.exception('Gemini API request failed')
            resp = None

        if resp is not None:
            if resp.status_code == 200:
                data = resp.json()
                # Try common response shapes
                reply = None
                if isinstance(data, dict):
                    if 'candidates' in data and isinstance(data['candidates'], list) and len(data['candidates'])>0:
                        cand = data['candidates'][0]
                        reply = cand.get('output') or cand.get('content') or cand.get('text')
                    if not reply:
                        reply = data.get('output') or data.get('reply')
                if not reply:
                    reply = resp.text
                return {"reply": reply}
            else:
                # Log Gemini error, but do not send raw provider error to the client.
                # Continue to OpenAI fallback (if configured) or a friendly fallback message.
                logger.error(f'Gemini API returned non-200: {resp.status_code} {resp.text}')
                try:
                    gemini_error = resp.text
                except Exception:
                    gemini_error = f'status {resp.status_code}'

    # Try OpenAI if configured
    if openai_key:
        try:
            import requests
            url = 'https://api.openai.com/v1/chat/completions'
            headers = {'Authorization': f'Bearer {openai_key}', 'Content-Type': 'application/json'}
            body = {
                'model': 'gpt-3.5-turbo',
                'messages': [{'role':'user','content': message}],
                'max_tokens': 300
            }
            resp = requests.post(url, headers=headers, json=body, timeout=15)
            if resp.status_code == 200:
                data = resp.json()
                # OpenAI response parsing
                reply = None
                try:
                    reply = data['choices'][0]['message']['content']
                except Exception:
                    reply = resp.text
                return {"reply": reply}
            else:
                raise HTTPException(status_code=502, detail=f'OpenAI API error: {resp.status_code} {resp.text}')
        except Exception:
            logger.exception('OpenAI API call failed')

    # Fallback canned response
    fallback = (
        "I don't have access to an external AI service right now. "
        "Please ensure GEMINI_API_KEY or OPENAI_API_KEY is set in the backend .env."
    )
    return {"reply": fallback}

@api_router.post("/learning_path")
async def learning_path_endpoint(input_data: LearningPathInput, user_id: str = Depends(get_current_user)):
    path = generate_learning_path(input_data.skills, input_data.target_role)
    return path

@api_router.get("/dashboard")
async def dashboard(user_id: str = Depends(get_current_user)):
    # Get user predictions count
    predictions_count = await db.predictions.count_documents({"user_id": user_id})
    analyses_count = await db.resume_analyses.count_documents({"user_id": user_id})
    
    # Mock analytics data
    analytics = {
        "predictions_made": predictions_count,
        "resumes_analyzed": analyses_count,
        "salary_trends": [
            {"role": "Software Engineer", "avg_salary": 140000},
            {"role": "Data Scientist", "avg_salary": 125000},
            {"role": "Frontend Developer", "avg_salary": 100000},
            {"role": "DevOps Engineer", "avg_salary": 135000},
        ],
        "top_skills": [
            {"skill": "Python", "demand": 95},
            {"skill": "JavaScript", "demand": 88},
            {"skill": "React", "demand": 82},
            {"skill": "AWS", "demand": 78},
            {"skill": "Machine Learning", "demand": 85},
        ],
        "user_level": "Intermediate",
        "badges": ["First Prediction", "Career Explorer"] if predictions_count > 0 else []
    }
    
    return analytics

# Include router
app.include_router(api_router)

# Configure CORS origins (handle quoted values from .env)
cors_env = os.environ.get('CORS_ORIGINS', '*') or '*'
cors_env = cors_env.strip()
if cors_env == '*' or cors_env == '"*"' or cors_env == "'*'":
    allow_origins = ["*"]
else:
    allow_origins = [o.strip().strip('"').strip("'") for o in cors_env.split(',') if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=allow_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)