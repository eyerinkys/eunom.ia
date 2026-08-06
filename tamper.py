import sqlite3
import os

db_path = os.path.join('backend', 'data', 'eunomia.db')
if not os.path.exists(db_path):
    db_path = os.path.join('data', 'eunomia.db')

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Find the file associated with the latest provenance event
cursor.execute('''
    SELECT pe.id, pe.node_id, n.name 
    FROM provenance_events pe 
    JOIN nodes n ON pe.node_id = n.id 
    ORDER BY pe.created_at DESC, pe.rowid DESC 
    LIMIT 1
''')
row = cursor.fetchone()

if not row:
    print("No provenance events found in database! Please upload a file first on http://localhost:5173.")
else:
    event_id, node_id, file_name = row
    cursor.execute(
        "UPDATE provenance_events SET payload_hash = 'deadbeef00000000000000000000000000000000000000000000000000000000' WHERE id = ?",
        (event_id,)
    )
    conn.commit()
    print("=" * 60)
    print(f" SUCCESS! Tampered latest provenance event in database.")
    print(f" File Name : \"{file_name}\"")
    print(f" File ID   : {node_id}")
    print("=" * 60)
    print(f"Next Step: Open \"{file_name}\" on http://localhost:5173")
    print("-> Go to PROVENANCE tab -> Click 'VERIFY PROVENANCE NOW'")
    print("=" * 60)
