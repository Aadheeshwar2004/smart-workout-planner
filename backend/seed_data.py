"""
Database seed script to create sample users and data
Run this after starting the backend for the first time
"""

import requests
from datetime import datetime, timedelta
import random

BASE_URL = "http://localhost:8080"

def create_users():
    """Create sample users"""
    users = [
        {
            "email": "admin@fittrack.com",
            "username": "admin",
            "password": "admin123",
            "is_admin": True
        },
        {
            "email": "john@example.com",
            "username": "john_doe",
            "password": "password123",
            "is_admin": False
        },
        {
            "email": "jane@example.com",
            "username": "jane_smith",
            "password": "password123",
            "is_admin": False
        },
        {
            "email": "mike@example.com",
            "username": "mike_wilson",
            "password": "password123",
            "is_admin": False
        }
    ]
    
    tokens = {}
    
    for user in users:
        # Register user
        response = requests.post(f"{BASE_URL}/auth/register", json=user)
        if response.status_code == 200:
            print(f"✅ Created user: {user['username']}")
            
            # Login to get token
            login_data = {
                "username": user["username"],
                "password": user["password"]
            }
            login_response = requests.post(
                f"{BASE_URL}/auth/login",
                data=login_data
            )
            
            if login_response.status_code == 200:
                token = login_response.json()["access_token"]
                tokens[user["username"]] = token
                print(f"   Logged in: {user['username']}")
        else:
            print(f"❌ Failed to create user: {user['username']} - {response.text}")
    
    return tokens

def create_metrics(tokens):
    """Create sample metrics for users"""
    metrics_data = {
        "john_doe": {
            "height": 175,
            "weight": 75,
            "age": 28,
            "gender": "male",
            "activity_level": "moderate"
        },
        "jane_smith": {
            "height": 165,
            "weight": 60,
            "age": 25,
            "gender": "female",
            "activity_level": "active"
        },
        "mike_wilson": {
            "height": 180,
            "weight": 85,
            "age": 32,
            "gender": "male",
            "activity_level": "very_active"
        }
    }
    
    for username, metrics in metrics_data.items():
        if username in tokens:
            headers = {"Authorization": f"Bearer {tokens[username]}"}
            response = requests.post(
                f"{BASE_URL}/metrics",
                json=metrics,
                headers=headers
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Created metrics for {username}")
                print(f"   BMI: {data['bmi']}, Body Fat: {data['body_fat_percentage']}%")
            else:
                print(f"❌ Failed to create metrics for {username}")

def create_workouts(tokens):
    """Create sample workout history"""
    workout_types = [
        "Running", "Cycling", "Swimming", "Weightlifting",
        "Yoga", "CrossFit", "Basketball", "Tennis"
    ]
    intensities = ["low", "moderate", "high"]
    
    for username in ["john_doe", "jane_smith", "mike_wilson"]:
        if username not in tokens:
            continue
            
        headers = {"Authorization": f"Bearer {tokens[username]}"}
        
        # Create 10-15 workouts over the past 2 weeks
        num_workouts = random.randint(10, 15)
        
        for i in range(num_workouts):
            workout = {
                "workout_type": random.choice(workout_types),
                "duration": random.randint(20, 90),
                "intensity": random.choice(intensities),
                "calories_burned": random.randint(150, 600),
                "notes": f"Great workout session #{i+1}"
            }
            
            response = requests.post(
                f"{BASE_URL}/workouts",
                json=workout,
                headers=headers
            )
            
            if response.status_code == 200:
                print(f"✅ Created workout for {username}: {workout['workout_type']}")
            else:
                print(f"❌ Failed to create workout for {username}")

def send_sample_notifications(admin_token, user_tokens):
    """Send sample notifications from admin to users"""
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    # Get all users
    response = requests.get(f"{BASE_URL}/admin/users", headers=headers)
    
    if response.status_code == 200:
        users = response.json()
        
        messages = [
            "Great job on your consistency! Keep up the good work! 💪",
            "Remember to stay hydrated during your workouts! 💧",
            "Don't forget to warm up before intense exercises! 🔥",
            "You're making excellent progress! Keep pushing! 🎯",
            "Rest days are important too! Take care of your body! 😴"
        ]
        
        for user in users:
            notification = {
                "user_id": user["id"],
                "message": random.choice(messages)
            }
            
            notif_response = requests.post(
                f"{BASE_URL}/admin/notifications",
                json=notification,
                headers=headers
            )
            
            if notif_response.status_code == 200:
                print(f"✅ Sent notification to {user['username']}")
            else:
                print(f"❌ Failed to send notification to {user['username']}")
    else:
        print("❌ Failed to get users list")

def main():
    print("\n🌱 Starting database seeding...\n")
    
    # Create users and get tokens
    print("=" * 50)
    print("Creating Users...")
    print("=" * 50)
    tokens = create_users()
    
    if not tokens:
        print("\n❌ No users created. Exiting...")
        return
    
    # Create metrics
    print("\n" + "=" * 50)
    print("Creating Metrics...")
    print("=" * 50)
    create_metrics(tokens)
    
    # Create workouts
    print("\n" + "=" * 50)
    print("Creating Workout History...")
    print("=" * 50)
    create_workouts(tokens)
    
    # Send notifications (admin only)
    if "admin" in tokens:
        print("\n" + "=" * 50)
        print("Sending Sample Notifications...")
        print("=" * 50)
        send_sample_notifications(tokens["admin"], tokens)
    
    print("\n" + "=" * 50)
    print("✨ Database seeding completed!")
    print("=" * 50)
    print("\nTest Credentials:")
    print("-" * 50)
    print("Admin:")
    print("  Username: admin")
    print("  Password: admin123")
    print("\nRegular Users:")
    print("  Username: john_doe | Password: password123")
    print("  Username: jane_smith | Password: password123")
    print("  Username: mike_wilson | Password: password123")
    print("=" * 50 + "\n")

if __name__ == "__main__":
    try:
        main()
    except requests.exceptions.ConnectionError:
        print("\n❌ Error: Cannot connect to the backend server.")
        print("Make sure the backend is running at http://localhost:8080")
        print("Start it with: uvicorn main:app --reload\n")
    except Exception as e:
        print(f"\n❌ Error occurred: {str(e)}\n")