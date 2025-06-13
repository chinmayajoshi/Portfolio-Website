# app.py
# Import the Flask framework and the json module
from flask import Flask, render_template, url_for
import json

# Create an instance of the Flask class
app = Flask(__name__)

def load_portfolio_data():
    """
    Loads portfolio data from the portfolio_data.json file.
    """
    with open('portfolio_data.json', 'r') as f:
        return json.load(f)

# This context processor makes the portfolio data available to all templates.
# This is useful for the interactive terminal and other shared elements.
@app.context_processor
def inject_portfolio_data():
    data = load_portfolio_data()
    return dict(
        personal_info=data.get('personal_info', {}),
        skills=data.get('technical_skills', [])
    )

# This is the main route for your website.
@app.route('/')
def home():
    """
    Renders the main portfolio page by loading data from the JSON file.
    """
    data = load_portfolio_data()
    return render_template(
        'index.html',
        work_experiences=data.get('work_experience', []),
        volunteer_experiences=data.get('volunteer_experience', []),
        projects=data.get('personal_projects', []),
        blogs=data.get('blog_posts', [])
        # personal_info and skills are already available via the context processor
    )

if __name__ == '__main__':
    app.run(debug=True)
