
import pytest
from fastapi import status


class TestUserMetrics:
    
    def test_create_metrics(self, client, auth_headers):
        """Test creating user metrics"""
        metrics_data = {
            "height": 175.0,
            "weight": 70.0,
            "age": 25,
            "gender": "male",
            "activity_level": "moderate"
        }
        response = client.post("/users/metrics", json=metrics_data, headers=auth_headers)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["height"] == metrics_data["height"]
        assert data["weight"] == metrics_data["weight"]
        assert "bmi" in data
        assert "body_fat_percentage" in data
        assert "skeletal_muscle_mass" in data
    
    def test_update_metrics(self, client, auth_headers):
        """Test updating existing metrics"""
        # Create initial metrics
        initial_data = {
            "height": 175.0,
            "weight": 70.0,
            "age": 25,
            "gender": "male",
            "activity_level": "moderate"
        }
        client.post("/users/metrics", json=initial_data, headers=auth_headers)
        
        # Update metrics
        updated_data = {
            "height": 175.0,
            "weight": 75.0,
            "age": 25,
            "gender": "male",
            "activity_level": "active"
        }
        response = client.post("/users/metrics", json=updated_data, headers=auth_headers)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["weight"] == 75.0
        assert data["activity_level"] == "active"
    
    def test_get_metrics(self, client, auth_headers):
        """Test retrieving user metrics"""
        # Create metrics first
        metrics_data = {
            "height": 165.0,
            "weight": 60.0,
            "age": 28,
            "gender": "female",
            "activity_level": "active"
        }
        client.post("/users/metrics", json=metrics_data, headers=auth_headers)
        
        # Get metrics
        response = client.get("/users/metrics", headers=auth_headers)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["height"] == 165.0
        assert data["weight"] == 60.0
    
    def test_get_metrics_not_found(self, client, auth_headers):
        """Test getting metrics when none exist"""
        response = client.get("/users/metrics", headers=auth_headers)
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert "Metrics not found" in response.json()["detail"]


class TestUserNotifications:
    
    def test_get_notifications_empty(self, client, auth_headers):
        """Test getting notifications when none exist"""
        response = client.get("/users/notifications", headers=auth_headers)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.json() == []
    
    def test_mark_notification_read(self, client, auth_headers, admin_headers, test_user):
        """Test marking notification as read"""
        # Admin sends notification
        notification_data = {
            "user_id": test_user.id,
            "message": "Test notification"
        }
        client.post("/admin/notifications", json=notification_data, headers=admin_headers)
        
        # Get notifications
        response = client.get("/users/notifications", headers=auth_headers)
        notification_id = response.json()[0]["id"]
        
        # Mark as read
        response = client.put(
            f"/users/notifications/{notification_id}/read",
            headers=auth_headers
        )
        
        assert response.status_code == status.HTTP_200_OK
        assert "marked as read" in response.json()["message"]
    
    def test_mark_notification_read_not_found(self, client, auth_headers):
        """Test marking non-existent notification as read"""
        response = client.put("/users/notifications/999/read", headers=auth_headers)
        
        assert response.status_code == status.HTTP_404_NOT_FOUND