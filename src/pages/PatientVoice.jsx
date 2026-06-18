import { useState, useCallback, useRef, useEffect } from "react";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { useTTS } from "../hooks/useTTS";
import client from "../api/client";
import Navbar from "../components/Navbar";
import VoiceOrb from "../components/VoiceOrb";
import ConversationLog from "../components/ConversationLog";
import { useAuth } from "../context/AuthContext";

export default function PatientVoice() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState("idle");
  const { speak, stop: stopTTS } = useTTS();
  const startListeningRef = useRef(null);

  useEffect(() => {
    if (user?.id) {
      client.get(`/voice/history/${user.id}`)
        .then(res => {
          if (res.data.history) {
            setHistory(res.data.history);
          }
        })
        .catch(err => console.error("Failed to load history", err));
    }
  }, [user]);

  const handleUserSpeech = useCallback(async (transcript) => {
    setStatus("thinking");

    const newHistory = [...history, { role: "user", content: transcript }];
    setHistory(newHistory);

    try {
      const res = await client.post("/voice/chat", {
        message: transcript,
        session_history: history,
        user_id: user?.id,
        user_email: user?.email
      });

      let reply = res.data.reply;
      let shouldEnd = false;

      // Strip ALL <action> tags and check for end_conversation
      if (reply.includes('<action>')) {
        // Check if any action is end_conversation
        const allActions = reply.match(/<action>[\s\S]*?<\/action>/g) || [];
        for (const tag of allActions) {
          if (tag.includes('"end_conversation"')) {
            shouldEnd = true;
          }
        }
        // Remove all action tags from the spoken text
        reply = reply.replace(/<action>[\s\S]*?<\/action>/g, '').trim();
      }

      // Clean up any empty reply (if the AI only sent action tags)
      if (!reply) {
        reply = shouldEnd ? "Goodbye! Take care." : "Done!";
      }

      const updatedHistory = [...newHistory, { role: "assistant", content: reply }];
      setHistory(updatedHistory);

      setStatus("speaking");
      speak(reply, () => {
        if (shouldEnd) {
          setStatus("idle");
        } else {
          setTimeout(() => {
            setStatus((prev) => {
              if (prev === "speaking") {
                 startListeningRef.current?.();
                 return "listening";
              }
              return prev;
            });
          }, 300);
        }
      });
    } catch (error) {
      console.error(error);
      const errReply = "I'm having trouble connecting right now. Please tap the orb to try again.";
      setHistory((prev) => [...prev, { role: "assistant", content: errReply }]);
      setStatus("speaking");
      speak(errReply, () => setStatus("idle"));
    }
  }, [history, speak, user]);

  const { startListening, stopListening, error } = useSpeechRecognition({
    onResult: handleUserSpeech,
    onEnd: () => {
      setStatus((prev) => (prev === "listening" ? "idle" : prev));
    }
  });

  useEffect(() => {
    startListeningRef.current = startListening;
  }, [startListening]);

  const clickDebounceRef = useRef(false);

  const handleOrbClick = () => {
    if (clickDebounceRef.current) return;
    clickDebounceRef.current = true;
    setTimeout(() => { clickDebounceRef.current = false; }, 600);

    if (status === "idle") {
      setStatus("speaking");
      const greeting = "Hello! I'm your medical appointment assistant. How can I help you today?";
      setHistory((prev) => [...prev, { role: "assistant", content: greeting }]);
      speak(greeting, () => {
        setTimeout(() => {
          // Double check we are still in speaking status, not interrupted
          setStatus((prev) => {
            if (prev === "speaking") {
               startListeningRef.current?.();
               return "listening";
            }
            return prev;
          });
        }, 300);
      });
    } else if (status === "listening") {
      stopListening();
      window.speechSynthesis.cancel();
      setStatus("idle");
    } else if (status === "speaking") {
      // INTERRUPT: User tapped while AI is speaking — stop and listen
      stopTTS();
      window.speechSynthesis.cancel();
      setTimeout(() => {
        setStatus("listening");
        startListeningRef.current?.();
      }, 400);
    } else if (status === "thinking") {
      // While thinking, just stop everything
      window.speechSynthesis.cancel();
      setStatus("idle");
    }
  };

  return (
    <div className="relative min-h-screen bg-dark-900 overflow-hidden">
      <div className="noise-overlay" />

      <div className="absolute top-[-200px] left-[-100px] w-[500px] h-[500px] rounded-full opacity-[0.07]"
        style={{ background: 'radial-gradient(circle, rgba(255,107,43,0.6) 0%, transparent 70%)' }} />
      <div className="absolute bottom-[-150px] right-[-100px] w-[600px] h-[600px] rounded-full opacity-[0.05]"
        style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.6) 0%, transparent 70%)' }} />
      <div className="absolute top-[40%] left-[60%] w-[300px] h-[300px] rounded-full opacity-[0.04]"
        style={{ background: 'radial-gradient(circle, rgba(255,107,43,0.5) 0%, transparent 70%)' }} />

      <Navbar />

      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 pt-20">
        <div className="text-center mb-8 sm:mb-12 animate-fadeInUp">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-3 sm:mb-4">
            <span className="text-dark-50">Voice</span>{' '}
            <span className="gradient-text">Medical</span>{' '}
            <span className="text-dark-50">Assistant</span>
          </h1>
          <p className="text-dark-200 text-base sm:text-lg max-w-md mx-auto leading-relaxed">
            Book, reschedule, or cancel appointments using just your voice.
            Powered by AI for a seamless experience.
          </p>
        </div>

        <div className="animate-fadeInUp-delay-1">
          <VoiceOrb status={status} onClick={handleOrbClick} />
        </div>

        {status === "speaking" && (
          <p className="mt-3 text-xs text-dark-400 animate-fadeInUp">Tap the orb to interrupt</p>
        )}

        {error && (
          <div className="mt-6 px-5 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm max-w-md text-center animate-fadeInUp">
            {error}
          </div>
        )}

        <div className="animate-fadeInUp-delay-2 w-full max-w-2xl px-2 sm:px-0">
          <ConversationLog history={history} />
        </div>

        <div className="mt-8 sm:mt-12 mb-8 flex flex-wrap justify-center gap-2 sm:gap-3 animate-fadeInUp-delay-3 w-full max-w-lg px-2">
          {['Book Appointments', 'Check Availability', 'Cancel Bookings', 'Find Specialists'].map((feature) => (
            <span key={feature} className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-medium tracking-wide text-dark-300 border border-white/[0.06] bg-white/[0.02]">
              {feature}
            </span>
          ))}
        </div>
      </main>
    </div>
  );
}
