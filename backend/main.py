from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import voice, admin, appointments, auth
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(title="Voice Medical Bot API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(voice.router, prefix="/api/voice", tags=["Voice"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(appointments.router, prefix="/api/appointments", tags=["Appointments"])
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])

@app.get("/")
def read_root():
    return {"message": "Voice Medical Bot API is running!"}
