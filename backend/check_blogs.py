from db import get_db_connection

conn = get_db_connection()
cursor = conn.cursor()

cursor.execute("""
    SELECT blog_id, video_id, user_id, title, content, created_at
    FROM blog_contents
    ORDER BY blog_id DESC
""")

blogs = cursor.fetchall()

print("BLOGS")
print("-" * 80)

for blog in blogs:
    print("Blog ID:", blog[0])
    print("Video ID:", blog[1])
    print("User ID:", blog[2])
    print("Title:", blog[3])
    print("Content:")
    print(blog[4])
    print("Created At:", blog[5])
    print("-" * 80)

cursor.close()
conn.close()