# 🏥 SarvamHealth AI Voice Medical Assistant

A cutting-edge, voice-first AI medical assistant designed for clinics and hospitals. This application allows patients to effortlessly book, manage, and inquire about medical appointments using natural continuous speech, mimicking a real phone call with a receptionist.

![Voice Assistant](https://img.shields.io/badge/Status-Completed-success?style=for-the-badge)
![React](https://img.shields.io/badge/Frontend-React_18-blue?style=for-the-badge&logo=react)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi)
![Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E?style=for-the-badge&logo=supabase)

## 🌟 Key Features

### 🎙️ Core Voice AI System
- **Fully Conversational:** Continuous voice loop (Speech-to-Text → AI Processing → Text-to-Speech).
- **Intelligent Intent Parsing:** Accurately extracts doctor names, dates, times, and actions (Book, Cancel, Reschedule) from natural speech.
- **Zero Hallucination Guarantee:** The AI is strictly context-bound to real-time database availability. It cannot invent doctors or time slots.
- **High Reliability:** Implements a robust 3-key fallback rotation for the Groq API to ensure the assistant never crashes due to rate limits.

### 👥 User Dashboard & Authentication
- Secure patient signup and login.
- Personalized **My Bookings** dashboard where patients can view their complete appointment history (Confirmed and Cancelled).
- Session memory automatically expires after 1 hour of inactivity for security.

### 🛡️ Admin Dashboard
- **Role-Based Access Control (RBAC):** Dedicated view exclusively for clinic administrators.
- **Data Analytics:** Real-time statistics on total appointments, active doctors, and available slots.
- **Comprehensive Management:** View all patient bookings, active doctors, and schedule configurations in one clean interface.

## 🛠️ Technology Stack

**Frontend:**
- **React.js (Vite):** Blazing fast component rendering.
- **Tailwind CSS:** Custom styled with modern glassmorphism UI, smooth micro-animations, and a premium dark mode aesthetic.
- **Web Speech API:** Utilizes native browser `SpeechRecognition` (STT) and `SpeechSynthesis` (TTS) for zero-latency voice interactions.

**Backend:**
- **FastAPI (Python):** High-performance asynchronous REST API.
- **Groq LLM (`llama-3.3-70b-versatile`):** Powers the core conversational intelligence.
- **Supabase (PostgreSQL):** Robust relational database handling users, doctors, time slots, and appointments. Enforces strict backend validation (e.g., preventing double-bookings).

**Deployment:**
- **Vercel:** Hosts both the React frontend and the serverless FastAPI backend seamlessly.

## ⚙️ Architecture Flow

1. **User Speaks:** Patient clicks the microphone and speaks naturally.
2. **STT:** Browser converts audio to text.
3. **AI Processing:** FastAPI sends the transcript + real-time clinic availability to the LLM.
4. **Action Tagging:** The LLM generates conversational text AND a strict JSON `<action>` tag (e.g., `{"type": "book", "date": "2026-06-23"}`).
5. **Database Execution:** Backend executes the action tag against Supabase, updating the database.
6. **TTS:** The React frontend reads the conversational response aloud to the user.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (3.10+)
- Supabase Project
- Groq API Key

### Local Setup
1. Clone the repository.
2. Install frontend dependencies: `npm install`
3. Install backend dependencies: `pip install -r requirements.txt`
4. Set up your `.env` variables for Supabase and Groq.
5. Run the frontend: `npm run dev`
6. Run the backend: `cd backend && uvicorn main:app --reload`


