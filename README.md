# Student Management System — Microservices Architecture

## Project Overview
A Student Management System built using FastAPI microservices, SQLite, JWT authentication, and a React frontend.

## Technologies
- Python and FastAPI
- SQLite
- JWT authentication
- React, JavaScript, HTML, and CSS
- API Gateway
- Swagger UI and Postman
- Git and GitHub

## Microservices

| Service | Port | Purpose |
|---|---:|---|
| API Gateway | 8000 | Routes requests to backend services |
| Auth Service | 8001 | Registration, login, and JWT tokens |
| Student Service | 8002 | Student CRUD operations |
| Course Service | 8003 | Course CRUD operations |
| Frontend | 5173 | React web application |

## Prerequisites
- Python installed
- Node.js and npm installed
- Git installed

## Running the Backend

Open a separate terminal for each service.

### 1. Auth Service
```powershell
cd D:\student-management\auth-service
.\venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --reload --port 8001
```

### 2. Student Service
```powershell
cd D:\student-management\student-service
.\venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --reload --port 8002
```

### 3. Course Service
```powershell
cd D:\student-management\course-service
.\venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --reload --port 8003
```

### 4. API Gateway
```powershell
cd D:\student-management\api-gateway
.\venv\Scripts\Activate.ps1
python -m uvicorn main:app --reload --port 8000
```

## API Documentation
- Gateway: http://127.0.0.1:8000/docs
- Auth: http://127.0.0.1:8001/docs
- Students: http://127.0.0.1:8002/docs
- Courses: http://127.0.0.1:8003/docs

## Authentication
Register or log in through the Auth Service to obtain a JWT access token. Use the token as a Bearer token when accessing protected endpoints. Administrator permissions are required for restricted management operations.

## Tested Features
- User login and JWT authentication
- Protected Student and Course endpoints
- Create, Read, Update, and Delete student records
- Create, Read, Update, and Delete course records
- API Gateway request forwarding

## Frontend
The React frontend is located in the `frontend` directory. Start it using the project's configured npm development script.

## Security
Do not commit passwords, access tokens, production secrets, or environment files containing credentials. Configure a secure shared JWT secret for all services before deployment.

## Author
Student Management System project.
