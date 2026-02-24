🚀 CareerCraftAI – Intelligent Career Guidance & AI Recommendation Platform

CareerCraftAI is a full-stack AI-powered career guidance platform that analyzes resumes, predicts career success, provides personalized learning and job recommendations, and delivers real-time insights through an intelligent dashboard and AI chatbot.

The platform integrates Machine Learning, NLP, secure authentication, and external data sources to create a production-ready career assistance system.

🧠 Core Features
1️⃣ Career Success Predictor (Machine Learning)

Model: RandomForestClassifier (scikit-learn)

Predicts career success probability based on:

Education

Experience

Skills

Career transitions

Profile attributes

Provides:

Success score (0–100%)

Key influencing factors

Personalized recommendations

Designed for nonlinear real-world career data using ensemble learning.

2️⃣ AI Resume Validator (NLP + ML)

An intelligent resume analysis system that processes PDF resumes and generates structured feedback.

Capabilities:

PDF Resume Parsing (PyPDF2)

Skill Extraction using NLP patterns

ATS Compatibility Scoring

Readability Analysis

Sentiment Analysis

AI-based Resume Score using Random Forest

Automated Improvement Suggestions

Resume Analysis Pipeline:
Resume Upload → Text Extraction → NLP Feature Engineering → Random Forest Scoring → AI Feedback
3️⃣ Intelligent Course & Learning Recommendation System

Skill-based recommendation engine

Personalized course suggestions aligned with detected skills

Dynamic learning path generation

Skill gap analysis with timeline estimation

Context-aware recommendations based on user profile and resume analysis

4️⃣ AI Chatbot (Career Assistant)

Integrated AI chatbot that provides:

Career guidance

Skill improvement suggestions

Resume-related queries support

Learning path advice

Contextual assistance based on user profile data

This enhances user engagement and transforms the platform into an interactive AI career mentor.

5️⃣ Secure Authentication System (JWT + MongoDB)

Email & Password based authentication

JWT (JSON Web Token) authorization

Password hashing using bcrypt

Secure session handling

User data stored in MongoDB (Motor async driver)

Protected API routes with token validation

6️⃣ AI Analytics Dashboard (Real Insights)

Dynamic dashboard that displays:

Resume strength insights

Job readiness score

Skills intelligence overview

Learning progress indicators

Personalized career analytics

Historical resume analysis (stored in database)

All insights are generated from real user data, not static placeholders.

🏗️ System Architecture
Frontend (React + Tailwind)
↓
FastAPI Backend (REST APIs)
↓
NLP Layer (Resume Parsing & Skill Extraction)
↓
ML Layer (Random Forest Models)
↓
Recommendation Engine + Chatbot Logic
↓
MongoDB Database (User, Auth, Analytics)
🛠️ Tech Stack
🔙 Backend

FastAPI (Async Python Framework)

scikit-learn (Machine Learning Models)

NLTK & TextBlob (Natural Language Processing)

PyPDF2 (PDF Resume Parsing)

MongoDB (Motor Async Driver)

JWT Authentication (python-jose)

bcrypt (Password Hashing)

Joblib (Model Persistence)

Pydantic (Data Validation)

🎨 Frontend

React (Vite)

Tailwind CSS (Modern UI Styling)

Shadcn UI Components

Axios (API Integration)

React Router (Navigation)

Recharts (Analytics Visualization)

🔐 Authentication & Security

JWT-based secure authentication

Encrypted password storage (bcrypt hashing)

Token-protected API endpoints

CORS configured for secure cross-origin requests

Environment-based secret management (.env)

MongoDB secure user data storage

📁 Project Structure
CareerCraftAI/
├── backend/
│ ├── server.py # FastAPI application entry point
│ ├── ml_model.py # Random Forest ML models
│ ├── nlp_utils.py # NLP & resume parsing utilities
│ ├── recommendation_engine.py # Recommendation logic
│ ├── models/ # Saved ML models
│ ├── data/ # Training datasets
│ ├── requirements.txt
│ └── .env
│
└── frontend/
├── src/
│ ├── pages/
│ │ ├── Dashboard.jsx
│ │ ├── ResumeValidator.jsx
│ │ ├── CareerPredictor.jsx
│ │ ├── JobsLearning.jsx
│ │ └── Login.jsx
│ ├── components/
│ └── services/
├── package.json
└── .env
📊 API Endpoints
Authentication

POST /api/auth/signup – User registration (Email & Password)

POST /api/auth/login – User login (JWT token generation)

Core AI Features

POST /api/analyze_resume – Resume analysis + AI scoring + recommendations

POST /api/predict – Career success prediction

GET /api/dashboard – AI-driven dashboard insights

POST /api/recommend_jobs – Job recommendations

POST /api/learning_path – Personalized learning roadmap

POST /api/chat – AI chatbot interaction

All protected routes require JWT token in Authorization header.

🤖 Machine Learning Methodology
Resume Scoring Model

Model: RandomForestRegressor

Inputs: Resume-derived NLP features

Output: Resume Score (0–100)

Advantage: Robust handling of nonlinear and noisy resume data.

Career Prediction Model

Model: RandomForestClassifier

Ensemble-based prediction for higher accuracy and stability

Feature importance used for explainable AI insights.

🧪 Key Functional Testing

User authentication (JWT + MongoDB)

Resume PDF parsing & analysis

ML model predictions

Chatbot interaction

Skill extraction accuracy

Dashboard analytics rendering

API integration & routing

End-to-end frontend-backend communication

⚙️ Setup Instructions
Prerequisites

Python 3.10+

Node.js 18+

MongoDB (Local or Cloud)

Backend Setup
cd backend
pip install -r requirements.txt
uvicorn server:app --reload
Frontend Setup
cd frontend
npm install
npm run dev

Frontend: http://localhost:3000

Backend: http://localhost:8000

💾 Environment Variables
Backend (.env)
MONGO_URL=your_mongodb_connection
DB_NAME=careercraft
JWT_SECRET_KEY=your_secret_key
Frontend (.env)
VITE_BACKEND_URL=http://localhost:8000
🚀 Future Enhancements

Advanced LLM-based career mentor

Real-time job market analytics

Resume auto-optimization using AI

Skill trend prediction models

Mobile application (React Native)

Multi-language resume analysis

👨‍💻 Author

Utkarsh Tiwari & Sahil Vishwakarma
AI/ML & Full Stack Developer
Project: CareerCraftAI – Intelligent Career Guidance Platform

⭐ Project Significance

This project demonstrates a production-level integration of:

Machine Learning (Random Forest)

Natural Language Processing

Secure Authentication (JWT + MongoDB)

Full-Stack Development (React + FastAPI)
