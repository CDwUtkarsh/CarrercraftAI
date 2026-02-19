import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
import joblib
import os

# Create synthetic career data
np.random.seed(42)
n_samples = 1000

# Generate synthetic data
data = {
    'age': np.random.randint(22, 55, n_samples),
    'experience_years': np.random.randint(0, 25, n_samples),
    'education_level': np.random.randint(1, 5, n_samples),  # 1=HS, 2=Bachelor, 3=Master, 4=PhD
    'num_skills': np.random.randint(2, 15, n_samples),
    'location_tier': np.random.randint(1, 4, n_samples),  # 1=Tier1, 2=Tier2, 3=Tier3
    'job_changes': np.random.randint(0, 8, n_samples),
}

# Create target (success probability based on features)
df = pd.DataFrame(data)
success_score = (
    (df['experience_years'] * 0.3) +
    (df['education_level'] * 15) +
    (df['num_skills'] * 2) +
    ((4 - df['location_tier']) * 8) +
    np.random.normal(0, 10, n_samples)
)

# Normalize to 0-1
df['success'] = ((success_score - success_score.min()) / 
                 (success_score.max() - success_score.min()) > 0.6).astype(int)

# Save dataset
os.makedirs('/app/backend/data', exist_ok=True)
df.to_csv('/app/backend/data/career_data.csv', index=False)

# Train model
X = df[['age', 'experience_years', 'education_level', 'num_skills', 'location_tier', 'job_changes']]
y = df['success']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)
model.fit(X_train, y_train)

accuracy = model.score(X_test, y_test)
print(f"Model accuracy: {accuracy:.2f}")

# Save model
os.makedirs('/app/backend/models', exist_ok=True)
joblib.dump(model, '/app/backend/models/career_model.joblib')
print("Model saved to /app/backend/models/career_model.joblib")
