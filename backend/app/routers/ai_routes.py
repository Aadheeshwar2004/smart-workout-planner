from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, UserMetrics, Workout
from ..schemas import AIRequest
from ..auth import get_current_user
from ..services import generate_text

router = APIRouter()


@router.post("/recommendations")
async def get_ai_recommendations(
    request: AIRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        metrics = db.query(UserMetrics).filter(
            UserMetrics.user_id == current_user.id
        ).first()

        recent_workouts = db.query(Workout).filter(
            Workout.user_id == current_user.id
        ).order_by(Workout.date.desc()).limit(5).all()

        # -------------------------
        # MODE 1: ASK ANYTHING
        # -------------------------
        if request.prompt and request.prompt.strip() not in [
            "",
            "Generate personalized workout and diet recommendations",
        ]:
            ai_response = generate_text(request.prompt)

            return {
                "ai_response": ai_response,
                "mode": "ask_anything"
            }

        # -------------------------
        # MODE 2: AUTO RECOMMENDATION
        # -------------------------
        auto_prompt = f"""
You are a professional fitness coach and nutritionist.

USER PROFILE:
Age: {metrics.age if metrics else 'N/A'}
Gender: {metrics.gender if metrics else 'N/A'}
Height: {metrics.height if metrics else 'N/A'} cm
Weight: {metrics.weight if metrics else 'N/A'} kg
BMI: {metrics.bmi if metrics else 'N/A'}
Activity Level: {metrics.activity_level if metrics else 'moderate'}

RECENT WORKOUTS:
{[f"{w.workout_type} - {w.duration} min - {w.intensity}" for w in recent_workouts]}

TASK:
1. Create a personalized 5-day workout plan
2. Give a practical diet plan
3. Write a short motivational message

Use headings and bullet points.
"""

        ai_response = generate_text(auto_prompt)

        return {
            "ai_response": ai_response,
            "mode": "auto_recommendation"
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"AI generation failed: {str(e)}"
        )



@router.get("/progress-analysis")
async def analyze_progress(
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    from datetime import datetime, timedelta

    start_date = datetime.utcnow() - timedelta(days=days)

    workouts = db.query(Workout).filter(
        Workout.user_id == current_user.id,
        Workout.date >= start_date
    ).all()

    if not workouts:
        return {
            "message": "No workout data available",
            "days_analyzed": days
        }

    total_workouts = len(workouts)
    total_minutes = sum(w.duration for w in workouts)
    total_calories = sum(w.calories_burned for w in workouts)

    return {
        "period": f"{days} days",
        "total_workouts": total_workouts,
        "total_minutes": total_minutes,
        "total_calories_burned": total_calories,
        "consistency_score": min(100, (total_workouts / days) * 100),
    }
