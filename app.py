# app.py
import os
import json
import requests
from flask import Flask, render_template, url_for, request, jsonify

# Load environment variables if using a .env file for local development
from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)

def load_portfolio_data():
    """Loads portfolio data from the portfolio_data.json file."""
    with open('portfolio_data.json', 'r', encoding='utf-8') as f:
        return json.load(f)

# This context processor makes portfolio data available to all templates.
@app.context_processor
def inject_portfolio_data():
    data = load_portfolio_data()
    return dict(
        personal_info=data.get('personal_info', {}),
        skills=data.get('technical_skills', [])
    )

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

    # all_experiences = sorted(work_experiences + volunteer_experiences, key=lambda x: x.get('year', ''), reverse=True)
    all_experiences = volunteer_experiences + work_experiences

    return render_template(
        'index.html',
        all_experiences=all_experiences,
        projects=data.get('personal_projects', []),
        blogs=data.get('blog_posts', []),
        about_me=data.get('about_me', {}),
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
    pre_prompt  = """
You are an AI assistant for [Anon] who is a data scientist.
Imagine yourself as a Jarvis-like assistant for the [Anon] who is integrated to their portfolio website.
You speak like Marcus Aurelius x Jarvis.
You are given the site content below. User is the visiter for the site that will ask you questions about [Anon].
Answer in 1-2 lines max. If output requires more lines, give a summary and point to the particular sections.
Always mention key details (eg. companies with time lines, technologies, project names, etc). \n\nContent:"
"""
    post_prompt = "\nRemeber. 1-2 lines max. Only mention the sections that the user asks. Nothing else."
    prompt = pre_prompt + str(portfolio_data) + post_prompt

    messages = [{"role": "system", "content": prompt}] + history + [{"role": "user", "content": user_input}]

    try:
        response = requests.post(
            'https://api.groq.com/openai/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            },
            json={
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
