# app.py
# Import the Flask framework
from flask import Flask, render_template

# Create an instance of the Flask class
# __name__ is a special Python variable that gets the name of the current module
# It's used here to let Flask know where to look for resources like templates and static files.
app = Flask(__name__)

# --- Mock Data ---
# In a real application, you might load this from a database or a file.
# For now, we'll keep it here for simplicity.

work_experience = [
    {
        "company": "Stark Industries",
        "role": "Lead Data Scientist",
        "location": "New York, NY",
        "year": "2020 - Present",
        "description": [
            "Developed and deployed machine learning models for predictive maintenance on Iron Man suits, reducing material fatigue by 30%.",
            "Led a team of data analysts to optimize arc reactor energy output through advanced statistical modeling.",
            "Created data visualizations for executive-level presentations to Nick Fury and the board."
        ]
    },
    {
        "company": "Wayne Enterprises",
        "role": "Data Science Intern",
        "location": "Gotham City",
        "year": "Summer 2019",
        "description": [
            "Analyzed crime data to identify patterns and assist in the strategic deployment of vigilante resources.",
            "Worked on sentiment analysis of news articles related to the company's public image.",
            "Assisted in the development of a real-time data pipeline for tracking company assets."
        ]
    }
]

volunteer_experience = [
    {
        "company": "S.P.E.W.",
        "role": "Data Volunteer",
        "location": "Hogwarts",
        "year": "2018 - 2019",
        "description": [
            "Analyzed census data of house-elf populations to advocate for better working conditions.",
            "Created dashboards to track the distribution of socks and other clothing items.",
            "Used natural language processing to analyze texts for pro-elf sentiment."
        ]
    }
]

personal_projects = [
    {"title": "Project Chimera", "category": "NLP", "link": "#"},
    {"title": "Project Griffin", "category": "Computer Vision", "link": "#"},
    {"title": "Project Hydra", "category": "LLM", "link": "#"},
    {"title": "Project Cerberus", "category": "Red Team", "link": "#"},
    {"title": "Project Phoenix", "category": "NLP", "link": "#"},
    {"title": "Project Basilisk", "category": "Computer Vision", "link": "#"},
    {"title": "Project Pegasus", "category": "LLM", "link": "#"},
    {"title": "Project Kraken", "category": "Red Team", "link": "#"},
    {"title": "Project Wyvern", "category": "NLP", "link": "#"},
    {"title": "Project Sphinx", "category": "Computer Vision", "link": "#"},
    {"title": "Project Manticore", "category": "LLM", "link": "#"},
    {"title": "Project Leviathan", "category": "Red Team", "link": "#"},
]

blog_posts = [
    {
        "title": "The Art of Feature Engineering",
        "date": "October 26, 2023",
        "link": "#",
        "summary": "A deep dive into creating impactful features from raw data. We explore techniques from polynomial features to interaction terms and beyond."
    },
    {
        "title": "Understanding Transformer Architectures",
        "date": "September 15, 2023",
        "link": "#",
        "summary": "Breaking down the self-attention mechanism and positional encodings that make Transformers the state-of-the-art in NLP."
    },
    {
        "title": "Deploying Models with Flask and Docker",
        "date": "August 02, 2023",
        "link": "#",
        "summary": "A practical, step-by-step guide to containerizing a machine learning model and serving it via a REST API for production use."
    }
]

technical_skills = [
    "Python", "PyTorch", "TensorFlow", "Scikit-learn", "Pandas", "NumPy", "Matplotlib",
    "SQL", "PostgreSQL", "Spark", "AWS", "GCP", "Azure", "Docker", "Kubernetes",
    "Flask", "JavaScript", "HTML5", "CSS3", "Git", "Jira", "Linux", "Terraform", "CI/CD"
]


# This is the main route for your website.
@app.route('/')
def home():
    """
    Renders the main portfolio page.
    """
    return render_template(
        'index.html',
        work_experiences=work_experience,
        volunteer_experiences=volunteer_experience,
        projects=personal_projects,
        blogs=blog_posts,
        skills=technical_skills
    )

if __name__ == '__main__':
    app.run(debug=True)
