
import pytest
from fastapi import status


class TestWorkouts:
    
    def test_create_workout(self, client, auth_headers):
        """Test creating a workout"""
        workout_data = {
            "workout_type": "Running",
            "duration": 30,
            "intensity": "moderate",
            "calories_burned": 300,
            "notes": "Morning run"
        }
        response = client.post("/workouts", json=workout_data, headers=auth_headers)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["workout_type"] == "Running"
        assert data["duration"] == 30
    
    def test_get_workouts(self, client, auth_headers):
        """Test retrieving user workouts"""
        # Create a workout
        workout_data = {
            "workout_type": "Cycling",
            "duration": 45,
            "intensity": "high",
            "calories_burned": 400,
            "notes": "Evening ride"
        }
        client.post("/workouts", json=workout_data, headers=auth_headers)
        
        # Get workouts
        response = client.get("/workouts", headers=auth_headers)
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.json()) > 0