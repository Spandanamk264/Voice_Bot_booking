"""
Vercel serverless function entry point for the FastAPI backend.
This file wraps the FastAPI app so Vercel can serve it as a serverless function.
"""
import sys
import os

# Add the backend directory to Python path so imports work
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

# Load environment variables
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '..', 'backend', '.env'))

from main import app
