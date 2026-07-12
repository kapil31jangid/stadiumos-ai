import os
from psycopg2.extras import RealDictCursor
from .db import get_db_connection

class AnnouncementRepository:
    @staticmethod
    def get_announcements():
        if not os.getenv("DATABASE_URL"):
            return []
        try:
            with get_db_connection() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute("select id, title, content, language, severity, created_by, created_at from public.announcements order by created_at desc;")
                    rows = cur.fetchall()
                    return [dict(r) for r in rows]
        except Exception as e:
            print(f"Error fetching announcements: {e}")
            return []

    @staticmethod
    def create_announcement(data: dict):
        if not os.getenv("DATABASE_URL"):
            return None
        try:
            with get_db_connection() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    columns = list(data.keys())
                    values = [data[c] for c in columns]
                    col_names = ", ".join(columns)
                    placeholders = ", ".join(["%s"] * len(columns))
                    query = f"insert into public.announcements ({col_names}) values ({placeholders}) returning id, title, content, language, severity, created_by, created_at;"
                    cur.execute(query, values)
                    conn.commit()
                    row = cur.fetchone()
                    return dict(row) if row else None
        except Exception as e:
            print(f"Error creating announcement: {e}")
            return None
