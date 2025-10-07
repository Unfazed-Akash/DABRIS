# ✨ DABRIS - AI-Powered Data Analyst

**DABRIS** is a full-stack web application that allows you to upload any CSV file and perform complex data analysis through a simple, conversational chat interface. Powered by Google's Gemini API, it translates natural language questions into executable Python code to provide instant insights.

**Live Demo:** **[https://dabris.onrender.com/](https://dabris.onrender.com/)**

---

![DABRIS Screenshot]
*(**Note:** You should take a screenshot of your live application and replace the link above. You can upload your image to a site like [Imgur](https://imgur.com/upload) to get a URL.)*

## 🚀 About The Project

This project started as a simple college assignment and evolved into a robust AI tool. The initial goal was to analyze a fixed dataset, but the vision expanded: what if anyone could bring their own data and get answers? DABRIS is the result of that vision. It bridges the gap between complex datasets and human curiosity, making data science accessible to everyone.

The application is built with a Python/Flask backend that intelligently handles API key rotation to manage usage quotas, and a polished, responsive frontend built with HTML, CSS, and JavaScript.

## 🌟 Features

* **Interactive Chat Interface:** Ask questions about your data in plain English.
* **Dynamic CSV Upload:** Analyze any CSV file you have, on the fly.
* **AI-Powered Code Generation:** Leverages the Google Gemini API to generate and execute Python (Pandas) code.
* **Robust API Key Rotation:** Automatically cycles through a pool of API keys to handle rate limits and daily quotas gracefully.
* **Modern Frontend:** A sleek, responsive UI with a dark/light theme toggle and smooth animations.
* **Secure & Stateless:** Built with security best practices and designed to work on modern cloud platforms.

## 🛠️ Tech Stack

This project was built using the following technologies:

* **Backend:** Python, Flask, Gunicorn
* **AI:** Google Gemini API
* **Data Handling:** Pandas
* **Frontend:** HTML, CSS, JavaScript
* **Deployment:** Render

## ⚙️ Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

* Python 3.8+
* pip (Python package installer)

### Installation

1.  **Clone the repository:**
    ```sh
    git clone [https://github.com/Unfazed-Akash/DABRIS.git](https://github.com/Unfazed-Akash/DABRIS.git)
    cd DABRIS
    ```

2.  **Create and activate a virtual environment:**
    * On Windows:
        ```sh
        python -m venv .venv
        .\.venv\Scripts\activate
        ```
    * On macOS/Linux:
        ```sh
        python3 -m venv .venv
        source .venv/bin/activate
        ```

3.  **Install the required packages:**
    ```sh
    pip install -r requirements.txt
    ```

4.  **Set up your environment variables:**
    * Create a file named `.env` in the root of your project directory.
    * Generate 4-5 free API keys from Google AI Studio.
    * Add them to your `.env` file in the following format (one line, no spaces):
        ```
        GOOGLE_API_KEYS=key1,key2,key3,key4,key5
        ```

5.  **Run the Flask application:**
    ```sh
    flask run
    ```
    Open [http://127.0.0.1:5000](http://127.0.0.1:5000) in your browser to see the app running.

## 📝 Note on API Usage

This application uses the free tier of the Google Gemini API, which has a **Requests Per Minute (RPM)** and **Requests Per Day (RPD)** limit for each key. The built-in key rotation system helps manage this, but if the app experiences high traffic, you might see a "high demand" message. The quota will automatically reset. Thank you for your understanding!

## 🙏 Acknowledgements

* A huge thank you to my teacher, **Dr. Mritunjay Rai**, for providing the initial project idea and encouraging me to explore beyond the original scope.
* The amazing open-source libraries that made this project possible.

---
