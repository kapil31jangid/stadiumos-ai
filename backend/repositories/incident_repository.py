import os
from psycopg2.extras import RealDictCursor
from .db import get_db_connection

class IncidentRepository:
    @staticmethod
    def get_incidents():
        if not os.getenv("DATABASE_URL"):
            return [
                {
                    "type": "HVAC Outage",
                    "location": "Concourse B",
                    "severity": "Medium",
                    "description": "AC system shut down in corridor B."
                },
                {
                    "type": "Gate Congestion",
                    "location": "East Gate A",
                    "severity": "High",
                    "description": "High ticket scanning delays."
                }
            ]
        try:
            with get_db_connection() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute("select id, zone_id, type, location, severity, status, summary, description, ai_summary, ai_priority, ai_response, created_at from public.incidents order by created_at desc;")
                    rows = cur.fetchall()
                    mapped = []
                    for inc in rows:
                        mapped.append({
                            "id": str(inc["id"]),
                            "type": inc["type"],
                            "location": inc["location"],
                            "severity": inc["severity"],
                            "description": inc["description"],
                            "status": inc["status"],
                            "aiSummary": inc.get("ai_summary") or inc.get("summary") or "",
                            "aiPriority": inc.get("ai_priority") or inc.get("severity") or "MEDIUM",
                            "aiResponse": inc.get("ai_response") or "Deploy security dispatcher.",
                            "timestamp": str(inc["created_at"])
                        })
                    return mapped
        except Exception as e:
            print(f"Error fetching incidents: {e}")
            return []

    @staticmethod
    def create_incident(data: dict):
        if not os.getenv("DATABASE_URL"):
            return data
        
        db_data = {
            "type": data["type"],
            "location": data["location"],
            "severity": data["severity"],
            "description": data["description"],
            "ai_summary": data.get("aiSummary") or data.get("summary"),
            "ai_priority": data.get("aiPriority"),
            "ai_response": data.get("aiResponse")
        }

        try:
            with get_db_connection() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    columns = list(db_data.keys())
                    values = [db_data[c] for c in columns]
                    col_names = ", ".join(columns)
                    placeholders = ", ".join(["%s"] * len(columns))
                    query = f"insert into public.incidents ({col_names}) values ({placeholders}) returning id, zone_id, type, location, severity, status, summary, description, ai_summary, ai_priority, ai_response, created_at;"
                    cur.execute(query, values)
                    conn.commit()
                    inc = cur.fetchone()
                    if inc:
                        return {
                            "id": str(inc["id"]),
                            "type": inc["type"],
                            "location": inc["location"],
                            "severity": inc["severity"],
                            "description": inc["description"],
                            "status": inc["status"],
                            "aiSummary": inc.get("ai_summary") or inc.get("summary") or "",
                            "aiPriority": inc.get("ai_priority") or inc.get("severity") or "MEDIUM",
                            "aiResponse": inc.get("ai_response") or "Deploy security dispatcher.",
                            "timestamp": str(inc["created_at"])
                        }
                    return None
        except Exception as e:
            print(f"Error creating incident: {e}")
            return None
