
import pytest
from fastapi import status


class TestAdminUsers:
    
    def test_get_all_users_as_admin(self, client, admin_headers, test_user):
        """Test admin getting all users"""
        response = client.get("/admin/users", headers=admin_headers)
        
        assert response.status_code == status.HTTP_200_OK
        users = response.json()
        assert len(users) >= 1
        assert all(not user["is_admin"] for user in users)
    
    def test_get_all_users_as_regular_user(self, client, auth_headers):
        """Test regular user cannot access admin endpoint"""
        response = client.get("/admin/users", headers=auth_headers)
        
        assert response.status_code == status.HTTP_403_FORBIDDEN
    
    def test_delete_user_as_admin(self, client, admin_headers, test_user):
        """Test admin deleting a user"""
        response = client.delete(f"/admin/users/{test_user.id}", headers=admin_headers)
        
        assert response.status_code == status.HTTP_200_OK
        assert "deleted successfully" in response.json()["message"]
    
    def test_delete_nonexistent_user(self, client, admin_headers):
        """Test deleting non-existent user"""
        response = client.delete("/admin/users/999", headers=admin_headers)
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_delete_admin_user_forbidden(self, client, admin_headers, admin_user):
        """Test that admin users cannot be deleted"""
        response = client.delete(f"/admin/users/{admin_user.id}", headers=admin_headers)
        
        assert response.status_code == status.HTTP_403_FORBIDDEN
        assert "Cannot delete admin users" in response.json()["detail"]


class TestAdminNotifications:
    
    def test_send_notification(self, client, admin_headers, test_user):
        """Test admin sending notification"""
        notification_data = {
            "user_id": test_user.id,
            "message": "Keep up the great work!"
        }
        response = client.post("/admin/notifications", json=notification_data, headers=admin_headers)
        
        assert response.status_code == status.HTTP_200_OK
        assert "sent successfully" in response.json()["message"]
    
    def test_send_notification_invalid_user(self, client, admin_headers):
        """Test sending notification to non-existent user"""
        notification_data = {
            "user_id": 999,
            "message": "Test message"
        }
        response = client.post("/admin/notifications", json=notification_data, headers=admin_headers)
        
        assert response.status_code == status.HTTP_404_NOT_FOUND


class TestAdminAnalytics:
    
    def test_get_analytics(self, client, admin_headers):
        """Test getting platform analytics"""
        response = client.get("/admin/analytics", headers=admin_headers)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "total_users" in data
        assert "total_workouts" in data
        assert "active_users" in data
        assert "average_workouts_per_user" in data
    
    def test_get_user_stats(self, client, admin_headers, test_user):
        """Test getting specific user stats"""
        response = client.get(f"/admin/users/{test_user.id}/stats", headers=admin_headers)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["user_id"] == test_user.id
        assert data["username"] == test_user.username
        assert "total_workouts" in data