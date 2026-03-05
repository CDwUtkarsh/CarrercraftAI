import os
from dotenv import load_dotenv
from pathlib import Path
import requests
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Ensure .env in the backend directory is loaded when this module is imported
_env_path = Path(__file__).parent / '.env'
load_dotenv(_env_path)

# Load Adzuna API keys from environment
ADZUNA_APP_ID = os.getenv("ADZUNA_APP_ID")
ADZUNA_APP_KEY = os.getenv("ADZUNA_APP_KEY")

# YouTube and Udemy API keys
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY", "YOUR_YOUTUBE_API_KEY")
RAPIDAPI_KEY = os.getenv("RAPIDAPI_KEY", "YOUR_RAPIDAPI_KEY")


# -------------------- REAL JOB FETCHING (ADZUNA) --------------------
def fetch_real_jobs(country, query, count):
    """Fetch real jobs from Adzuna API based on country and query"""
    try:
        url = f"https://api.adzuna.com/v1/api/jobs/{country}/search/1"

        params = {
            "app_id": ADZUNA_APP_ID,
            "app_key": ADZUNA_APP_KEY,
            "results_per_page": count,
            "what": query,
            "content-type": "application/json"
        }

        response = requests.get(url, params=params, timeout=15)

        if response.status_code != 200:
            print("Adzuna API Error:", response.text)
            return []

        data = response.json()
        jobs = []

        for i, job in enumerate(data.get("results", [])):
            title = job.get("title", "")
            description = job.get("description", "") or ""
            company = job.get("company", {}).get("display_name", "Unknown")
            location = job.get("location", {}).get("display_name", "Unknown")
            salary_min = job.get("salary_min")
            salary_max = job.get("salary_max")

            # Create a searchable skill profile (important for TF-IDF matching)
            skill_text = (title + " " + description[:300]).lower()

            jobs.append({
                "id": i + 1,
                "title": title,
                "company": company,
                "location": location,
                "skills": skill_text,
                "salary": f"{salary_min}-{salary_max}" if salary_min and salary_max else "Not disclosed",
                "apply_link": job.get("redirect_url"),
                "source": "India" if country == "in" else "Global"
            })

        return jobs

    except Exception as e:
        print("Fetch Jobs Error:", str(e))
        return []


# -------------------- UPDATED JOB RECOMMENDER (AI + REAL JOBS) --------------------
def recommend_jobs(user_skills, top_n=6):
    """
    Recommend ONLY Indian jobs using:
    - Adzuna India API (country = 'in')
    - TF-IDF AI skill matching
    """
    if not user_skills:
        return []

    # Check API keys
    if not ADZUNA_APP_ID or not ADZUNA_APP_KEY:
        print("WARNING: Adzuna API keys missing in .env")
        return []

    try:
        # Convert skills into search query
        query = " ".join(user_skills)

        # 🇮🇳 Fetch ONLY Indian jobs (IMPORTANT CHANGE)
        real_jobs = fetch_real_jobs("in", query, top_n)

        if not real_jobs:
            print("No Indian jobs found from Adzuna")
            return []

        # ---- AI Matching (your original logic, unchanged) ----
        user_profile = " ".join(user_skills)
        job_profiles = [job["skills"] for job in real_jobs]
        all_documents = [user_profile] + job_profiles

        vectorizer = TfidfVectorizer(stop_words="english")
        tfidf_matrix = vectorizer.fit_transform(all_documents)

        user_vector = tfidf_matrix[0:1]
        job_vectors = tfidf_matrix[1:]

        similarities = cosine_similarity(user_vector, job_vectors)[0]

        # Sort by best match
        top_indices = np.argsort(similarities)[::-1][:top_n]

        recommendations = []
        for idx in top_indices:
            job = real_jobs[idx].copy()
            job["match_score"] = round(similarities[idx] * 100, 2)
            job["source"] = "India"
            recommendations.append(job)

        return recommendations

    except Exception as e:
        print("Recommendation Error:", str(e))
        return []


# -------------------- COURSE LISTINGS (FALLBACK) --------------------
COURSE_LISTINGS = [
    {'id': 1, 'title': 'Complete Python Bootcamp', 'platform': 'Udemy', 'duration': '40 hours',
     'price': '₹1200', 'skills': 'python programming basics',
     'link': 'https://www.udemy.com/course/complete-python-bootcamp/', 'thumbnail': 'https://via.placeholder.com/300x170?text=Python'},
    {'id': 2, 'title': 'React - The Complete Guide', 'platform': 'Udemy', 'duration': '48 hours',
     'price': '₹1500', 'skills': 'react javascript frontend',
     'link': 'https://www.udemy.com/course/react-the-complete-guide-incl-redux/', 'thumbnail': 'https://via.placeholder.com/300x170?text=React'},
    {'id': 3, 'title': 'Machine Learning Specialization', 'platform': 'Coursera', 'duration': '3 months',
     'price': '₹4000', 'skills': 'machine learning ai python',
     'link': 'https://www.coursera.org/specializations/machine-learning-introduction', 'thumbnail': 'https://via.placeholder.com/300x170?text=ML'},
    {'id': 4, 'title': 'AWS Certified Solutions Architect', 'platform': 'Udemy', 'duration': '30 hours',
     'price': '₹1800', 'skills': 'aws cloud docker',
     'link': 'https://www.udemy.com/course/aws-certified-solutions-architect-associate/', 'thumbnail': 'https://via.placeholder.com/300x170?text=AWS'},
    {'id': 5, 'title': 'Data Science Professional Certificate', 'platform': 'Coursera', 'duration': '6 months',
     'price': '₹5000', 'skills': 'data science sql python analytics',
     'link': 'https://www.coursera.org/professional-certificates/data-science', 'thumbnail': 'https://via.placeholder.com/300x170?text=DataScience'},
    {'id': 6, 'title': 'Project Management Professional', 'platform': 'Udemy', 'duration': '35 hours',
     'price': '₹1600', 'skills': 'project management agile leadership',
     'link': 'https://www.udemy.com/course/project-management-masterclass/', 'thumbnail': 'https://via.placeholder.com/300x170?text=ProjectMgmt'},
]


def recommend_courses(user_skills, target_skills, budget_max=200, top_n=5):
    """Recommend courses based on skill gap (unchanged)"""
    missing_skills = [skill for skill in target_skills if skill not in user_skills]

    if not missing_skills:
        missing_skills = ['advanced programming', 'leadership']

    gap_profile = ' '.join(missing_skills)
    course_profiles = [course['skills'] for course in COURSE_LISTINGS]
    all_documents = [gap_profile] + course_profiles

    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(all_documents)

    gap_vector = tfidf_matrix[0:1]
    course_vectors = tfidf_matrix[1:]
    similarities = cosine_similarity(gap_vector, course_vectors)[0]

    top_indices = np.argsort(similarities)[::-1][:top_n]

    recommendations = []
    for idx in top_indices:
        course = COURSE_LISTINGS[idx].copy()
        course['relevance_score'] = round(similarities[idx] * 100, 2)
        recommendations.append(course)

    return recommendations


def generate_learning_path(user_skills, target_role, resume_data=None):
    """AI-powered personalized learning path using resume + skills"""

    user_skills = [s.lower() for s in user_skills]

    role_requirements = {
        'software_engineer': [
            'python', 'javascript', 'react', 'sql',
            'data structures', 'algorithms', 'system design', 'git', 'apis'
        ],
        'data_scientist': [
            'python', 'machine learning', 'statistics',
            'pandas', 'numpy', 'sql', 'data visualization'
        ],
        'frontend_developer': [
            'html', 'css', 'javascript', 'react', 'typescript', 'ui/ux'
        ],
        'devops_engineer': [
            'linux', 'docker', 'kubernetes', 'aws', 'ci/cd', 'terraform'
        ],
        'ml_engineer': [
            'python', 'machine learning', 'deep learning',
            'tensorflow', 'pytorch', 'mlops'
        ],
    }

    # Smart role normalization (handles UI names)
    target_role_key = target_role.lower().strip().replace(" ", "_")

    # Fallback matching if exact key not found
    required_skills = role_requirements.get(target_role_key)

    if not required_skills:
        # Try partial matching (e.g. "software engineer" → software_engineer)
        for key in role_requirements:
            if key in target_role_key or target_role_key in key:
                required_skills = role_requirements[key]
                break

    # Final fallback
    if not required_skills:
        required_skills = ['python', 'sql', 'git', 'data structures']

    # 🎯 Resume Intelligence
    resume_skills = []
    resume_strengths = []
    resume_weaknesses = []

    if resume_data:
        resume_skills = [s.lower() for s in resume_data.get("skills", [])]
        resume_strengths = resume_data.get("strengths", [])
        resume_weaknesses = resume_data.get("weaknesses", [])

        # Merge resume skills with user skills
        user_skills = list(set(user_skills + resume_skills))

    # Skill gap
    missing_skills = [skill for skill in required_skills if skill not in user_skills]

    roadmap = []

    # 🔥 FULLY PERSONALIZED ROADMAP
    if resume_data:
        roadmap.append("Analyze and improve resume based on detected skill gaps")
        
        if resume_strengths:
            roadmap.append(f"Leverage your strengths: {', '.join(resume_strengths[:3])}")

        if resume_weaknesses:
            roadmap.append(f"Work on weak areas identified in resume: {', '.join(resume_weaknesses[:3])}")

        roadmap.append("Enhance existing projects mentioned in your resume with real-world features")
    else:
        roadmap.append("Build a strong technical foundation (Programming + CS Basics)")

    # Skill gap learning (dynamic)
    if missing_skills:
        roadmap.append(f"Learn critical missing skills for {target_role}: {', '.join(missing_skills[:5])}")

    # Experience-based logic
    if len(user_skills) < 3:
        roadmap.append("Start with beginner-level projects to build portfolio")
    elif len(user_skills) < 6:
        roadmap.append("Build 2-3 intermediate real-world projects for your portfolio")
    else:
        roadmap.append("Build advanced scalable projects to stand out from other candidates")

    # Career growth steps
    roadmap.extend([
        f"Practice DSA and interview preparation for {target_role} roles",
        "Optimize LinkedIn, Resume, and GitHub portfolio",
        "Apply to internships and entry-level roles consistently",
        "Start mock interviews and system design practice"
    ])

    timeline_weeks = max(6, len(missing_skills) * 2)

    return {
        "target_role": target_role,
        "current_skills": user_skills,
        "resume_detected": bool(resume_data),  # ⭐ NEW (for debugging UI)
        "required_skills": required_skills,
        "skill_gap": missing_skills,
        "roadmap": roadmap,
        "estimated_timeline": f"{timeline_weeks} weeks",
        "recommended_courses": recommend_courses(user_skills, required_skills, top_n=4)
    }


def get_real_courses(skills):
    """
    Get real course recommendations from YouTube and Udemy APIs.
    Returns courses based on detected skills with fallback to COURSE_LISTINGS.
    """
    if not skills:
        skills = ["programming"]

    # Try multiple top skills (not just the first) so user sees diverse courses
    top_k = min(3, len(skills))
    top_skills = [s.lower().strip() for s in skills[:top_k]]

    courses = []

    # Check if API keys are configured
    has_youtube_api = bool(YOUTUBE_API_KEY and YOUTUBE_API_KEY != "YOUR_YOUTUBE_API_KEY")
    has_rapidapi_key = bool(RAPIDAPI_KEY and RAPIDAPI_KEY != "YOUR_RAPIDAPI_KEY")

    print(f"get_real_courses: has_youtube_api={has_youtube_api}, has_rapidapi_key={has_rapidapi_key}, top_skills={top_skills}")

    for skill in top_skills:
        if has_youtube_api:
            youtube = get_youtube_courses(skill)
            print(f"YouTube returned {len(youtube)} items for skill={skill}")
            courses.extend(youtube)

        if has_rapidapi_key:
            udemy = get_udemy_courses(skill)
            print(f"Udemy(RapidAPI) returned {len(udemy)} items for skill={skill}")
            courses.extend(udemy)
    
    # Fallback to COURSE_LISTINGS if no API courses found
    # Helper: normalize course fields (link, thumbnail, platform)
    def normalize_course(c):
        c = c or {}
        title = c.get('title') or 'Untitled Course'
        platform = (c.get('platform') or '').strip() or 'Unknown'
        link = c.get('link') or c.get('url') or ''
        thumbnail = c.get('thumbnail') or c.get('image_480x270') or ''

        # Normalize link - make absolute when possible
        if link and not str(link).startswith(('http://', 'https://')):
            # If it's a Udemy relative path, prefix Udemy domain
            if str(link).startswith('/'):
                if 'udemy' in platform.lower():
                    link = 'https://www.udemy.com' + str(link)
                elif 'coursera' in platform.lower():
                    link = 'https://www.coursera.org' + str(link)
                else:
                    link = 'https://' + str(link).lstrip('/')
            else:
                link = 'https://' + str(link)

        # Ensure thumbnail is present
        if not thumbnail or not str(thumbnail).strip():
            # try to infer YouTube thumbnail from link if possible
            if 'youtube.com/watch' in str(link) or 'youtu.be/' in str(link):
                # extract video id
                vid = None
                if 'v=' in str(link):
                    try:
                        vid = str(link).split('v=')[1].split('&')[0]
                    except Exception:
                        vid = None
                elif 'youtu.be/' in str(link):
                    try:
                        vid = str(link).split('youtu.be/')[1].split('?')[0]
                    except Exception:
                        vid = None
                if vid:
                    thumbnail = f'https://i.ytimg.com/vi/{vid}/hqdefault.jpg'

        if not thumbnail or not str(thumbnail).strip():
            thumbnail = 'https://via.placeholder.com/300x170?text=Course'

        return {
            'title': title,
            'platform': platform,
            'price': c.get('price', '₹0'),
            'link': link,
            'thumbnail': thumbnail,
            'duration': c.get('duration'),
            'relevance_score': c.get('relevance_score')
        }

    # Deduplicate by title+platform and ensure thumbnails/links exist
    seen = set()
    unique_courses = []
    for c in courses:
        nc = normalize_course(c)
        key = (nc.get('title', '').strip().lower(), nc.get('platform', '').strip().lower())
        if key in seen:
            continue
        seen.add(key)
        unique_courses.append(nc)

    if not unique_courses:
        print(f"API keys not configured or API failed. Using fallback courses for '{main_skill}'")
        # Filter COURSE_LISTINGS by skill relevance
        for course in COURSE_LISTINGS:
            if main_skill.lower() in course.get('skills', '').lower():
                unique_courses.append(normalize_course(course))

        # If no skill match, return top fallback courses
        if not unique_courses:
            unique_courses = [normalize_course(c) for c in COURSE_LISTINGS[:3]]

    return unique_courses
    
    return courses


def convert_usd_to_inr(price_usd):
    """Convert USD price to INR"""
    try:
        price = float(price_usd)
        inr = int(price * 83)  # USD to INR approx
        return f"₹{inr}"
    except:
        return "₹0"


def get_youtube_courses(skill):
    """Fetch courses from YouTube API"""
    try:
        url = "https://www.googleapis.com/youtube/v3/search"

        params = {
            "part": "snippet",
            "q": f"{skill} full course",
            "key": YOUTUBE_API_KEY,
            "maxResults": 4,
            "type": "video"
        }

        response = requests.get(url, params=params, timeout=10)
        print(f"YouTube API status: {response.status_code}")
        data = response.json()

        courses = []

        for item in data.get("items", []):
            try:
                video_id = item["id"]["videoId"]
                courses.append({
                    "title": item["snippet"]["title"],
                    "platform": "YouTube",
                    "price": "₹0",
                    "link": f"https://www.youtube.com/watch?v={video_id}",
                    "thumbnail": item["snippet"].get("thumbnails", {}).get("high", {}).get("url") or item["snippet"].get("thumbnails", {}).get("default", {}).get("url") or 'https://via.placeholder.com/300x170?text=YouTube'
                })
            except KeyError:
                continue

        return courses
    except Exception as e:
        print(f"YouTube API Error: {e}")
        return []


def get_udemy_courses(skill):
    """Fetch courses from Udemy API via RapidAPI"""
    try:
        url = "https://udemy-course-scraper-api.p.rapidapi.com/search"

        headers = {
            "X-RapidAPI-Key": RAPIDAPI_KEY,
            "X-RapidAPI-Host": "udemy-course-scraper-api.p.rapidapi.com"
        }

        params = {
            "query": skill
        }

        response = requests.get(url, headers=headers, params=params, timeout=10)
        print(f"Udemy RapidAPI status: {response.status_code}")
        # Dump a small part of response for debugging if non-200
        if response.status_code != 200:
            print("Udemy RapidAPI response:", response.text[:500])
        data = response.json()

        courses = []

        # RapidAPI wrappers sometimes return 'courses' or 'results' or top-level list
        course_list = data.get("courses") or data.get("results") or data.get("data") or []
        for course in course_list[:6]:
            try:
                price_usd = course.get("price", "0")
                courses.append({
                    "title": course.get("title"),
                    "platform": "Udemy",
                    "price": convert_usd_to_inr(price_usd),
                    "link": course.get("url"),
                    "thumbnail": course.get("image_480x270") or course.get("image_240x135") or course.get("image_100x100") or 'https://via.placeholder.com/300x170?text=Udemy'
                })
            except Exception:
                continue

        return courses
    except Exception as e:
        print(f"Udemy API Error: {e}")
        return []