from db import get_db_connection

connection = get_db_connection()
cursor = connection.cursor()

cursor.execute("SELECT user_id, name, email FROM users ORDER BY user_id")

users = cursor.fetchall()

print("\nUSERS:")
print("-" * 50)

for user in users:
    print(user)

cursor.close()
connection.close()