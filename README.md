# Intelligent To-Do List

An advanced to-do list application that automatically categorizes tasks using a Python-based NLP service. Built with React for the frontend and a Flask API for the backend, with user authentication and real-time database capabilities provided by Google Firebase.

---

### 🚀 Live Demo

https://beamish-pony-93b71a.netlify.app/

NOTE - Backend instance will spin down with inactivity, which can delay requests by 50 seconds or more.


### 📸 Screenshot

![Intelligent To-Do List Screenshot](https://i.imgur.com/yehkNlw.png)


---

### ✨ Core Features

* **Automatic Task Categorization:** A Python backend with `spaCy` analyzes task descriptions and assigns categories like "Work," "Personal," or "Urgent."
* **Secure Authentication:** Users can sign in securely and easily with their GitHub accounts via Firebase Authentication.
* **Real-Time Database:** Utilizes Firestore to ensure that task updates are reflected instantly across all sessions without needing a refresh.
* **Full CRUD Functionality:** Users can Create, Read, Update (mark as complete), and Delete their tasks.
* **Data Privacy:** Firebase Security Rules ensure that users can only ever access their own to-do items.
* **Responsive Design:** A clean, dark-themed UI built with Tailwind CSS that works seamlessly on desktop and mobile devices.

---

### 🛠️ Tech Stack

* **Frontend:**
    * ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
    * ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
* **Backend:**
    * ![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
    * ![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)
    * ![spaCy](https://img.shields.io/badge/spaCy-09A3D5?style=for-the-badge&logo=spacy&logoColor=white)
* **Database & Authentication:**
    * ![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
* **Deployment:**
    * ![Netlify](https://img.shields.io/badge/Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)
    * ![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)

---

---

### Local Development Setup

To run this project on your local machine, you will need to run the frontend and backend servers in two separate terminals.

#### Backend Setup

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```
2.  **Create and activate a virtual environment:**
    ```bash
    # Create venv
    python -m venv venv

    # Activate on Windows
    .\venv\Scripts\activate

    # Activate on macOS/Linux
    source venv/bin/activate
    ```
3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```
4.  **Run the Flask server:**
    ```bash
    python app.py
    ```
    The backend API will be running at `http://127.0.0.1:5001`.

#### Frontend Setup

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Create an environment file:**
    * Create a file named `.env` in the `frontend` directory.
    * Populate it with your Firebase project configuration keys:
        ```
        REACT_APP_API_KEY="YOUR_API_KEY"
        REACT_APP_AUTH_DOMAIN="YOUR_AUTH_DOMAIN"
        REACT_APP_PROJECT_ID="YOUR_PROJECT_ID"
        REACT_APP_STORAGE_BUCKET="YOUR_STORAGE_BUCKET"
        REACT_APP_MESSAGING_SENDER_ID="YOUR_MESSAGING_SENDER_ID"
        REACT_APP_APP_ID="YOUR_APP_ID"
        ```
4.  **Run the React server:**
    ```bash
    npm start
    ```
    The frontend application will open at `http://localhost:3000`.
