from fastapi import APIRouter
from services.supabase_service import supabase

router = APIRouter()

@router.get("/")
async def get_appointments():
    if not supabase: return []
    res = supabase.table("appointments").select("*, doctors(name)").execute()
    return res.data

@router.get("/user/{user_id}")
async def get_user_appointments(user_id: str):
    if not supabase: return []
    res = supabase.table("appointments").select("*, doctors(name)").eq("user_id", user_id).order("appointment_date", desc=True).execute()
    return res.data
