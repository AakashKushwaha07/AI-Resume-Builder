# backend/db.py
import mysql.connector
from mysql.connector import Error
from config import DB_CONFIG

def get_db_connection():
    """
    Create and return a database connection using DB_CONFIG.
    """
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        return conn
    except Error as e:
        print(f"Database connection failed: {e}")
        return None

def create_user(username, email, password):
    """
    Insert a new user into the database.
    """
    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor()
            query = "INSERT INTO users (username, email, password) VALUES (%s, %s, %s)"
            cursor.execute(query, (username, email, password))
            conn.commit()
            return True
        except Error as e:
            print(f"Error inserting user: {e}")
            return False
        finally:
            cursor.close()
            conn.close()

def get_all_users():
    """
    Fetch all users from the database.
    """
    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT * FROM users")
            return cursor.fetchall()
        except Error as e:
            print(f"Error fetching users: {e}")
            return []
        finally:
            cursor.close()
            conn.close()
