from db import get_db_connection

try:
    connection = get_db_connection()
    print("PostgreSQL connection successful!")
    connection.close()
except Exception as e:
    print("Database connection failed:")
    print(e)