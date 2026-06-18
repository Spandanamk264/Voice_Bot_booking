import os
import json
import re
from datetime import datetime
from groq import Groq
from services.booking_service import get_clinic_context, book_appointment_by_name, cancel_appointment

# ── Multiple API keys with automatic fallback ──
# Using env vars first, then hardcoded fallbacks provided by user
GROQ_KEYS = [
    "add_your_groq_api_key_here",
]
GROQ_KEYS = [k for k in GROQ_KEYS if k and not k.startswith("add_")]

DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

MODEL = "llama-3.3-70b-versatile"

SYSTEM_PROMPT = """
You are a friendly voice medical appointment assistant for a clinic called SarvamHealth.
You help patients book, reschedule, cancel, and inquire about appointments.

CRITICAL RULES:
- NEVER make up doctor names, slots, or availability. Only use the CLINIC DATA below.
- Keep responses SHORT and conversational — this is spoken aloud, not read on screen.
- NEVER output raw UUIDs, IDs, or technical data to the user.
- Ask follow-up questions naturally when info is missing (name, mobile number, preferred day/time).
- You MUST ask for BOTH their Full Name and their Mobile Number before booking.
- Always confirm the full details before booking: doctor name, date, time, patient name, and mobile number.
- After the patient confirms, you MUST output the action tag to execute the booking.

VOICE OUTPUT RULES:
- Never use special characters, markdown, or formatting.
- In your SPOKEN text, spell out numbers naturally. Say "nine AM" not "9:00 AM".
- Say dates like "Monday, June twenty-second" not "2026-06-22".
- Never read out UUIDs or database IDs.

ACTION TAGS — THIS IS THE MOST IMPORTANT PART:
You MUST include <action> tags to actually execute bookings, cancellations, or rescheduling.
Without <action> tags, NOTHING happens. The system does NOT execute anything unless you include them.
NEVER say "I will cancel" or "I will book" — always say "I have cancelled" or "I have booked" and include the action tag.

AVAILABLE ACTIONS:

1. BOOK APPOINTMENT:
Use this when the patient has confirmed all details (doctor, date, time, their name, their phone).
<action>{"type": "book", "doctor_name": "Doctor Full Name", "date": "YYYY-MM-DD", "time": "HH:MM", "patient_name": "Full Name", "patient_phone": "Phone Number"}</action>

2. CANCEL APPOINTMENT:
Use this if they ask to cancel their appointment.
<action>{"type": "cancel"}</action>

3. RESCHEDULE (cancel existing + book new in one step):
<action>{"type": "reschedule", "doctor_name": "Dr. Full Name", "date": "YYYY-MM-DD", "time": "HH:MM", "patient_name": "Full Name", "patient_phone": "1234567890"}</action>

REMEMBER:
- If the user gives ALL details and confirms, IMMEDIATELY execute with the action tag. Do NOT keep asking repeatedly.
- When rescheduling, use the "reschedule" type — it cancels the old one and books the new one automatically.
- ALWAYS include the action tag. Without it, the patient's request is NOT fulfilled.
- NEVER repeat the same confirmation details twice. Say it ONCE, keep it short and natural.
- Do NOT say "Here is the confirmation:" and then repeat everything. Just confirm it naturally in one sentence.
- ALWAYS place your spoken text FIRST, then the <action> tag at the END of your response. Never put action tags in the middle of spoken text.
- Use your INTENT understanding to detect when the user wants to end the conversation. If their message conveys farewell, gratitude, or closure (like "ok thank you have a nice day", "that's all", "bye", "thanks a lot", "ok done", "alright thank you"), respond with a warm goodbye and include the end_conversation action.

EXAMPLE — GOODBYE:
User: "Ok thank you so much, have a nice day!"
You: "You're welcome! Wishing you a speedy recovery. Have a wonderful day!"
<action>{"type": "end_conversation"}</action>
"""

async def handle_action(action_json_str: str, user_id: str = None, user_email: str = None):
    """Parse and execute an action from the AI's response."""
    try:
        action = json.loads(action_json_str)
        action_type = action.get("type")
        
        if action_type == "book":
            result = await book_appointment_by_name(
                doctor_name=action["doctor_name"],
                date_str=action["date"],
                time_str=action["time"],
                patient_name=action["patient_name"],
                patient_phone=action.get("patient_phone", ""),
                user_id=user_id,
                user_email=user_email
            )
            print(f"[ACTION] Booking result: {result}")
            return result
            
        elif action_type == "cancel":
            result = await cancel_appointment(user_id)
            print(f"[ACTION] Cancel result: {result}")
            return result
            
        elif action_type == "reschedule":
            # Step 1: Cancel existing appointments
            cancel_result = await cancel_appointment(user_id)
            print(f"[ACTION] Reschedule - cancel step: {cancel_result}")
            
            # Step 2: Book the new appointment
            book_result = await book_appointment_by_name(
                doctor_name=action["doctor_name"],
                date_str=action["date"],
                time_str=action["time"],
                patient_name=action["patient_name"],
                patient_phone=action.get("patient_phone", ""),
                user_id=user_id,
                user_email=user_email
            )
            print(f"[ACTION] Reschedule - book step: {book_result}")
            return book_result
            
        elif action_type == "end_conversation":
            print("[ACTION] Conversation ended by AI.")
            return {"success": True, "action": "end_conversation"}
            
    except json.JSONDecodeError as e:
        print(f"[ACTION ERROR] Invalid JSON in action tag: {e}")
        print(f"[ACTION ERROR] Raw string was: {action_json_str}")
        return None
    except Exception as e:
        print(f"[ACTION ERROR] Failed to execute action: {e}")
        return None


def _call_groq(messages: list) -> str:
    """Call Groq API with automatic key rotation on rate limit errors."""
    last_error = None
    
    for i, key in enumerate(GROQ_KEYS):
        try:
            c = Groq(api_key=key)
            chat_completion = c.chat.completions.create(
                messages=messages,
                model=MODEL,
                temperature=0.3,
                max_tokens=500
            )
            reply = chat_completion.choices[0].message.content
            print(f"[GROQ] Success with API key #{i+1}")
            return reply
        except Exception as e:
            error_msg = str(e)
            last_error = e
            if "rate_limit" in error_msg.lower() or "429" in error_msg:
                print(f"[GROQ] Rate limited on key #{i+1}, trying next key...")
                continue
            else:
                print(f"[GROQ] Error on key #{i+1}: {error_msg}")
                raise e
    
    print(f"[GROQ] All {len(GROQ_KEYS)} API keys are rate-limited!")
    raise last_error


async def get_ai_response(user_message: str, history: list, user_id: str = None, user_email: str = None) -> str:
    """Get AI response, parse any action tags, and execute them."""
    clinic_data = await get_clinic_context()
    
    now = datetime.now()
    current_day = DAY_NAMES[now.weekday()]
    time_context = (
        f"\n\nCURRENT DATE & TIME:\n"
        f"Today is {current_day}, {now.strftime('%B %d, %Y')}. "
        f"Current time is {now.strftime('%I:%M %p')}.\n"
    )
    
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT + time_context + f"\nCLINIC DATA:\n{clinic_data}"}
    ]
    
    # Pass the full history as requested to keep memory perfect
    for msg in history:
        messages.append({"role": msg["role"], "content": msg["content"]})
        
    messages.append({"role": "user", "content": user_message})
    
    reply = _call_groq(messages)
    
    print(f"[AI RAW REPLY] {reply[:300]}...")
    
    # Extract and execute ALL action tags (there may be multiple)
    if "<action>" in reply and "</action>" in reply:
        # Find all action tags using regex — use DOTALL to handle multi-line JSON
        action_matches = re.findall(r'<action>\s*(\{[^}]*\})\s*</action>', reply, re.DOTALL | re.IGNORECASE)
        if not action_matches:
            # Fallback: try the broader pattern
            action_matches = re.findall(r'<action>(.*?)</action>', reply, re.DOTALL)
        for action_str in action_matches:
            action_str = action_str.strip()
            print(f"[AI ACTION DETECTED] {action_str}")
            try:
                result = await handle_action(action_str, user_id, user_email)
                if result and result.get("error"):
                    print(f"[AI ACTION FAILED] {result['error']}")
                else:
                    print(f"[AI ACTION SUCCESS] {result}")
            except Exception as e:
                print(f"[AI ACTION EXCEPTION] {e}")
    else:
        print("[AI] No action tag in response")
        
    return reply
