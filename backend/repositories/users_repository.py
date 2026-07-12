import os
import json
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    return psycopg2.connect(os.getenv("DATABASE_URL"))

class UsersRepository:
    @staticmethod
    def get_profile(user_id: str):
        if not os.getenv("DATABASE_URL"):
            return None
        try:
            with get_db_connection() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute("select id, email, name, avatar_url, role, language, preferences from public.profiles where id = %s;", (user_id,))
                    row = cur.fetchone()
                    return dict(row) if row else None
        except Exception as e:
            print(f"Error fetching profile: {e}")
            return None

    @staticmethod
    def update_profile(user_id: str, data: dict):
        if not os.getenv("DATABASE_URL") or not data:
            return None
        
        # Serialize preferences dict to JSON string if present
        if "preferences" in data and isinstance(data["preferences"], dict):
            data["preferences"] = json.dumps(data["preferences"])

        try:
            with get_db_connection() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    keys = list(data.keys())
                    values = [data[k] for k in keys]
                    set_clause = ", ".join([f"{k} = %s" for k in keys])
                    query = f"update public.profiles set {set_clause} where id = %s returning id, email, name, avatar_url, role, language, preferences;"
                    cur.execute(query, values + [user_id])
                    conn.commit()
                    row = cur.fetchone()
                    return dict(row) if row else None
        except Exception as e:
            print(f"Error updating profile: {e}")
            return None

    @staticmethod
    def update_role(user_id: str, role: str):
        return UsersRepository.update_profile(user_id, {"role": role})

    @staticmethod
    def update_language(user_id: str, language: str):
        return UsersRepository.update_profile(user_id, {"language": language})

    @staticmethod
    def update_preferences(user_id: str, preferences: dict):
        return UsersRepository.update_profile(user_id, {"preferences": preferences})
