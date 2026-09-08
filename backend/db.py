import os
import psycopg2
from dotenv import load_dotenv

load_dotenv("backend/.env")

def get_db_connection():
    connection = psycopg2.connect(
        os.getenv("DATABASE_URL")
    )
    return connection