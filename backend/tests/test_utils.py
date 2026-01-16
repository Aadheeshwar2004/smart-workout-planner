
import pytest
from app.utils import calculate_bmi, calculate_body_fat, calculate_skeletal_muscle


class TestUtils:
    
    def test_calculate_bmi(self):
        """Test BMI calculation"""
        bmi = calculate_bmi(weight=70, height=175)
        assert bmi == 22.86
    
    def test_calculate_body_fat_male(self):
        """Test body fat calculation for male"""
        body_fat = calculate_body_fat(bmi=22.86, age=25, gender="male")
        assert isinstance(body_fat, float)
        assert body_fat > 0
    
    def test_calculate_body_fat_female(self):
        """Test body fat calculation for female"""
        body_fat = calculate_body_fat(bmi=22.0, age=25, gender="female")
        assert isinstance(body_fat, float)
        assert body_fat > 0
    
    def test_calculate_skeletal_muscle_male(self):
        """Test skeletal muscle calculation for male"""
        muscle = calculate_skeletal_muscle(
            weight=70, height=175, age=25, gender="male"
        )
        assert isinstance(muscle, float)
        assert muscle > 0
    
    def test_calculate_skeletal_muscle_female(self):
        """Test skeletal muscle calculation for female"""
        muscle = calculate_skeletal_muscle(
            weight=60, height=165, age=25, gender="female"
        )
        assert isinstance(muscle, float)
        assert muscle > 0