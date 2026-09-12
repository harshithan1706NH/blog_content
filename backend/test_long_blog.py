from blog_generator import generate_blog
from db import get_db_connection

conn = get_db_connection()
cursor = conn.cursor()

cursor.execute("""
    SELECT transcript_text
    FROM transcripts
    WHERE transcript_id = 17
""")

row = cursor.fetchone()

cursor.close()
conn.close()

if not row:
    raise RuntimeError("Transcript 17 not found.")

transcript = row[0]

print("Transcript loaded.")
print("Generating blog...")

blog = generate_blog(transcript)

print("\nBLOG:")
print(blog)