import re
from textblob import TextBlob
import nltk

# Download required NLTK data (run once)
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt', quiet=True)

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords', quiet=True)

from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize

# Common technical skills
COMMON_SKILLS = [
    'python', 'java', 'javascript', 'react', 'angular', 'vue', 'node',
    'sql', 'mongodb', 'aws', 'azure', 'docker', 'kubernetes',
    'machine learning', 'ai', 'data science', 'analytics',
    'project management', 'agile', 'scrum', 'leadership',
    'communication', 'problem solving', 'teamwork'
]

# Biased words to detect
BIASED_WORDS = [
    'he', 'she', 'him', 'her', 'his', 'hers', 'male', 'female',
    'boy', 'girl', 'man', 'woman', 'gentleman', 'lady'
]

def extract_skills(text):
    """Extract skills from resume text"""
    text_lower = text.lower()
    found_skills = []
    for skill in COMMON_SKILLS:
        if skill in text_lower:
            found_skills.append(skill)
    return list(set(found_skills))

def sentiment_analysis(text):
    """Analyze sentiment of resume text"""
    blob = TextBlob(text)
    polarity = blob.sentiment.polarity
    
    if polarity > 0.1:
        sentiment = 'positive'
    elif polarity < -0.1:
        sentiment = 'negative'
    else:
        sentiment = 'neutral'
    
    return {
        'sentiment': sentiment,
        'polarity': round(polarity, 2)
    }

def detect_bias(text):
    """Detect gendered or biased language"""
    text_lower = text.lower()
    found_bias = []
    
    for word in BIASED_WORDS:
        if re.search(r'\b' + word + r'\b', text_lower):
            found_bias.append(word)
    
    return list(set(found_bias))

def calculate_readability(text):
    """Calculate Flesch Reading Ease score"""
    try:
        # Flesch Reading Ease = 206.835 - 1.015 * (words/sentences) - 84.6 * (syllables/words)
        sentences = text.split('.')
        words = text.split()
        
        if len(sentences) == 0 or len(words) == 0:
            return 0
        
        # Simplified syllable count
        syllables = sum([max(1, len(re.findall(r'[aeiou]+', word.lower()))) for word in words])
        
        avg_words_per_sentence = len(words) / max(1, len(sentences))
        avg_syllables_per_word = syllables / len(words)
        
        flesch_score = 206.835 - 1.015 * avg_words_per_sentence - 84.6 * avg_syllables_per_word
        flesch_score = max(0, min(100, flesch_score))
        
        return round(flesch_score, 2)
    except:
        return 50.0

def calculate_ats_score(text, skills):
    """Calculate ATS compatibility score"""
    score = 50  # Base score
    
    # Bonus for skills
    score += min(30, len(skills) * 3)
    
    # Bonus for keywords
    keywords = ['experience', 'project', 'managed', 'led', 'developed', 'achieved', 'improved']
    text_lower = text.lower()
    keyword_count = sum([1 for kw in keywords if kw in text_lower])
    score += min(20, keyword_count * 3)
    
    # Ensure score is between 0-100
    score = max(0, min(100, score))
    
    return round(score, 2)

def analyze_resume(text):
    """Complete resume analysis"""
    skills = extract_skills(text)
    sentiment = sentiment_analysis(text)
    bias = detect_bias(text)
    readability = calculate_readability(text)
    ats_score = calculate_ats_score(text, skills)
    
    # Generate improvement tips
    tips = []
    if len(skills) < 5:
        tips.append("Add more specific technical skills")
    if readability < 50:
        tips.append("Simplify language for better readability")
    if ats_score < 70:
        tips.append("Include more action verbs and achievements")
    if len(bias) > 0:
        tips.append("Remove gendered language to avoid bias")
    if sentiment['sentiment'] == 'negative':
        tips.append("Use more positive, achievement-focused language")
    
    if not tips:
        tips = ["Great resume! Consider adding quantifiable achievements"]
    
    return {
        'skills': skills,
        'sentiment': sentiment['sentiment'],
        'readability_score': readability,
        'ats_score': ats_score,
        'bias_detected': bias,
        'improvement_tips': tips
    }
