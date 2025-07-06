# app.py
import os
import json
import requests
from flask import Flask, render_template, url_for, request, jsonify
import re

# Load environment variables if using a .env file for local development
from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)

def load_portfolio_data():
    """Loads portfolio data from the portfolio_data.json file."""
    # FIX: Added a try-except block for better error handling if the file is missing or corrupt.
    try:
        with open('portfolio_data.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        # In case of error, return a default structure to prevent crashes.
        return {"personal_info": {}, "technical_skills": []}


# This context processor makes portfolio data available to all templates.
@app.context_processor
def inject_portfolio_data():
    data = load_portfolio_data()
    return dict(
        personal_info=data.get('personal_info', {}),
        skills=data.get('technical_skills', [])
    )

def get_year_from_string(year_string):
    """Extracts the latest year from a string like '2020 - Present' or 'Summer 2019'."""
    if not year_string or 'present' in year_string.lower():
        return float('inf') # Sort 'Present' jobs first
    numbers = re.findall(r'\d{4}', year_string)
    return int(numbers[-1]) if numbers else 0


@app.route('/')
def home():
    """Renders the main portfolio page."""
    data = load_portfolio_data()

    # Combine work and volunteer experience
    work_experiences = data.get('work_experience', [])
    for item in work_experiences:
        item['type'] = 'work'

    volunteer_experiences = data.get('volunteer_experience', [])
    for item in volunteer_experiences:
        item['type'] = 'volunteer'
    
    all_experiences = work_experiences + volunteer_experiences
    all_experiences.sort(key=lambda x: get_year_from_string(x.get('year', '')), reverse=True)


    return render_template(
        'index.html',
        all_experiences=all_experiences,
        projects=data.get('personal_projects', []),
        blogs=data.get('blog_posts', []),
        # FIX: Removed 'about_me' as the section is no longer used.
        education=data.get('education', []),
        certifications=data.get('certifications', [])
    )

@app.route('/chat', methods=['POST'])
def chat():
    """Securely handles the chatbot API call."""
    api_key = os.getenv('GROQ_API_KEY')
    if not api_key:
        return jsonify({'error': {'message': 'API key is not configured on the server.'}}), 500

    data = request.json
    user_input = data.get('message')
    history = data.get('history', [])
    portfolio_data = load_portfolio_data()


    system_prompt = f"""
You are a helpful and stoic AI assistant for the portfolio website of {portfolio_data.get('personal_info', {}).get('name', 'the site owner')}.
You speak like a blend of Marcus Aurelius and Jarvis: concise, wise, and to the point.
You have access to the portfolio's content. Use it to answer user questions about the owner's skills, projects, and experience.
Keep answers to 1-2 lines maximum. If more detail is needed, summarize and direct the user to the relevant section.
---
PORTFOLIO CONTENT:
{json.dumps(portfolio_data)}
---
Answer the user's question based on the content above.
"""

    messages = [{"role": "system", "content": system_prompt}] + history + [{"role": "user", "content": user_input}]

    try:
        response = requests.post(
            'https://api.groq.com/openai/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            },
            json={
                # FIX: Reverted to the user-preferred model.
                'model': 'meta-llama/llama-4-scout-17b-16e-instruct',
                'messages': messages
            }
        )
        response.raise_for_status()  # Raise an exception for bad status codes
        return jsonify(response.json())
    except requests.exceptions.RequestException as e:
        return jsonify({'error': {'message': f'Failed to connect to Groq API: {e}'}}), 500

if __name__ == '__main__':
    app.run(debug=True)
