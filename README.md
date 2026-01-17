
# 🏋️ WORKOUT-PLANNER (AI-Powered Smart Fitness Platform)

![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green)
![React](https://img.shields.io/badge/React-TypeScript-blue)
![Testing](https://img.shields.io/badge/Tests-Pytest-success)
![AI](https://img.shields.io/badge/AI-Google%20Gemini-purple)
![Status](https://img.shields.io/badge/Status-Production--Ready-brightgreen)

An AI-powered full-stack workout planner that allows users to log workouts, track streaks, earn rewards, and receive personalized fitness & diet recommendations using Generative AI.

Admins can manage users, monitor analytics, and send notifications with secure role-based access.

---

## 🚀 Key Features

### 👤 User
- JWT authentication
- Log multiple workouts per day
- Workout streak tracking (unique days)
- Rewards for consistency
- BMI, body fat %, skeletal muscle mass calculation
- Admin notifications
- AI workout & diet recommendations
- Ask AI fitness questions
- Progress & consistency analysis

### 🧑‍💼 Admin
- Admin dashboard
- Platform analytics
- User management
- View user workouts & stats
- Send notifications

---

## 🛠 Tech Stack

**Backend**
- FastAPI
- SQLAlchemy
- SQLite
- JWT (OAuth2)
- Google Gemini AI

**Frontend**
- React + TypeScript
- Tailwind CSS
- Axios
- React Router

**Testing**
- Pytest

---

## 📁 Project Structure

```
WORKOUT-PLANNER/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── auth.py
│   │   ├── utils.py
│   │   ├── services/
│   │   │   └── gemini_client.py
│   │   └── routers/
│   │       ├── auth_routes.py
│   │       ├── user_routes.py
│   │       ├── workout_routes.py
│   │       ├── admin_routes.py
│   │       └── ai_routes.py
│   ├── tests/
│   │   ├── conftest.py
│   │   ├── test_auth.py
│   │   ├── test_user_routes.py
│   │   ├── test_workout_routes.py
│   │   ├── test_admin_routes.py
│   │   ├── test_ai_routes.py
│   │   └── test_utils.py
│   ├── run.py
│   ├── seed_data.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Admin/
│   │   │   ├── AI/
│   │   │   ├── Auth/
│   │   │   ├── Dashboard/
│   │   │   └── Workouts/
│   │   ├── services/
│   │   ├── types/
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
│
├── .env
└── README.md
```

---

## 🔥 Streak Logic
- Streaks are calculated based on unique workout days
- Multiple workouts in one day count as one streak day

Endpoint:
```
GET /streaks
```

---

## ▶️ Run Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python run.py
```

Backend URL:
```
http://localhost:8080
```

Swagger Docs:
```
http://localhost:8080/docs
```

---

## 🧪 Run Tests

```bash
cd backend
pytest
```

---

## 🔐 Environment Variables

```
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DATABASE_URL=sqlite:///./workout_planner.db
GEMINI_API_KEY=your_gemini_api_key
```

---

## 🌱 Seed Sample Data

```bash
python seed_data.py
```

Test Users:
- Admin → admin / admin123
- User → john_doe / password123

---

## 🧠 Architecture Highlights
- Modular FastAPI architecture
- Role-based access control
- AI logic isolated in services
- Fully tested backend
- Production-ready structure
