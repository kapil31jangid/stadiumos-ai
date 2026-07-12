import os
from psycopg2.extras import RealDictCursor
from .db import get_db_connection

class TaskRepository:
    @staticmethod
    def get_tasks():
        if not os.getenv("DATABASE_URL"):
            return []
        try:
            with get_db_connection() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute("select id, assigned_to, incident_id, priority, status, estimated_completion from public.tasks;")
                    rows = cur.fetchall()
                    return [dict(r) for r in rows]
        except Exception as e:
            print(f"Error fetching tasks: {e}")
            return []

    @staticmethod
    def create_task(data: dict):
        if not os.getenv("DATABASE_URL"):
            return None
        try:
            with get_db_connection() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    columns = list(data.keys())
                    values = [data[c] for c in columns]
                    col_names = ", ".join(columns)
                    placeholders = ", ".join(["%s"] * len(columns))
                    query = f"insert into public.tasks ({col_names}) values ({placeholders}) returning id, assigned_to, incident_id, priority, status, estimated_completion;"
                    cur.execute(query, values)
                    conn.commit()
                    row = cur.fetchone()
                    return dict(row) if row else None
        except Exception as e:
            print(f"Error creating task: {e}")
            return None

    @staticmethod
    def update_task(task_id: str, data: dict):
        if not os.getenv("DATABASE_URL") or not data:
            return None
        try:
            with get_db_connection() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    keys = list(data.keys())
                    values = [data[k] for k in keys]
                    set_clause = ", ".join([f"{k} = %s" for k in keys])
                    query = f"update public.tasks set {set_clause} where id = %s returning id, assigned_to, incident_id, priority, status, estimated_completion;"
                    cur.execute(query, values + [task_id])
                    conn.commit()
                    row = cur.fetchone()
                    return dict(row) if row else None
        except Exception as e:
            print(f"Error updating task: {e}")
            return None
