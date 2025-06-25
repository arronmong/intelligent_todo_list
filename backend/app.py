from flask import Flask, request, jsonify
from flask_cors import CORS
import spacy
from flask_limiter import Limiter  # Import the Limiter
from flask_limiter.util import get_remote_address # To identify users by IP address

# --- Initialization ---
app = Flask(__name__)
# Enable CORS to allow requests from your React frontend
# In a production environment, you should restrict the origin to your frontend's domain
CORS(app) 

# Load the small English spaCy model.
# You'll need to download this model first by running:
# python -m spacy download en_core_web_sm
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    print(
        "Spacy model 'en_core_web_sm' not found. "
        "Please run 'python -m spacy download en_core_web_sm' to download it."
    )
    nlp = None
# --- Rate Limiter Setup ---
# Identify users by their IP address
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["200 per day", "50 per hour"] # Set default limits
)

# --- Keyword-based Categorization Rules ---
# This is a simple rule-based system. It can be expanded with more sophisticated logic.
CATEGORY_KEYWORDS = {
    "Work": ["meeting", "report", "email", "deadline", "project", "presentation", "client"],
    "Personal": ["gym", "doctor", "appointment", "groceries", "shopping", "family"],
    "Urgent": ["urgent", "asap", "immediately", "critical", "now"],
    "Finance": ["bill", "payment", "invoice", "budget", "tax", "bank"],
    "Learning": ["study", "learn", "course", "read", "tutorial", "skill"]
}


# --- API Endpoint ---
@app.route("/categorize-task", methods=["POST"])
@limiter.limit("10 per minute") # Example: Limit to 10 requests per minute per IP
def categorize_task():
    """
    Analyzes the task text from the request and returns a suggested category.
    """
    if not nlp:
        return jsonify({"error": "NLP model is not loaded."}), 500

    data = request.get_json()
    if not data or "text" not in data:
        return jsonify({"error": "Invalid request. 'text' field is required."}), 400

    task_text = data["text"]
    doc = nlp(task_text.lower())

    # --- Categorization Logic ---
    # Check for keywords first
    for category, keywords in CATEGORY_KEYWORDS.items():
        if any(keyword in task_text.lower() for keyword in keywords):
            return jsonify({"category": category})

    # You could add more advanced logic here, like checking for entities (e.g., GPE for places)
    # or analyzing verb patterns.

    # Default category if no keywords are found
    return jsonify({"category": "General"})


# --- Health Check Route ---
@app.route("/")
def index():
    return "NLP Categorization API is running."

# --- Main Execution --- FOR RUNNING LOCALLY
# if __name__ == "__main__":
#     # Runs the Flask app on port 5001 to avoid conflict with the React dev server (often on 3000 or 5173)
#     app.run(debug=True, port=5001)

