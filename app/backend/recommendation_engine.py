from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

# Sample job listings
JOB_LISTINGS = [
    {'id': 1, 'title': 'Senior Software Engineer', 'company': 'TechCorp', 'location': 'San Francisco', 
     'skills': 'python javascript react aws docker', 'salary': '120k-180k'},
    {'id': 2, 'title': 'Data Scientist', 'company': 'DataAI Inc', 'location': 'New York', 
     'skills': 'python machine learning sql data science', 'salary': '100k-150k'},
    {'id': 3, 'title': 'Frontend Developer', 'company': 'WebStudio', 'location': 'Remote', 
     'skills': 'javascript react vue css html', 'salary': '80k-120k'},
    {'id': 4, 'title': 'DevOps Engineer', 'company': 'CloudSys', 'location': 'Seattle', 
     'skills': 'aws azure docker kubernetes linux', 'salary': '110k-160k'},
    {'id': 5, 'title': 'Full Stack Developer', 'company': 'StartupX', 'location': 'Austin', 
     'skills': 'python javascript react node mongodb', 'salary': '90k-140k'},
    {'id': 6, 'title': 'ML Engineer', 'company': 'AI Solutions', 'location': 'Boston', 
     'skills': 'python machine learning ai tensorflow pytorch', 'salary': '130k-190k'},
    {'id': 7, 'title': 'Project Manager', 'company': 'ConsultPro', 'location': 'Chicago', 
     'skills': 'project management agile scrum leadership', 'salary': '95k-145k'},
    {'id': 8, 'title': 'Backend Developer', 'company': 'ApiMasters', 'location': 'Denver', 
     'skills': 'java python sql mongodb aws', 'salary': '85k-135k'},
]

# Sample course listings
COURSE_LISTINGS = [
    {'id': 1, 'title': 'Complete Python Bootcamp', 'platform': 'Udemy', 'duration': '40 hours', 
     'price': '$89', 'skills': 'python programming basics'},
    {'id': 2, 'title': 'React - The Complete Guide', 'platform': 'Udemy', 'duration': '48 hours', 
     'price': '$99', 'skills': 'react javascript frontend'},
    {'id': 3, 'title': 'Machine Learning Specialization', 'platform': 'Coursera', 'duration': '3 months', 
     'price': '$49/month', 'skills': 'machine learning ai python'},
    {'id': 4, 'title': 'AWS Certified Solutions Architect', 'platform': 'Udemy', 'duration': '30 hours', 
     'price': '$109', 'skills': 'aws cloud docker'},
    {'id': 5, 'title': 'Data Science Professional Certificate', 'platform': 'Coursera', 'duration': '6 months', 
     'price': '$49/month', 'skills': 'data science sql python analytics'},
    {'id': 6, 'title': 'Project Management Professional', 'platform': 'Udemy', 'duration': '35 hours', 
     'price': '$79', 'skills': 'project management agile leadership'},
]

def recommend_jobs(user_skills, top_n=5):
    """Recommend jobs based on user skills using TF-IDF similarity"""
    if not user_skills:
        return []
    
    # Prepare documents
    user_profile = ' '.join(user_skills)
    job_profiles = [job['skills'] for job in JOB_LISTINGS]
    all_documents = [user_profile] + job_profiles
    
    # TF-IDF vectorization
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(all_documents)
    
    # Calculate cosine similarity
    user_vector = tfidf_matrix[0:1]
    job_vectors = tfidf_matrix[1:]
    similarities = cosine_similarity(user_vector, job_vectors)[0]
    
    # Get top N jobs
    top_indices = np.argsort(similarities)[::-1][:top_n]
    
    recommendations = []
    for idx in top_indices:
        job = JOB_LISTINGS[idx].copy()
        job['match_score'] = round(similarities[idx] * 100, 2)
        recommendations.append(job)
    
    return recommendations

def recommend_courses(user_skills, target_skills, budget_max=200, top_n=5):
    """Recommend courses based on skill gap"""
    # Calculate skill gap
    missing_skills = [skill for skill in target_skills if skill not in user_skills]
    
    if not missing_skills:
        missing_skills = ['advanced programming', 'leadership']
    
    # Prepare documents
    gap_profile = ' '.join(missing_skills)
    course_profiles = [course['skills'] for course in COURSE_LISTINGS]
    all_documents = [gap_profile] + course_profiles
    
    # TF-IDF vectorization
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(all_documents)
    
    # Calculate cosine similarity
    gap_vector = tfidf_matrix[0:1]
    course_vectors = tfidf_matrix[1:]
    similarities = cosine_similarity(gap_vector, course_vectors)[0]
    
    # Get top N courses
    top_indices = np.argsort(similarities)[::-1][:top_n]
    
    recommendations = []
    for idx in top_indices:
        course = COURSE_LISTINGS[idx].copy()
        course['relevance_score'] = round(similarities[idx] * 100, 2)
        recommendations.append(course)
    
    return recommendations

def generate_learning_path(user_skills, target_role):
    """Generate personalized learning path"""
    # Define role requirements
    role_requirements = {
        'software_engineer': ['python', 'javascript', 'react', 'sql', 'aws'],
        'data_scientist': ['python', 'machine learning', 'sql', 'data science', 'analytics'],
        'frontend_developer': ['javascript', 'react', 'vue', 'css', 'html'],
        'devops_engineer': ['aws', 'docker', 'kubernetes', 'linux', 'azure'],
        'ml_engineer': ['python', 'machine learning', 'ai', 'tensorflow', 'pytorch'],
    }
    
    required_skills = role_requirements.get(target_role.lower().replace(' ', '_'), [])
    missing_skills = [skill for skill in required_skills if skill not in user_skills]
    
    # Generate path
    learning_path = {
        'target_role': target_role,
        'current_skills': user_skills,
        'required_skills': required_skills,
        'skill_gap': missing_skills,
        'estimated_timeline': f"{len(missing_skills) * 2} weeks",
        'recommended_courses': recommend_courses(user_skills, required_skills, top_n=3)
    }
    
    return learning_path
