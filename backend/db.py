import psycopg2

def get_db_connection():
    connection = psycopg2.connect(
        host="localhost",
        database="video_to_blog",
        user="postgres",
        password="postgres123",
        port="5432"
    )

    return connection