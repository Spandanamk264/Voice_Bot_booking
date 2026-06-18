import os
import json
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

supabase_url = os.getenv("SUPABASE_URL", "")
supabase_key = os.getenv("SUPABASE_KEY", "")

supabase: Client = None

def init_supabase():
    global supabase
    if supabase_url and supabase_key and supabase_url.startswith("https://"):
        try:
            supabase = create_client(supabase_url, supabase_key)
            print("Supabase connected successfully!")
        except Exception as e:
            print(f"Supabase connection failed: {e}")
            supabase = None
    else:
        print("Supabase not configured. Add SUPABASE_URL and SUPABASE_KEY to .env")

init_supabase()
