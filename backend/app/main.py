from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import engine, Base
from .routers import auth_routes, user_routes, workout_routes, admin_routes, ai_routes

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="Smart Workout Planner API",
    description="AI-powered fitness management system with personalized recommendations",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_routes.router, prefix="/auth", tags=["Authentication"])
app.include_router(user_routes.router, prefix="/users", tags=["Users"])
app.include_router(workout_routes.router, tags=["Workouts"])
app.include_router(admin_routes.router, prefix="/admin", tags=["Admin"])
app.include_router(ai_routes.router, prefix="/ai", tags=["AI"])


@app.get("/")
def root():
    """Root endpoint"""
    return {
        "message": "Smart Workout Planner API",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "running"
    }


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}