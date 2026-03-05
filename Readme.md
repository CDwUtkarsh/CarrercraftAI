# 🚀 CareerCraftAI

### Intelligent Career Guidance & AI Recommendation Platform

CareerCraftAI is a full-stack AI-powered career guidance platform that analyzes resumes, predicts career success, provides personalized learning and job recommendations, and delivers real-time insights through an intelligent dashboard and AI chatbot.

The platform integrates **Machine Learning, NLP, secure authentication, and external data sources** to create a production-ready career assistance system.

---

## 🧠 Core Features

### 1️⃣ Career Success Predictor (Machine Learning)

**Model:** RandomForestClassifier (scikit-learn)

**Predicts career success probability based on:**

- Education
- Experience
- Skills
- Career transitions
- Profile attributes

**Provides:**

- Success score (0–100%)
- Key influencing factors
- Personalized recommendations

Designed for nonlinear real-world career data using ensemble learning.

---

### 2️⃣ AI Resume Validator (NLP + ML)

An intelligent resume analysis system that processes PDF resumes and generates structured feedback.

**Capabilities:**

- PDF Resume Parsing (PyPDF2)
- Skill Extraction using NLP
- ATS Compatibility Scoring
- Readability Analysis
- Sentiment Analysis
- AI-based Resume Score (Random Forest)
- Automated Improvement Suggestions

**Resume Analysis Pipeline:**

```
Resume Upload → Text Extraction → NLP Feature Engineering
→ Random Forest Scoring → AI Feedback
```

---

### 3️⃣ Intelligent Course & Learning Recommendation System

- Skill-based recommendation engine
- Personalized course suggestions
- Dynamic learning path generation
- Skill gap analysis with timeline estimation
- Context-aware recommendations

---

### 4️⃣ AI Chatbot (Career Assistant)

Provides:

- Career guidance
- Skill improvement suggestions
- Resume-related queries support
- Learning path advice
- Contextual assistance based on user profile

Transforms the platform into an interactive AI career mentor.

---

### 5️⃣ Secure Authentication System (JWT + MongoDB)

- Email & Password authentication
- JWT authorization
- Password hashing using bcrypt
- Secure session handling
- Protected API routes
- MongoDB storage (Motor async driver)

---

### 6️⃣ AI Analytics Dashboard

Displays:

- Resume strength insights
- Job readiness score
- Skills intelligence overview
- Learning progress indicators
- Historical resume analysis

All insights are generated from real user data.

---

## 🏗 System Architecture

```
Frontend (React + Tailwind)
        ↓
FastAPI Backend (REST APIs)
        ↓
NLP Layer
        ↓
ML Layer (Random Forest Models)
        ↓
Recommendation Engine + Chatbot
        ↓
MongoDB Database
```

---

## 🛠 Tech Stack

### 🔙 Backend

- FastAPI
- scikit-learn
- NLTK & TextBlob
- PyPDF2
- MongoDB (Motor Async Driver)
- python-jose (JWT)
- bcrypt
- Joblib
- Pydantic

### 🎨 Frontend

- React (Vite)
- Tailwind CSS
- Shadcn UI
- Axios
- React Router
- Recharts

---

## 📊 API Endpoints

### Authentication

```
POST /api/auth/signup
POST /api/auth/login
```

### Core AI Features

```
POST /api/analyze_resume
POST /api/predict
GET  /api/dashboard
POST /api/recommend_jobs
POST /api/learning_path
POST /api/chat
```

All protected routes require JWT token in Authorization header.

---

## 📁 Project Structure

```
CareerCraftAI/
│
├── backend/
│   ├── server.py
│   ├── ml_model.py
│   ├── nlp_utils.py
│   ├── recommendation_engine.py
│   ├── models/
│   ├── data/
│   ├── requirements.txt
│   └── .env
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   ├── components/
    │   └── services/
    ├── package.json
    └── .env
```

---

## ⚙ Setup Instructions

### Prerequisites

- Python 3.10+
- Node.js 18+
- MongoDB (Local or Cloud)

---

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn server:app --reload
```

---

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:3000  
Backend: http://localhost:8000

---

## 💾 Environment Variables

### Backend (.env)

```
MONGO_URL=your_mongodb_connection
DB_NAME=careercraft
JWT_SECRET_KEY=your_secret_key
```

### Frontend (.env)

```
VITE_BACKEND_URL=http://localhost:8000
```

---

## 🚀 Future Enhancements

- Advanced LLM-based career mentor
- Real-time job market analytics
- Resume auto-optimization using AI
- Skill trend prediction models
- Mobile application (React Native)
- Multi-language resume analysis

---

## 👨‍💻 Author

Utkarsh Tiwari & Sahil Vishwakarma  
AI/ML & Full Stack Developers

---

## ⭐ Project Significance

This project demonstrates production-level integration of:

- Machine Learning (Random Forest)
- Natural Language Processing
- Secure Authentication (JWT + MongoDB)
- Full-Stack Development (React + FastAPI)
