import joblib
import numpy as np
import os

# Load model
MODEL_PATH = '/app/backend/models/career_model.joblib'

def load_model():
    if os.path.exists(MODEL_PATH):
        return joblib.load(MODEL_PATH)
    return None

def predict_career_success(age, experience_years, education_level, num_skills, location_tier, job_changes):
    model = load_model()
    if model is None:
        return None
    
    # Prepare input
    X = np.array([[age, experience_years, education_level, num_skills, location_tier, job_changes]])
    
    # Predict probability
    prob = model.predict_proba(X)[0][1] * 100
    
    # Get feature importance
    feature_names = ['age', 'experience_years', 'education_level', 'num_skills', 'location_tier', 'job_changes']
    feature_values = [age, experience_years, education_level, num_skills, location_tier, job_changes]
    importances = model.feature_importances_
    
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
