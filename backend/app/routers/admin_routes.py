from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from ..database import get_db
from ..models import User, Workout, Notification
from ..schemas import UserResponse, NotificationCreate
from ..auth import get_admin_user, get_current_user

router = APIRouter()


@router.get("/users", response_model=List[UserResponse])
def get_all_users(admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    """Get all non-admin users (admin only)"""
    users = db.query(User).filter(User.is_admin == False).all()
    return users


@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Delete a user (admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Don't allow deleting admin users
    if user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot delete admin users"
        )
    
    db.delete(user)
    db.commit()
    
    return {"message": "User deleted successfully"}


@router.post("/notifications")
def send_notification(
    notification: NotificationCreate,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Send a notification to a user (admin only)"""
    # Verify user exists
    user = db.query(User).filter(User.id == notification.user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Create notification
    new_notification = Notification(
        user_id=notification.user_id,
        message=notification.message
    )
    
    db.add(new_notification)
    db.commit()
    
    return {"message": "Notification sent successfully"}

@router.get("/users/{user_id}/workouts")
def get_user_workouts(user_id:int,db: Session = Depends(get_db),current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403,detail="Admin access required")
    workouts = (
        db.query(Workout).filter(Workout.user_id == user_id)
        .order_by(Workout.date.desc())
        .all()
    )
    return workouts

@router.get("/analytics")
def get_analytics(admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    """Get platform analytics (admin only)"""
    # Total users (excluding admins)
    total_users = db.query(User).filter(User.is_admin == False).count()
    
    # Total workouts
    total_workouts = db.query(Workout).count()
    
    # Active users (users who have logged at least one workout)
    active_users = db.query(User).join(Workout).filter(
        User.is_admin == False
    ).distinct().count()
    
    # Average workouts per user
    avg_workouts = db.query(func.count(Workout.id)).scalar() / max(total_users, 1)
    
    return {
        "total_users": total_users,
        "total_workouts": total_workouts,
        "active_users": active_users,
        "average_workouts_per_user": round(avg_workouts, 2)
    }


@router.get("/users/{user_id}/stats")
def get_user_stats(
    user_id: int,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get detailed stats for a specific user (admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Get workout count
    workout_count = db.query(Workout).filter(Workout.user_id == user_id).count()
    
    # Get total calories burned
    total_calories = db.query(func.sum(Workout.calories_burned)).filter(
        Workout.user_id == user_id
    ).scalar() or 0
    
    # Get total workout time
    total_time = db.query(func.sum(Workout.duration)).filter(
        Workout.user_id == user_id
    ).scalar() or 0
    
    return {
        "user_id": user_id,
        "username": user.username,
        "total_workouts": workout_count,
        "total_calories_burned": total_calories,
        "total_workout_minutes": total_time
    }