# backend/db_test.py
from db import create_user, get_all_users

# Insert a test user
if create_user("testuser", "test@example.com", "password123"):
    print("✅ User inserted successfully")

# Fetch all users
users = get_all_users()
print("📋 Users in database:", users)
