
import pytest
from fastapi import status
from unittest.mock import patch


class TestAIRecommendations:
    
    @patch('app.routers.ai_routes.generate_text')
    def test_get_ai_recommendations_ask_anything(self, mock_generate, client, auth_headers):
        """Test AI recommendations with custom prompt"""
        mock_generate.return_value = "Here are some workout tips..."
        
        ai_request = {
            "prompt": "What exercises should I do for core strength?",
            "context": None
        }
        response = client.post("/ai/recommendations", json=ai_request, headers=auth_headers)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["mode"] == "ask_anything"
        assert "ai_response" in data
        mock_generate.assert_called_once()
    
    @patch('app.services.gemini_client.generate_text')
    def test_get_ai_recommendations_auto(self, mock_generate, client, auth_headers):
        """Test AI auto recommendations"""
        mock_generate.return_value = "Personalized workout plan..."
        
        # First create metrics
        metrics_data = {
            "height": 175.0,
            "weight": 70.0,
            "age": 25,
            "gender": "male",
            "activity_level": "moderate"
        }
        client.post("/users/metrics", json=metrics_data, headers=auth_headers)
        
        ai_request = {
            "prompt": "",
            "context": None
        }
        response = client.post("/ai/recommendations", json=ai_request, headers=auth_headers)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["mode"] == "auto_recommendation"
        assert "ai_response" in data
    
    def test_analyze_progress_no_data(self, client, auth_headers):
        """Test progress analysis with no workouts"""
        response = client.get("/ai/progress-analysis?days=30", headers=auth_headers)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "No workout data available" in data["message"]

