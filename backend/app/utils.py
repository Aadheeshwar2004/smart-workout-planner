def calculate_bmi(weight: float, height: float) -> float:
    """
    Calculate BMI (Body Mass Index)
    
    Args:
        weight: Weight in kilograms
        height: Height in centimeters
    
    Returns:
        BMI value rounded to 2 decimal places
    """
    height_m = height / 100
    return round(weight / (height_m ** 2), 2)


def calculate_body_fat(bmi: float, age: int, gender: str) -> float:
    """
    Estimate body fat percentage using BMI and age
    
    Args:
        bmi: Body Mass Index
        age: Age in years
        gender: 'male' or 'female'
    
    Returns:
        Estimated body fat percentage rounded to 2 decimal places
    """
    if gender.lower() == "male":
        return round((1.20 * bmi) + (0.23 * age) - 16.2, 2)
    else:
        return round((1.20 * bmi) + (0.23 * age) - 5.4, 2)


def calculate_skeletal_muscle(weight: float, height: float, age: int, gender: str) -> float:
    """
    Estimate skeletal muscle mass
    
    Args:
        weight: Weight in kilograms
        height: Height in centimeters
        age: Age in years
        gender: 'male' or 'female'
    
    Returns:
        Estimated skeletal muscle mass in kg rounded to 2 decimal places
    """
    if gender.lower() == "male":
        return round(0.407 * weight + 0.267 * height - 0.048 * age - 19.2, 2)
    else:
        return round(0.252 * weight + 0.473 * height - 0.048 * age + 0.4, 2)