import os
from psycopg2.extras import RealDictCursor
from .db import get_db_connection

class CrowdRepository:
    @staticmethod
    def get_zones():
        if not os.getenv("DATABASE_URL"):
            # Fallback mock zones if DB offline
            return [
                {"id": "gate_a", "name": "East Gate A", "current_density": 0.25, "max_capacity": 5000, "status": "Normal"},
                {"id": "gate_b", "name": "West Gate B", "current_density": 0.18, "max_capacity": 4000, "status": "Normal"},
                {"id": "concourse_1", "name": "Level 1 Concourse", "current_density": 0.45, "max_capacity": 8000, "status": "Normal"},
                {"id": "food_court", "name": "Central Plaza Food Court", "current_density": 0.65, "max_capacity": 2000, "status": "Normal"},
                {"id": "vip_lounge", "name": "Executive VIP Lounge", "current_density": 0.12, "max_capacity": 500, "status": "Normal"}
            ]
        try:
            with get_db_connection() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute("select id, zone_name, occupancy, capacity, status from public.crowd_zones;")
                    rows = cur.fetchall()
                    mapped_zones = []
                    for z in rows:
                        mapped_zones.append({
                            "id": z["id"],
                            "name": z["zone_name"],
                            "current_density": z["occupancy"],
                            "max_capacity": z["capacity"],
                            "status": z["status"]
                        })
                    return mapped_zones
        except Exception as e:
            print(f"Error fetching crowd zones: {e}")
            return []

    @staticmethod
    def update_zone(zone_id: str, data: dict):
        if not os.getenv("DATABASE_URL"):
            return None
        
        # Map frontend format to PostgreSQL schema
        db_data = {}
        if "name" in data:
            db_data["zone_name"] = data["name"]
        if "current_density" in data:
            db_data["occupancy"] = data["current_density"]
        if "max_capacity" in data:
            db_data["capacity"] = data["max_capacity"]
        if "status" in data:
            db_data["status"] = data["status"]

        if not db_data:
            return None

        try:
            with get_db_connection() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    keys = list(db_data.keys())
                    values = [db_data[k] for k in keys]
                    set_clause = ", ".join([f"{k} = %s" for k in keys])
                    query = f"update public.crowd_zones set {set_clause} where id = %s returning id, zone_name, occupancy, capacity, status;"
                    cur.execute(query, values + [zone_id])
                    conn.commit()
                    z = cur.fetchone()
                    if z:
                        return {
                            "id": z["id"],
                            "name": z["zone_name"],
                            "current_density": z["occupancy"],
                            "max_capacity": z["capacity"],
                            "status": z["status"]
                        }
                    return None
        except Exception as e:
            print(f"Error updating zone: {e}")
            return None
