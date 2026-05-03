import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

GMAIL_EMAIL = os.getenv("GMAIL_EMAIL")
GMAIL_APP_PASSWORD = os.getenv("GMAIL_APP_PASSWORD")
SECRET_KEY = os.getenv("SECRET_KEY")

# Database Config (MySQL)
DB_CONFIG = {
    'host': os.getenv("DB_HOST"),
    'user': os.getenv("DB_USER"),
    'password': os.getenv("DB_PASSWORD"),
    'database': os.getenv("DB_NAME"),
    'port': int(os.getenv("DB_PORT", 3306)),
    'ssl_disabled': os.getenv("DB_SSL_DISABLED", "true").lower() in ("1", "true", "yes")
}
