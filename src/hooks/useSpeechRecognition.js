import { useEffect, useRef, useState, useCallback } from "react";

export function useSpeechRecognition({ onResult, onEnd }) {
  const recognitionRef = useRef(null);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState(null);
  const finalTranscriptRef = useRef("");
  const explicitStopRef = useRef(false);
  const isMobileRef = useRef(false);
  const retryCountRef = useRef(0);
  const MAX_RETRIES = 5;

  useEffect(() => {
    // Detect mobile
    isMobileRef.current = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in this browser. Please use Google Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;

    // Use continuous mode everywhere so it doesn't cut users off when they pause
    recognition.continuous = true;
    recognition.interimResults = true;

    let silenceTimer = null;

    const safeRestart = () => {
      if (explicitStopRef.current) return;
      if (retryCountRef.current >= MAX_RETRIES) {
        console.log("[SPEECH] Max retries reached, stopping.");
        setListening(false);
        if (onEnd) onEnd();
        return;
      }
      retryCountRef.current++;
      const delay = Math.min(300 * retryCountRef.current, 1500);
      console.log(`[SPEECH] Auto-restarting in ${delay}ms (attempt ${retryCountRef.current}/${MAX_RETRIES})`);
      setTimeout(() => {
        if (explicitStopRef.current) return;
        try {
          recognition.start();
        } catch (err) {
          console.log("[SPEECH] Restart failed:", err.message);
          if (err.message?.includes('already started')) return;
          setListening(false);
          if (onEnd) onEnd();
        }
      }, delay);
    };

    recognition.onresult = (e) => {
      // Reset retry counter on any successful result
      retryCountRef.current = 0;

      let final = "";
      let interim = "";

      for (let i = 0; i < e.results.length; i++) {
        const transcript = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          final += transcript + " ";
        } else {
          interim += transcript;
        }
      }

      if (final.trim()) {
        finalTranscriptRef.current = final.trim();
      }

      // On mobile, submit immediately when we get a final result
      if (isMobileRef.current && final.trim()) {
        const result = finalTranscriptRef.current;
        explicitStopRef.current = true;
        try { recognition.stop(); } catch (_) {}
        setError(null);
        onResult(result);
        finalTranscriptRef.current = "";
        return;
      }

      // On desktop, wait 2 seconds of silence after the last word
      clearTimeout(silenceTimer);
      silenceTimer = setTimeout(() => {
        const result = finalTranscriptRef.current;
        if (result) {
          explicitStopRef.current = true;
          recognition.stop();
          setError(null);
          onResult(result);
          finalTranscriptRef.current = "";
        }
      }, 2000);
    };

    recognition.onend = () => {
      clearTimeout(silenceTimer);
      
      if (!explicitStopRef.current) {
        if (isMobileRef.current) {
          // On mobile, if we have accumulated text, submit it
          const result = finalTranscriptRef.current;
          if (result) {
            setError(null);
            onResult(result);
            finalTranscriptRef.current = "";
            setListening(false);
            if (onEnd) onEnd();
          } else {
            // No result yet — try to auto-restart
            safeRestart();
          }
        } else {
          // Desktop: auto-restart silently for infinite listening
          safeRestart();
        }
      } else {
        setListening(false);
        if (onEnd) onEnd();
      }
    };

    recognition.onerror = (e) => {
      clearTimeout(silenceTimer);
      console.log("[SPEECH ERROR]", e.error);

      // These are recoverable errors — auto-retry silently
      if (['no-speech', 'aborted', 'network', 'audio-capture', 'service-not-allowed'].includes(e.error)) {
        if (!explicitStopRef.current) {
          safeRestart();
        }
        return;
      }

      // Permission denied — this requires user action, show a helpful message
      if (e.error === 'not-allowed') {
        setError("Microphone access was denied. Please allow microphone permission in your browser settings and refresh the page.");
        explicitStopRef.current = true;
        setListening(false);
        if (onEnd) onEnd();
        return;
      }

      // Unknown error — try to recover silently, only show error if retries exhausted
      if (!explicitStopRef.current && retryCountRef.current < MAX_RETRIES) {
        safeRestart();
        return;
      }

      setError("Voice input had a problem. Tap the orb to try again.");
      explicitStopRef.current = true;
      setListening(false);
      if (onEnd) onEnd();
    };

    recognitionRef.current = recognition;

    return () => {
      clearTimeout(silenceTimer);
    };
  }, [onResult, onEnd]);

  const startListening = useCallback(() => {
    explicitStopRef.current = false;
    retryCountRef.current = 0;
    setError(null);
    finalTranscriptRef.current = "";
    try {
      recognitionRef.current?.start();
      setListening(true);
    } catch (e) {
      if (e.message?.includes('already started')) return;
      console.error("[SPEECH] Start failed:", e);
      setError("Could not start voice input. Please check your microphone and try again.");
    }
  }, []);

  const stopListening = useCallback(() => {
    explicitStopRef.current = true;
    retryCountRef.current = 0;
    try { recognitionRef.current?.stop(); } catch (_) { /* ignore */ }
    setListening(false);
  }, []);

  return { startListening, stopListening, listening, error };
}
