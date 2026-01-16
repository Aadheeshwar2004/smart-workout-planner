from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

# User Schemas
class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str
    is_admin: bool = False


class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    is_admin: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


# Metrics Schemas
class MetricsCreate(BaseModel):
    height: float
    weight: float
    age: int
    gender: str
    activity_level: str


class MetricsResponse(BaseModel):
    height: float
    weight: float
    age: int
    gender: str
    activity_level: str
    bmi: float
    body_fat_percentage: float
    skeletal_muscle_mass: float
    
    class Config:
        from_attributes = True


# Workout Schemas
class WorkoutCreate(BaseModel):
    workout_type: str
    duration: int
    intensity: str
    calories_burned: int
    notes: Optional[str] = None


class WorkoutResponse(BaseModel):
    id: int
    workout_type: str
    duration: int
    intensity: str
    calories_burned: int
    notes: Optional[str]
    date: datetime
    
    class Config:
        from_attributes = True


# Notification Schemas
class NotificationCreate(BaseModel):
    user_id: int
    message: str


class NotificationResponse(BaseModel):
    id: int
    message: str
    is_read: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


# Reward Schema
class RewardResponse(BaseModel):
    id: int
    title: str
    description: str
    earned_at: datetime
    
    class Config:
        from_attributes = True


# Token Schema
class Token(BaseModel):
    access_token: str
    token_type: str


# AI Request Schema
class AIRequest(BaseModel):
    prompt: str
    context: Optional[dict] = None