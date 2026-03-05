from sklearn.ensemble import RandomForestRegressor
import numpy as np
import joblib
import os

MODEL_PATH = "models/resume_rf_model.pkl"
CAREER_MODEL_PATH = "models/career_model.pkl"

def train_resume_model():
    """Train Random Forest model for resume scoring"""
    # Training data: [word_count, skills, projects, education, experience, certifications]
    X_train = [
        [700, 10, 1, 1, 1, 1],  # Excellent resume
        [500, 8, 1, 1, 1, 0],   # Strong
        [350, 6, 1, 1, 0, 0],   # Good
        [200, 3, 0, 1, 0, 0],   # Average
        [120, 1, 0, 0, 0, 0]    # Weak
    ]

    # Resume Score (0–100)
    y_train = [95, 85, 70, 50, 30]

    model = RandomForestRegressor(n_estimators=200, random_state=42)
    model.fit(X_train, y_train)

    os.makedirs("models", exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    return model


def train_career_model():
    """Train Random Forest model for career success prediction"""
    # Training data: [age, experience_years, education_level, num_skills, location_tier, job_changes]
    X_train = [
        [28, 5, 3, 10, 1, 1],  # High success
        [25, 3, 2, 7, 1, 0],   # Good success
        [32, 8, 3, 12, 1, 2],  # Very high success
        [22, 1, 1, 3, 2, 0],   # Moderate success
        [40, 10, 2, 8, 2, 5],  # Lower success (many job changes)
        [35, 7, 3, 9, 1, 1],   # High success
        [26, 4, 2, 6, 2, 0],   # Good success
        [30, 6, 2, 8, 1, 2],   # High success
        [23, 2, 1, 4, 3, 1],   # Moderate success
        [38, 12, 3, 11, 1, 1]  # Very high success
    ]

    # Success probability (0-100)
    y_train = [85, 72, 90, 60, 55, 88, 75, 83, 65, 92]

    model = RandomForestRegressor(n_estimators=200, random_state=42)
    model.fit(X_train, y_train)

    os.makedirs("models", exist_ok=True)
    joblib.dump(model, CAREER_MODEL_PATH)
    return model


def load_model():
    if os.path.exists(CAREER_MODEL_PATH):
        return joblib.load(CAREER_MODEL_PATH)
    else:
        return train_career_model()


def load_resume_model():
    if os.path.exists(MODEL_PATH):
        return joblib.load(MODEL_PATH)
    else:
        return train_resume_model()


# Initialize models at module load
rf_model = load_resume_model()
career_model = load_model()


def predict_resume_score(features):
    """Predict resume score using Random Forest model"""
    features = np.array(features).reshape(1, -1)
    score = rf_model.predict(features)[0]
    return round(float(score), 2)

def predict_career_success(age, experience_years, education_level, num_skills, location_tier, job_changes):
    """Predict career success probability using Random Forest model"""
    if career_model is None:
        return None
    
    # Prepare input
    X = np.array([[age, experience_years, education_level, num_skills, location_tier, job_changes]])
    
    # Predict probability
    prob = career_model.predict(X)[0]
    prob = max(0, min(100, prob))  # Clamp to 0-100 range
    
    # Get feature importance
    feature_names = ['age', 'experience_years', 'education_level', 'num_skills', 'location_tier', 'job_changes']
    feature_values = [age, experience_years, education_level, num_skills, location_tier, job_changes]
    importances = career_model.feature_importances_
    
    # Get top 3 factors
    top_indices = np.argsort(importances)[::-1][:3]
    top_factors = [feature_names[i] for i in top_indices]
    
    # Generate recommendations
    recommendations = []
    if num_skills < 8:
        recommendations.append("Expand your skill set to increase market value")
    if experience_years < 5:
        recommendations.append("Gain more hands-on experience through projects")
    if education_level < 3:
        recommendations.append("Consider advanced certifications or degrees")
    if job_changes > 5:
        recommendations.append("Show stability in your next role")
    
    if not recommendations:
        recommendations = ["You're on a great track! Keep building expertise in your domain"]
    
    return {
        'success_probability': round(prob, 2),
        'top_factors': top_factors,
        'recommendations': recommendations
    }
