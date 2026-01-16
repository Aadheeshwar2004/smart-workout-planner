from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import User, Workout, Reward
from ..schemas import WorkoutCreate, WorkoutResponse, RewardResponse
from ..auth import get_current_user

router = APIRouter()


@router.post("/workouts", response_model=WorkoutResponse)
def log_workout(
    workout: WorkoutCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Log a new workout"""
    # Create new workout
    new_workout = Workout(
        user_id=current_user.id,
        workout_type=workout.workout_type,
        duration=workout.duration,
        intensity=workout.intensity,
        calories_burned=workout.calories_burned,
        notes=workout.notes
    )
    
    db.add(new_workout)
    db.commit()
    db.refresh(new_workout)
    
    # Check for streak rewards
    workouts_count = db.query(Workout).filter(Workout.user_id == current_user.id).count()
    
    # Award milestone rewards
    if workouts_count % 7 == 0 and workouts_count > 0:
        week_number = workouts_count // 7
        reward = Reward(
            user_id=current_user.id,
            title=f"🔥 {week_number} Week Streak!",
            description=f"Congratulations! You've completed {workouts_count} workouts. Keep it up!"
        )
        db.add(reward)
        db.commit()
    
    return new_workout


@router.get("/workouts", response_model=List[WorkoutResponse])
def get_workouts(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user workout history"""
    workouts = db.query(Workout).filter(
        Workout.user_id == current_user.id
    ).order_by(Workout.date.desc()).offset(skip).limit(limit).all()
    
    return workouts


@router.get("/streaks")
def get_streak(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Calculate user's workout streak"""
    workouts = db.query(Workout).filter(
        Workout.user_id == current_user.id
    ).order_by(Workout.date.desc()).all()
    
    if not workouts:
        return {"current_streak": 0, "longest_streak": 0}
    
    current_streak = 1
    longest_streak = 1
    temp_streak = 1
    
    # Calculate streaks based on consecutive workout days
    for i in range(len(workouts) - 1):
        diff = (workouts[i].date.date() - workouts[i + 1].date.date()).days
        
        if diff == 1:
            temp_streak += 1
            if i == 0:
                current_streak = temp_streak
        else:
            temp_streak = 1
        
        longest_streak = max(longest_streak, temp_streak)
    
    return {
        "current_streak": current_streak,
        "longest_streak": longest_streak
    }
@router.get("/prs")
def get_strength_prs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    workouts = db.query(Workout).filter(
        Workout.user_id == current_user.id,
        Workout.notes.isnot(None)
    ).all()

    prs = {}

    for w in workouts:
        try:
            sets_reps, weight_part = w.notes.split("@")
            reps = int(sets_reps.split("x")[1])
            weight = float(weight_part.replace("kg", "").strip())
            volume = reps * weight

            if w.workout_type not in prs or prs[w.workout_type]["volume"] < volume:
                prs[w.workout_type] = {
                    "weight": weight,
                    "reps": reps,
                    "volume": volume
                }
        except:
            continue

    return prs


@router.get("/rewards", response_model=List[RewardResponse])
def get_rewards(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get user rewards"""
    rewards = db.query(Reward).filter(
        Reward.user_id == current_user.id
    ).order_by(Reward.earned_at.desc()).all()
    
    return rewards