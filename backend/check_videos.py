from db import get_db_connection

connection = get_db_connection()
cursor = connection.cursor()

cursor.execute("""
    SELECT video_id, user_id, filename, format, duration_seconds, cloudinary_url
    FROM videos
    ORDER BY video_id
""")

videos = cursor.fetchall()

print("\nVIDEOS:")
print("-" * 80)

for video in videos:
    print(video)

cursor.close()
connection.close()