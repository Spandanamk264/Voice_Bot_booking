/**
 * TTS hook with consistent voice selection and natural speech preprocessing.
 * Optimized for both desktop and mobile browsers.
 */
export function useTTS() {
  // Cache the selected voice so it stays consistent throughout the session
  let cachedVoice = null;

  const getVoice = () => {
    if (cachedVoice) return cachedVoice;

    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return null;

    // Priority order: prefer clear English voices for a professional medical assistant
    const preferences = [
      // Edge/Chrome high-quality voices (desktop)
      (v) => v.name.includes("Microsoft Guy") && v.lang.startsWith("en"),
      (v) => v.name.includes("Microsoft David") && v.lang.startsWith("en"),
      (v) => v.name.includes("Microsoft Mark") && v.lang.startsWith("en"),
      // Google voices (desktop Chrome + Android)
      (v) => v.name.includes("Google UK English Male"),
      (v) => v.name.includes("Google US English"),
      // Android-specific high quality voices
      (v) => v.lang === "en-US" && v.name.toLowerCase().includes("male"),
      (v) => v.lang === "en-IN" && !v.name.toLowerCase().includes("female"),
      (v) => v.lang === "en-US",
      (v) => v.lang === "en-GB",
      // Any English voice as last resort
      (v) => v.lang.startsWith("en"),
    ];

    for (const pref of preferences) {
      const match = voices.find(pref);
      if (match) {
        cachedVoice = match;
        console.log("[TTS] Selected voice:", match.name, match.lang);
        return match;
      }
    }

    cachedVoice = voices[0];
    return voices[0];
  };

  // Preprocess text so it sounds natural when spoken aloud
  const preprocessForSpeech = (text) => {
    let processed = text;

    // Remove any leftover action tags or JSON
    processed = processed.replace(/<action>[\s\S]*?<\/action>/g, "");

    // ── Expand abbreviations so TTS reads them correctly ──
    processed = processed.replace(/\bDr\.\s*/gi, "Doctor ");
    processed = processed.replace(/\bMr\.\s*/gi, "Mister ");
    processed = processed.replace(/\bMrs\.\s*/gi, "Missus ");
    processed = processed.replace(/\bMs\.\s*/gi, "Miss ");
    processed = processed.replace(/\bSt\.\s*/gi, "Saint ");
    processed = processed.replace(/\bAM\b/g, "A M");
    processed = processed.replace(/\bPM\b/g, "P M");
    processed = processed.replace(/\be\.g\./gi, "for example");
    processed = processed.replace(/\bi\.e\./gi, "that is");

    // Convert common 24-hour time formats to spoken form
    processed = processed.replace(/(\d{1,2}):00\s*(AM|PM|am|pm|A M|P M)/g, "$1 $2");
    processed = processed.replace(/(\d{1,2}):(\d{2})\s*(AM|PM|am|pm|A M|P M)/g, "$1 $3");
    processed = processed.replace(/\b09:00\b/g, "9 A M");
    processed = processed.replace(/\b10:00\b/g, "10 A M");
    processed = processed.replace(/\b11:00\b/g, "11 A M");
    processed = processed.replace(/\b12:00\b/g, "12 P M");
    processed = processed.replace(/\b13:00\b/g, "1 P M");
    processed = processed.replace(/\b14:00\b/g, "2 P M");
    processed = processed.replace(/\b15:00\b/g, "3 P M");
    processed = processed.replace(/\b16:00\b/g, "4 P M");
    processed = processed.replace(/\b17:00\b/g, "5 P M");

    // Convert date formats like 2026-06-24 to spoken form
    processed = processed.replace(/(\d{4})-(\d{2})-(\d{2})/g, (_, y, m, d) => {
      const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
      const month = months[parseInt(m) - 1] || m;
      const day = parseInt(d);
      return `${month} ${day}`;
    });

    // Remove UUIDs
    processed = processed.replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, "");

    // Clean up multiple spaces
    processed = processed.replace(/\s{2,}/g, " ");

    return processed.trim();
  };

  const speak = (text, onEnd) => {
    window.speechSynthesis.cancel();

    const processedText = preprocessForSpeech(text);
    
    // Split text into smaller sentences to bypass Chrome's 15-second TTS timeout bug
    const chunks = processedText.match(/[^.!?]+[.!?]+|\s*[^.!?]+$/g)
      ?.map(s => s.trim())
      .filter(s => s.length > 0) || [];

    if (chunks.length === 0) {
      if (onEnd) onEnd();
      return;
    }

    let currentChunk = 0;

    const speakNextChunk = () => {
      if (currentChunk >= chunks.length) {
        if (onEnd) onEnd();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(chunks[currentChunk]);
      utterance.rate = 0.92;    // Slightly slower for clarity
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      const voice = getVoice();
      if (voice) {
        utterance.voice = voice;
      }

      // Move to next chunk when current finishes
      utterance.onend = () => {
        currentChunk++;
        speakNextChunk();
      };

      utterance.onerror = (e) => {
        console.warn("[TTS] Error on chunk:", e);
        currentChunk++;
        speakNextChunk(); // skip failing chunk, continue
      };

      window.speechSynthesis.speak(utterance);
    };

    // Chrome bug workaround: voices may not load immediately
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.onvoiceschanged = null; // Prevent infinite loop
        speakNextChunk();
      };
    } else {
      speakNextChunk();
    }
  };

  const stop = () => {
    window.speechSynthesis.cancel();
  };

  return { speak, stop };
}
