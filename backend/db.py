# backend/db.py - REAL MySQL database connection

import mysql.connector
from mysql.connector import Error
from config import DB_CONFIG


def get_db_connection():
    """Create and return a real MySQL database connection."""
    try:
        conn = mysql.connector.connect(
            host=DB_CONFIG['host'],
            user=DB_CONFIG['user'],
            password=DB_CONFIG['password'],
            database=DB_CONFIG['database'],
            port=3306
        )

        if conn.is_connected():
            print("✅ Connected to MySQL Database")

        return conn

    except Error as e:
        print("❌ Error while connecting to MySQL:", e)
        return None