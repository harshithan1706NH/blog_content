from db import get_db_connection

conn = get_db_connection()
cur = conn.cursor()

cur.execute("""
    SELECT transcript_id, video_id, transcript_text, created_at
    FROM transcripts
    ORDER BY transcript_id DESC
""")

rows = cur.fetchall()

if not rows:
    print("No transcripts found.")
else:
    print("TRANSCRIPTS")
    print("-" * 80)

    for row in rows:
        print("Transcript ID:", row[0])
        print("Video ID:", row[1])
        print("Transcript:", row[2])
        print("Created At:", row[3])
        print("-" * 80)

cur.close()
conn.close()