import time
import random
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

load_dotenv()

connection_string = os.getenv("DATABASE_URL")

# Stadium Zones to simulate
ZONES = [
    {"id": "gate_a", "name": "East Gate A", "capacity": 5000},
    {"id": "gate_b", "name": "West Gate B", "capacity": 4000},
    {"id": "concourse_1", "name": "Level 1 Concourse", "capacity": 8000},
    {"id": "food_court", "name": "Central Plaza Food Court", "capacity": 2000},
    {"id": "vip_lounge", "name": "Executive VIP Lounge", "capacity": 500},
]

def get_db_connection():
    return psycopg2.connect(connection_string)

def initialize_zones():
    if not connection_string:
        print("Error: DATABASE_URL is missing. Cannot initialize zones.")
        return
        
    print("Initializing stadium zones in Neon database...")
    try:
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                for zone in ZONES:
                    # Check if zone exists
                    cur.execute("select id from public.crowd_zones where id = %s;", (zone["id"],))
                    row = cur.fetchone()
                    
                    zone_data = {
                        "id": zone["id"],
                        "zone_name": zone["name"],
                        "capacity": zone["capacity"],
                        "occupancy": random.uniform(0.1, 0.3),  # Initial 10-30%
                        "status": "Normal"
                    }
                    
                    if row:
                        # Update existing
                        cur.execute("update public.crowd_zones set zone_name = %s, capacity = %s, occupancy = %s, status = %s where id = %s;",
                                    (zone_data["zone_name"], zone_data["capacity"], zone_data["occupancy"], zone_data["status"], zone_data["id"]))
                    else:
                        # Insert new
                        cur.execute("insert into public.crowd_zones (id, zone_name, capacity, occupancy, status) values (%s, %s, %s, %s, %s);",
                                    (zone_data["id"], zone_data["zone_name"], zone_data["capacity"], zone_data["occupancy"], zone_data["status"]))
                conn.commit()
                print("Successfully initialized all zones in Neon!")
    except Exception as e:
        print(f"Error seeding Neon zones: {e}")

def simulate():
    if not connection_string:
        print("Error: DATABASE_URL is offline. Simulation aborted.")
        return

    print("Starting crowd simulation (Ctrl+C to stop)...")
    while True:
        try:
            with get_db_connection() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    for zone in ZONES:
                        # Fetch current occupancy
                        cur.execute("select occupancy from public.crowd_zones where id = %s;", (zone["id"],))
                        row = cur.fetchone()
                        current = 0.5
                        if row:
                            current = row["occupancy"]
                        
                        # Fluctuate by +/- 5%
                        new_density = max(0.01, min(1.0, current + random.uniform(-0.05, 0.05)))
                        
                        status = "Normal"
                        if new_density > 0.8:
                            status = "Congested"
                        if new_density > 0.95:
                            status = "Critical"
                            
                        cur.execute("update public.crowd_zones set occupancy = %s, status = %s where id = %s;",
                                    (new_density, status, zone["id"]))
                        
                        print(f"Updated {zone['name']}: {new_density:.2%} ({status})")
                    
                    conn.commit()
        except Exception as e:
            print(f"Error during simulation loop: {e}")
            
        time.sleep(5)  # Update every 5 seconds

if __name__ == "__main__":
    initialize_zones()
    simulate()
