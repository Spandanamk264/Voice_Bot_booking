from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.supabase_service import supabase

router = APIRouter()

class SignupRequest(BaseModel):
    full_name: str
    email: str
    password: str
    phone: str = ""

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/signup")
async def signup(req: SignupRequest):
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")
        
    # Check if user exists
    existing = supabase.table("users").select("id").eq("email", req.email).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="User already exists with this email")
        
    # Insert new user
    result = supabase.table("users").insert({
        "full_name": req.full_name,
        "email": req.email,
        "password": req.password,  # In a real app, hash this!
        "phone": req.phone
    }).execute()
    
    user = result.data[0]
    return {
        "success": True, 
        "user": {
            "id": user["id"], 
            "full_name": user["full_name"], 
            "email": user["email"],
            "phone": user["phone"]
        }
    }

@router.post("/login")
async def login(req: LoginRequest):
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")
        
    result = supabase.table("users").select("id, full_name, email, password, phone").eq("email", req.email).execute()
    
    if not result.data:
        raise HTTPException(status_code=401, detail="Invalid email or password")
        
    user = result.data[0]
    
    if user["password"] != req.password:
        raise HTTPException(status_code=401, detail="Invalid email or password")
        
    return {
        "success": True, 
        "user": {
            "id": user["id"], 
            "full_name": user["full_name"], 
            "email": user["email"],
            "phone": user["phone"]
        }
    }
