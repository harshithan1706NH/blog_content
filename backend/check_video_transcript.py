from db import get_db_connection

conn = get_db_connection()
cur = conn.cursor()

cur.execute("""
    SELECT
        v.video_id,
        v.filename,
        v.format,
        v.duration_seconds,
        v.cloudinary_url,
        t.transcript_id,
        t.transcript_text
    FROM videos v
    LEFT JOIN transcripts t
        ON v.video_id = t.video_id
    WHERE v.video_id = 31
""")

row = cur.fetchone()

if row:
    print("VIDEO ID:", row[0])
    print("FILENAME:", row[1])
    print("FORMAT:", row[2])
    print("DURATION:", row[3])
    print("CLOUDINARY URL:", row[4])
    print("TRANSCRIPT ID:", row[5])
    print("TRANSCRIPT:", row[6])
else:
    print("Video not found.")

cur.close()
conn.close()