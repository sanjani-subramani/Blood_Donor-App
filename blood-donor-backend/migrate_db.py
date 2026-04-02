import sqlite3

def migrate():
    conn = sqlite3.connect('blood_donor.db')
    cursor = conn.cursor()
    try:
        cursor.execute("ALTER TABLE donors ADD COLUMN last_notified DATETIME;")
        conn.commit()
        print("Successfully added 'last_notified' column to 'donors' table.")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e):
            print("Column 'last_notified' already exists.")
        else:
            print(f"Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
