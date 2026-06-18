from pydantic import BaseModel
from typing import List, Optional
from datetime import date, time

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    session_history: List[ChatMessage]
    user_id: Optional[str] = None
    user_email: Optional[str] = None

class DoctorCreate(BaseModel):
    name: str
    specialty_id: str
    bio: Optional[str] = None

class SpecialtyCreate(BaseModel):
    name: str

class TimeSlotCreate(BaseModel):
    doctor_id: str
    day_of_week: int
    start_time: time
    end_time: time
    is_active: bool = True

class AppointmentCreate(BaseModel):
    doctor_id: str
    patient_name: str
    patient_phone: Optional[str] = None
    appointment_date: date
    start_time: time
    end_time: time
