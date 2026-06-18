from fastapi import APIRouter, HTTPException
from models.schemas import DoctorCreate, TimeSlotCreate, SpecialtyCreate
from services.supabase_service import supabase

router = APIRouter()

@router.get("/specialties")
async def get_specialties():
    if not supabase: return []
    res = supabase.table("specialties").select("*").execute()
    return res.data

@router.post("/specialties")
async def create_specialty(spec: SpecialtyCreate):
    if not supabase: return {"error": "DB not setup"}
    res = supabase.table("specialties").insert(spec.dict()).execute()
    return res.data

@router.get("/doctors")
async def get_doctors():
    if not supabase: return []
    res = supabase.table("doctors").select("*, specialties(name)").execute()
    return res.data

@router.post("/doctors")
async def create_doctor(doc: DoctorCreate):
    if not supabase: return {"error": "DB not setup"}
    res = supabase.table("doctors").insert(doc.dict(exclude_none=True)).execute()
    return res.data

@router.get("/slots")
async def get_slots():
    if not supabase: return []
    res = supabase.table("time_slots").select("*, doctors(name)").execute()
    return res.data

@router.post("/slots")
async def create_slot(slot: TimeSlotCreate):
    if not supabase: return {"error": "DB not setup"}
    slot_dict = slot.dict()
    slot_dict['start_time'] = slot.start_time.isoformat()
    slot_dict['end_time'] = slot.end_time.isoformat()
    res = supabase.table("time_slots").insert(slot_dict).execute()
    return res.data
