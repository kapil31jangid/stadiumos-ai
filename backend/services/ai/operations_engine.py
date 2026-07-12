import json
from utils.gemini_client import llm

class AIOperationsEngine:
    @staticmethod
    async def generate_route_recommendation(user_location: str, destination: str, role: str, zones_list: list):
        # 1. Build Context string from the provided zone data
        stadium_context = ""
        for z in zones_list:
            stadium_context += f"- {z['name']}: {z['current_density']:.1%} full, status: {z['status']}\n"

        # 2. Handle LLM Offline Fallback
        if not llm:
            best_zone = "Main Concourse"
            lowest_density = 1.0
            
            # Simple offline fallback logic
            for z in zones_list:
                if z["name"] != user_location and z["current_density"] < lowest_density:
                    lowest_density = z["current_density"]
                    best_zone = z["name"]
            
            return {
                "recommendation": f"Head to the destination. Current data suggests the clearest path is via {best_zone} ({lowest_density:.0%} occupancy). [Smart Fallback Mode]",
                "status": "Fallback"
            }

        # 3. AI Mode
        role_instruction = ""
        if role == "fan":
            role_instruction = "Focus on the tournament experience: suggest the fastest/safest route, concessions queue times, and accessibility options."
        elif role == "volunteer":
            role_instruction = "Focus on volunteer task execution: suggest the next task to prioritize, help report incidents, and offer translation suggestions."
        elif role == "security":
            role_instruction = "Focus on safety and incident logs: summarize security incidents, review risk levels, and suggest crowd control actions."
        elif role == "organizer":
            role_instruction = "Focus on operations and decisions: recommend operational actions, direct resources, and suggest emergency broadcasts."
        elif role == "venue_staff":
            role_instruction = "Focus on facilities maintenance: suggest repairs, highlight cleaning status, and recommend energy/water optimizations."
        else:
            role_instruction = "Provide helpful navigation and pathfinding guidance based on the current stadium layout."

        prompt = (
            "You are the StadiumOS AI Assistant, a dedicated operations and spectator support AI for the FIFA World Cup 2026 stadium.\n"
            "Your behavior is strictly restricted to the context of the stadium, match-day operations, crowd management, navigation, accessibility, safety, sustainability, and volunteer/staff coordination.\n"
            "If the user query is completely unrelated to the stadium, match, operations, or navigation, politely refuse to answer and redirect them back to stadium operational queries.\n\n"
            f"Current User Role: {role or 'fan'}\n"
            f"Role Focus: {role_instruction}\n"
            f"Current Stadium State:\n{stadium_context}\n"
            f"User Location/Context: {user_location}\n"
            f"Target Destination/Query: {destination}\n\n"
            "Instructions:\n"
            "1. Answer the query using the provided live stadium state and your role focus.\n"
            "2. Keep the answer concise and practical.\n"
            "3. If the query asks for general information outside this stadium/tournament context, reply: 'I can only assist with StadiumOS operational queries and match-day services.'"
        )

        try:
            response = await llm.ainvoke(prompt)
            return {"recommendation": response.content, "status": "Success"}
        except Exception as e:
            print(f"Gemini Invoke Error: {e}")
            return {
                "recommendation": f"Proceed to {destination}. Watch for signs in the main concourse or consult stadium staff. [Service Error Fallback]",
                "status": "Error-Fallback"
            }

    @staticmethod
    async def generate_announcement(incident: str, location: str, severity: str):
        if not llm:
            return {
                "public_announcement": f"ALERT: Incident ({incident}) reported at {location}. Please follow signs. [Offline Mode]",
                "volunteer_instructions": "Check location, assist spectators, monitor gates. [Offline Mode]",
                "security_brief": "Deploy officers, check access corridors. [Offline Mode]",
                "translations": {
                    "en": f"ALERT: {incident} at {location}.",
                    "es": f"ALERTA: {incident} en {location}."
                }
            }
        
        prompt = (
            f"You are the StadiumOS AI Announcement Engine.\n"
            f"Incident: {incident}\n"
            f"Location: {location}\n"
            f"Severity: {severity}\n\n"
            "Generate a structured JSON response containing:\n"
            "1. 'public_announcement': Clear instruction for public address broadcast system.\n"
            "2. 'volunteer_instructions': Specific duties for local volunteers.\n"
            "3. 'security_brief': Brief for dispatching security officers.\n"
            "4. 'translations': A dictionary containing translations of the public announcement in: en, es, fr, ar, hi, ja.\n\n"
            "Return ONLY a valid JSON object matching these keys. Do not include markdown formatting or backticks."
        )
        try:
            response = await llm.ainvoke(prompt)
            content = response.content.strip()
            if content.startswith("```json"):
                content = content[7:]
            if content.endswith("```"):
                content = content[:-3]
            return json.loads(content.strip())
        except Exception as e:
            print(f"Announcement generation error: {e}")
            return {
                "public_announcement": f"ALERT: Incident ({incident}) at {location}. Proceed with caution.",
                "volunteer_instructions": "Assist with crowd flow near location.",
                "security_brief": "Review security status at location.",
                "translations": {
                    "en": f"ALERT: {incident} at {location}."
                }
            }

    @staticmethod
    async def analyze_incident(incident_type: str, location: str, severity: str, description: str):
        if not llm:
            return {
                "summary": f"Incident logged: {incident_type} at {location}",
                "priority": "HIGH" if severity == "Critical" else "MEDIUM",
                "suggested_response": "Deploy standard personnel to site. [Offline Mode]"
            }
            
        prompt = (
            f"You are the StadiumOS Security & Operations AI.\n"
            f"Incident logged: {incident_type}\n"
            f"Location: {location}\n"
            f"Severity: {severity}\n"
            f"Description: {description}\n\n"
            "Generate a brief JSON response containing:\n"
            "1. 'summary': Single-sentence description of the issue.\n"
            "2. 'priority': Assessment (URGENT, HIGH, MEDIUM, LOW).\n"
            "3. 'suggested_response': Standard operational mitigation recommendation.\n\n"
            "Return ONLY a valid JSON object matching these keys."
        )
        try:
            response = await llm.ainvoke(prompt)
            content = response.content.strip()
            if content.startswith("```json"):
                content = content[7:]
            if content.endswith("```"):
                content = content[:-3]
            return json.loads(content.strip())
        except Exception as e:
            print(f"Incident analysis error: {e}")
            return {
                "summary": f"Reported {incident_type} at {location}.",
                "priority": "HIGH" if severity == "Critical" else "MEDIUM",
                "suggested_response": "Standard check by security dispatch."
            }

    @staticmethod
    async def get_sustainability_recommendations():
        if not llm:
            return {
                "recommendations": [
                    "Optimize lighting schedules during non-peak window.",
                    "Verify water pressure levels in restrooms."
                ]
            }
        
        prompt = (
            "You are the StadiumOS Sustainability AI.\n"
            "Analyze the current FIFA 2026 match-day operations.\n"
            "Provide three actionable green recommendations to save resources (e.g., energy, water, HVAC loads).\n"
            "Return ONLY a valid JSON object containing a 'recommendations' key which is a list of strings."
        )
        try:
            response = await llm.ainvoke(prompt)
            content = response.content.strip()
            if content.startswith("```json"):
                content = content[7:]
            if content.endswith("```"):
                content = content[:-3]
            return json.loads(content.strip())
        except Exception as e:
            print(f"Sustainability recommendations error: {e}")
            return {
                "recommendations": [
                    "Reduce concourse overhead lighting during high daylight hours.",
                    "Stagger HVAC startup cycles to avoid power demand spikes."
                ]
            }

    @staticmethod
    async def get_maintenance_suggestions():
        if not llm:
            return {
                "suggestions": [
                    "Inspect escalators in West Concourse.",
                    "Review water filtration levels."
                ]
            }
        
        prompt = (
            "You are the StadiumOS Maintenance Support AI.\n"
            "Generate three preventative maintenance task recommendations for a FIFA World Cup stadium based on equipment load.\n"
            "Return ONLY a valid JSON object containing a 'suggestions' key which is a list of strings."
        )
        try:
            response = await llm.ainvoke(prompt)
            content = response.content.strip()
            if content.startswith("```json"):
                content = content[7:]
            if content.endswith("```"):
                content = content[:-3]
            return json.loads(content.strip())
        except Exception as e:
            print(f"Maintenance suggestions error: {e}")
            return {
                "suggestions": [
                    "Monitor elevator cabin vibration levels in Section 102.",
                    "Service entrance Gate B turnstile bearings before halftime surge."
                ]
            }
