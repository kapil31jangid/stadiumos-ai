import os
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    return psycopg2.connect(os.getenv("DATABASE_URL"))

class TransportRepository:
    @staticmethod
    def get_transport_metrics():
        if not os.getenv("DATABASE_URL"):
            return {
                "id": "main_station",
                "parking_wait": 10,
                "metro_wait": 18,
                "bus_wait": 2,
                "rideshare_wait": 5
            }
        try:
            with get_db_connection() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute("select id, parking_wait, metro_wait, bus_wait, rideshare_wait from public.transport where id = 'main_station';")
                    row = cur.fetchone()
                    if row:
                        return dict(row)
                    
                    # Seed default if missing
                    default_val = {
                        "id": "main_station",
                        "parking_wait": 10,
                        "metro_wait": 18,
                        "bus_wait": 2,
                        "rideshare_wait": 5
                    }
                    cur.execute("insert into public.transport (id, parking_wait, metro_wait, bus_wait, rideshare_wait) values (%s, %s, %s, %s, %s) returning id, parking_wait, metro_wait, bus_wait, rideshare_wait;",
                                (default_val["id"], default_val["parking_wait"], default_val["metro_wait"], default_val["bus_wait"], default_val["rideshare_wait"]))
                    conn.commit()
                    new_row = cur.fetchone()
                    return dict(new_row) if new_row else default_val
        except Exception as e:
            print(f"Error fetching transport metrics: {e}")
            return {
                "id": "main_station",
                "parking_wait": 10,
                "metro_wait": 18,
                "bus_wait": 2,
                "rideshare_wait": 5
            }

    @staticmethod
    def update_transport_metrics(data: dict):
        if not os.getenv("DATABASE_URL") or not data:
            return None
        try:
            with get_db_connection() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    keys = list(data.keys())
                    values = [data[k] for k in keys]
                    set_clause = ", ".join([f"{k} = %s" for k in keys])
                    query = f"update public.transport set {set_clause} where id = 'main_station' returning id, parking_wait, metro_wait, bus_wait, rideshare_wait;"
                    cur.execute(query, values)
                    conn.commit()
                    row = cur.fetchone()
                    return dict(row) if row else None
        except Exception as e:
            print(f"Error updating transport metrics: {e}")
            return None
