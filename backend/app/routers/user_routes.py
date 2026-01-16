from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from ..database import get_db
from ..models import User, UserMetrics, Notification
from ..schemas import MetricsCreate, MetricsResponse, NotificationResponse
from ..auth import get_current_user
from ..utils import calculate_bmi, calculate_body_fat, calculate_skeletal_muscle

router = APIRouter()


@router.post("/metrics", response_model=MetricsResponse)
def create_or_update_metrics(
    metrics: MetricsCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create or update user fitness metrics"""
    # Calculate derived metrics
    bmi = calculate_bmi(metrics.weight, metrics.height)
    body_fat = calculate_body_fat(bmi, metrics.age, metrics.gender)
    muscle_mass = calculate_skeletal_muscle(metrics.weight, metrics.height, metrics.age, metrics.gender)
    
    # Check if metrics already exist for user
    db_metrics = db.query(UserMetrics).filter(UserMetrics.user_id == current_user.id).first()
    
    if db_metrics:
        # Update existing metrics
        db_metrics.height = metrics.height
        db_metrics.weight = metrics.weight
        db_metrics.age = metrics.age
        db_metrics.gender = metrics.gender
        db_metrics.activity_level = metrics.activity_level
        db_metrics.bmi = bmi
        db_metrics.body_fat_percentage = body_fat
        db_metrics.skeletal_muscle_mass = muscle_mass
        db_metrics.updated_at = datetime.utcnow()
    else:
        # Create new metrics
        db_metrics = UserMetrics(
            user_id=current_user.id,
            height=metrics.height,
            weight=metrics.weight,
            age=metrics.age,
            gender=metrics.gender,
            activity_level=metrics.activity_level,
            bmi=bmi,
            body_fat_percentage=body_fat,
            skeletal_muscle_mass=muscle_mass
        )
        db.add(db_metrics)
    
    db.commit()
    db.refresh(db_metrics)
    
    return db_metrics


@router.get("/metrics", response_model=MetricsResponse)
def get_metrics(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get user fitness metrics"""
    metrics = db.query(UserMetrics).filter(UserMetrics.user_id == current_user.id).first()
    
    if not metrics:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Metrics not found. Please set up your profile first."
        )
    
    return metrics


@router.get("/notifications", response_model=List[NotificationResponse])
def get_notifications(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get user notifications"""
    notifications = db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).order_by(Notification.created_at.desc()).all()
    
    return notifications


@router.put("/notifications/{notification_id}/read")
def mark_notification_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark a notification as read"""
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    notification.is_read = True
    db.commit()
    
    return {"message": "Notification marked as read"}