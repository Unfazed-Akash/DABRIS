from flask import Flask, request, jsonify, render_template, session
import pandas as pd
import os
from dotenv import load_dotenv
import uuid
import google.generativeai as genai
from io import StringIO
import contextlib
from itertools import cycle
import google.api_core.exceptions
import time

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
# Secret key is needed for session management
app.secret_key = os.urandom(24)

# --- KEY ROTATION SETUP ---
api_keys_str = os.getenv("GOOGLE_API_KEYS")
if not api_keys_str:
    raise ValueError("GOOGLE_API_KEYS is not set in the .env file.")

API_KEYS = [key.strip() for key in api_keys_str.split(',')]
key_iterator = cycle(API_KEYS)

def configure_gemini():
    """Cycles to the next available API key and configures the client."""
    next_key = next(key_iterator)
    app.logger.info("Switching to a new API key.")
    genai.configure(api_key=next_key)

# Configure the initial key
configure_gemini()
# --- END OF SETUP ---

# --- CORRECT FILE-SAVING LOGIC ---
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
# --- END OF FIX ---


@app.route('/')
def index():
    """Serve the main HTML page."""
    session.clear()
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def handle_upload():
    """Handle CSV file upload by saving it to a temporary file."""
    if 'csvFile' not in request.files:
        return jsonify({'status': 'error', 'message': 'No file part'}), 400

    file = request.files['csvFile']
    if file.filename == '':
        return jsonify({'status': 'error', 'message': 'No selected file'}), 400

    try:
        filename = f"{uuid.uuid4()}.csv"
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
        session['filepath'] = filepath
        
        df = pd.read_csv(filepath)
        
        summary = {
            'status': 'success',
            'filename': file.filename,
            'shape': df.shape
        }
        return jsonify(summary)
    except Exception as e:
        app.logger.error(f"Error during file upload: {e}")
        return jsonify({'status': 'error', 'message': f'Failed to process CSV: {e}'}), 500

@app.route('/analyze', methods=['POST'])
def analyze_query():
    """
    Analyzes the user's query with robust error handling and API key rotation.
    """
    if 'filepath' not in session or not os.path.exists(session['filepath']):
        return jsonify({'response': 'File not found. Please upload a CSV file first.'}), 400

    query = request.json.get('query', '')
    if not query:
        return jsonify({'response': 'Query cannot be empty.'}), 400

    try:
        filepath = session['filepath']
        df = pd.read_csv(filepath)
        df_head = df.head().to_string()

        prompt = f"""
        You are an expert Python data analyst. Your task is to generate a short, executable Python code snippet to answer the user's question about a pandas DataFrame.

        CONTEXT:
        The DataFrame is in a variable named `df`.
        DataFrame head:
        {df_head}

        RULES:
        1. Your code must be robust. If filtering, handle potential missing values (NaN) to avoid errors. For example, use `df['column'].str.contains('value', na=False)`.
        2. The code must end with a `print()` statement for the final answer.
        3. Provide only raw Python code. No explanations, comments, backticks, or the word "python".

        USER'S QUESTION: "{query}"

        PYTHON CODE:
        """

        max_retries = len(API_KEYS) * 2
        for attempt in range(max_retries):
            try:
                # --- THIS IS THE CORRECTED MODEL NAME ---
                model = genai.GenerativeModel('gemini-pro-latest')
                # --- END OF CORRECTION ---

                response = model.generate_content(prompt)
                code_to_execute = response.text.strip()
                
                app.logger.info(f"Generated code:\n{code_to_execute}")

                output_buffer = StringIO()
                with contextlib.redirect_stdout(output_buffer):
                    exec(code_to_execute, {'pd': pd, 'df': df})
                
                answer = output_buffer.getvalue().strip()
                
                return jsonify({'response': answer or "Code executed but produced no output."})

            except google.api_core.exceptions.ResourceExhausted as e:
                app.logger.warning(f"Quota exceeded: {e}. Switching key.")
                configure_gemini()
                if attempt == max_retries - 1:
                    raise e
            except google.api_core.exceptions.FailedPrecondition as e:
                 app.logger.warning(f"Rate limit hit (RPM): {e}. Waiting before retry.")
                 time.sleep(5)

    except Exception as e:
        app.logger.error(f"Final error after retries: {e}")
        error_message = f"I encountered an error: `{e}`. Please try asking in a different way."
        if "quota" in str(e).lower():
            error_message = "I'm sorry, the service is experiencing high demand. Please try again in a moment."
        return jsonify({'response': error_message})

if __name__ == '__main__':
    app.run(debug=True)