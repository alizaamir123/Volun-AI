# Volunteer Management System — React (JavaScript)
## Frontend (React + Vite, TypeScript removed)

bash
cd frontend
npm install
npm run dev


Runs at: http://localhost:5173
Backend URL: set VITE_API_BASE_URL in frontend/.env (default: http://localhost:8000)

## Backend (Python + FastAPI + MySQL)

bash
cd backend
pip install -r requirements.txt
# Configure .env with your MySQL credentials
uvicorn app.main:app --reload


Runs at: http://localhost:8000
API docs: http://localhost:8000/docs

## Admin Credentials
- Email: admin@gmail.com
- Password: aliza123


## Full Stack Web Application Working (Volunteer Management System)

# System Overview
This project is a full-stack web application designed to manage volunteers, organizers, and administrators within an event-based ecosystem. The system is developed using React.js for the frontend, FastAPI for the backend, and SQLite as the database (which can be scaled to MySQL). The architecture follows a client-server model where the frontend communicates with the backend using RESTful APIs. The system is enhanced with AI-based modules that automate resume analysis and candidate evaluation.

# Frontend Layer (React)
The frontend is responsible for user interaction and rendering the user interface. It is built using React.js, which allows component-based architecture and dynamic UI updates. Users interact through forms and dashboards:
-	Registration and Login
-	Event Creation
-	Volunteer Applications
-	Resume Uploads
React communicates with the backend using HTTP methods such as GET, POST, PUT, and DELETE through Axios or Fetch API. The 
UI is role-based:
-	Admin Dashboard: manages users and system
-	Organizer Dashboard: creates events and reviews applicants
-	Volunteer Dashboard: applies to events and uploads resumes

# Backend Layer (FastAPI)
The backend is implemented using FastAPI, which is a high-performance Python framework. It handles business logic, authentication, routing, and AI processing. The main application starts from main.py, where the FastAPI app is initialized and routes are registered.
API Layer (Routing System)
The API layer organizes endpoints into different modules:
-	auth.py: handles login and authentication
-	admin.py: handles admin operations
-	organizer.py: handles event and applicant management
-	volunteers.py: handles volunteer actions
-	events.py: manages event-related data
Each route:
-	Receives request from frontend
-	Validates input
-	Executes logic
-	Interacts with database
-	Returns JSON response

# Authentication & Security
Security is implemented using token-based authentication (JWT). Passwords are hashed before storage. Only authorized users can access protected routes.
Database Layer
The database schema is defined using SQLAlchemy ORM. Tables include: 
-	Users (Admin, Organizer, Volunteer)
-	Events
-	Applications
-	Resumes
The database session is managed efficiently, allowing CRUD operations through Python objects.

# File Handling System
The system allows file uploads:
-	Resumes stored in path /uploads/resumes
-	Profile images stored in path /uploads/profile_images
-	Files are saved on the server and their paths are stored in the database.

# AI Integration Layer
This is the core intelligent part of the system.
a.	Resume Matching:
-	Extracts text from resumes (PDF/DOCX)
-	Identifies skills, experience, keywords
-	Matches with event requirements
-	Generates a matching score
b.	AI Judge:
-	Evaluates candidates based on resume data
-	Ranks applicants
-	Provides recommendation (selected/rejected)
-	Automates decision-making for organizers

# Application Flow (End-to-End)
Step 1: User interacts with frontend
Step 2: Request sent to backend API
Step 3: Backend validates and processes data
Step 4: AI module evaluates (if required)
Step 5: Data stored in database
Step 6: Response returned to frontend
Step 7: UI updates dynamically

# Role-Based Workflow
Volunteer:
-	Registers, logs in, uploads resume, applies to events
Organizer:
-	Creates events, views applicants, uses AI insights
Admin:
-	Manages users and system operations

# Technologies Used
-	Frontend: React.js
-	Backend: FastAPI
-	Database: SQLite (MySQL scalable)
-	ORM: SQLAlchemy
-	AI Processing: Python-based logic
-	File Handling: PDF/DOCX parsing libraries

# Conclusion
This system integrates modern web development with AI-driven decision-making. It automates volunteer recruitment, improves efficiency, and provides a scalable and intelligent platform for event management.