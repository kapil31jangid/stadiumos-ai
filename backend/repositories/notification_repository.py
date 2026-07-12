import os
from psycopg2.extras import RealDictCursor
from .db import get_db_connection

class NotificationRepository:
    @staticmethod
    def get_notifications(role: str = None):
        if not os.getenv("DATABASE_URL"):
            return []
        try:
            with get_db_connection() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    if role:
                        cur.execute("select id, target_role, message, priority, is_read, created_at from public.notifications where target_role = %s or target_role is null order by created_at desc;", (role,))
                    else:
                        cur.execute("select id, target_role, message, priority, is_read, created_at from public.notifications order by created_at desc;")
                    rows = cur.fetchall()
                    return [dict(r) for r in rows]
        except Exception as e:
            print(f"Error fetching notifications: {e}")
            return []

    @staticmethod
    def create_notification(data: dict):
        if not os.getenv("DATABASE_URL"):
            return None
        try:
            with get_db_connection() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    columns = list(data.keys())
                    values = [data[c] for c in columns]
                    col_names = ", ".join(columns)
                    placeholders = ", ".join(["%s"] * len(columns))
                    query = f"insert into public.notifications ({col_names}) values ({placeholders}) returning id, target_role, message, priority, is_read, created_at;"
                    cur.execute(query, values)
                    conn.commit()
                    row = cur.fetchone()
                    return dict(row) if row else None
        except Exception as e:
            print(f"Error creating notification: {e}")
            return None
