from fastapi import APIRouter
from models.schemas import ChatRequest
from services.ai_service import get_ai_response
from services.supabase_service import supabase

router = APIRouter()

@router.post("/chat")
async def chat(req: ChatRequest):
    # Process with AI
    history_dicts = [{"role": msg.role, "content": msg.content} for msg in req.session_history]
    
    # We pass user_id to AI service if needed (for cancellation link), but it's not strictly necessary.
    # Actually, cancellation needs user_id. Let's pass user_id to get_ai_response.
    response = await get_ai_response(req.message, history_dicts, req.user_id, req.user_email)
    
    # Save conversation to database if user is logged in
    if req.user_id and supabase:
        try:
            # Save user message
            supabase.table("conversations").insert({
                "user_id": req.user_id,
                "role": "user",
                "content": req.message
            }).execute()
            
            # Save AI response
            # Only save the text part, strip out the <action> tag to keep DB clean
            clean_reply = response.split("<action>")[0].strip() if "<action>" in response else response
            supabase.table("conversations").insert({
                "user_id": req.user_id,
                "role": "assistant",
                "content": clean_reply
            }).execute()
        except Exception as e:
            print(f"Error saving conversation: {e}")
            
    return {"reply": response}

@router.get("/history/{user_id}")
async def get_history(user_id: str):
    if not supabase:
        return {"history": []}
        
    result = supabase.table("conversations")\
        .select("role, content, created_at")\
        .eq("user_id", user_id)\
        .order("created_at", desc=False)\
        .execute()
        
    return {"history": result.data}
