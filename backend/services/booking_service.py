from services.supabase_service import supabase
from datetime import datetime, timedelta

async def get_clinic_context() -> str:
    """Build a rich, readable context string for the AI with all clinic info."""
    if not supabase:
        return "No clinic data configured. Please contact support."
    
    DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    
    doctors = supabase.table("doctors").select("id, name, bio, specialties(name)").execute()
    slots = supabase.table("time_slots").select("id, doctor_id, day_of_week, start_time, end_time, is_active, doctors(name)").eq("is_active", True).execute()
    appointments = supabase.table("appointments").select("id, doctor_id, patient_name, appointment_date, start_time, end_time, status, doctors(name)").eq("status", "confirmed").execute()
    
    # Build human-readable context
    lines = []
    lines.append("=== DOCTORS ===")
    for doc in doctors.data:
        specialty = doc.get("specialties", {}).get("name", "General") if doc.get("specialties") else "General"
        lines.append(f"- {doc['name']} (ID: {doc['id']}) | Specialty: {specialty} | Bio: {doc.get('bio', 'N/A')}")
    
    lines.append("\n=== UPCOMING AVAILABLE TIME SLOTS ===")
    now = datetime.now()
    
    for slot in slots.data:
        doc_name = slot.get("doctors", {}).get("name", "Unknown") if slot.get("doctors") else "Unknown"
        day_of_week = slot["day_of_week"]
        start_time_str = slot["start_time"]
        end_time_str = slot["end_time"]
        
        # Calculate the actual date for this slot in the upcoming 7 days
        days_ahead = day_of_week - now.weekday()
        if days_ahead < 0:
            days_ahead += 7
            
        slot_date = now.date() + timedelta(days=days_ahead)
        
        # If the slot is today, check if the time has already passed
        if days_ahead == 0:
            # handle formats like "11:00:00" or "11:00"
            time_format = "%H:%M:%S" if ":" in start_time_str and start_time_str.count(":") == 2 else "%H:%M"
            try:
                start_time_obj = datetime.strptime(start_time_str, time_format).time()
                if start_time_obj <= now.time():
                    # It already passed today, so the next available one is exactly 7 days from now
                    days_ahead += 7
                    slot_date = now.date() + timedelta(days=days_ahead)
            except Exception as e:
                pass # Fallback if time parsing fails
                
        day_name = DAY_NAMES[day_of_week]
        date_str = slot_date.strftime("%Y-%m-%d")
        
        lines.append(f"- {doc_name} | {day_name}, {date_str} | {start_time_str} to {end_time_str} | Doctor ID: {slot['doctor_id']}")
    
    lines.append("\n=== CURRENT CONFIRMED APPOINTMENTS ===")
    if appointments.data:
        for apt in appointments.data:
            doc_name = apt.get("doctors", {}).get("name", "Unknown") if apt.get("doctors") else "Unknown"
            lines.append(f"- Patient: {apt['patient_name']} | Doctor: {doc_name} | Date: {apt['appointment_date']} | Time: {apt['start_time']} | Status: {apt['status']}")
    else:
        lines.append("- No confirmed appointments yet.")
        
    return "\n".join(lines)

import dateutil.parser

async def book_appointment_by_name(doctor_name: str, date_str: str, time_str: str, patient_name: str, patient_phone: str = "", user_id: str = None, user_email: str = None) -> dict:
    """Book an appointment by doctor name — looks up the doctor ID automatically."""
    
    # Try to parse and format date properly
    try:
        dt = dateutil.parser.parse(date_str)
        date_str = dt.strftime("%Y-%m-%d")
    except Exception:
        pass
        
    # Try to parse and format time properly
    try:
        tm = dateutil.parser.parse(time_str)
        time_str = tm.strftime("%H:%M")
    except Exception:
        pass
    if not supabase:
        return {"error": "Database not configured"}
    
    # Find doctor by name (fuzzy match)
    doctors = supabase.table("doctors").select("id, name").execute()
    doctor = None
    for doc in doctors.data:
        if doctor_name.lower().replace("dr.", "").strip() in doc["name"].lower().replace("dr.", "").strip() or \
           doc["name"].lower().replace("dr.", "").strip() in doctor_name.lower().replace("dr.", "").strip():
            doctor = doc
            break
    
    if not doctor:
        return {"error": f"Doctor '{doctor_name}' not found"}
    
    # Check for double booking
    existing = supabase.table("appointments")\
        .select("id")\
        .eq("doctor_id", doctor["id"])\
        .eq("appointment_date", date_str)\
        .eq("start_time", time_str)\
        .eq("status", "confirmed")\
        .execute()
    
    if existing.data:
        return {"error": "This slot is already booked"}
    
    # Find the matching slot to get end_time
    end_time = None
    slots = supabase.table("time_slots").select("end_time").eq("doctor_id", doctor["id"]).eq("start_time", time_str).execute()
    if slots.data:
        end_time = slots.data[0]["end_time"]
        
    insert_data = {
        "doctor_id": doctor["id"],
        "patient_name": patient_name,
        "patient_phone": patient_phone,
        "patient_email": user_email or "",
        "appointment_date": date_str,
        "start_time": time_str,
        "end_time": end_time or time_str,
        "status": "confirmed"
    }
    if user_id:
        insert_data["user_id"] = user_id
    
    try:
        result = supabase.table("appointments").insert(insert_data).execute()
        print(f"[BOOKING SUCCESS] {patient_name} with {doctor['name']} on {date_str} at {time_str}")
        return {"success": True, "data": result.data}
    except Exception as e:
        print(f"Error inserting appointment to Postgres: {e}")
        # Could be an invalid TIME or DATE string causing a Postgres type error
        return {"error": f"Failed to save booking. Database rejected the format: {e}"}


async def cancel_appointment(user_id: str = None) -> dict:
    """Cancel all upcoming appointments for the authenticated user."""
    if not supabase:
        return {"error": "Database not configured"}
        
    if not user_id:
        return {"error": "User not authenticated. Cannot cancel."}
    
    # Get the user's confirmed appointments
    appointments = supabase.table("appointments")\
        .select("id")\
        .eq("user_id", user_id)\
        .eq("status", "confirmed")\
        .execute()
        
    if not appointments.data:
        return {"error": "You have no confirmed appointments to cancel."}
        
    # Cancel all of them (or the most recent one if we only want one)
    # We will just cancel all upcoming ones for simplicity if they just say "cancel my appointment"
    for apt in appointments.data:
        supabase.table("appointments").update({"status": "cancelled"}).eq("id", apt["id"]).execute()
        
    return {"success": True, "message": "All your appointments have been cancelled."}
