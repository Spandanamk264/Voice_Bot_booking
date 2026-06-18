import { useMemo } from 'react';

/**
 * Premium animated voice orb component inspired by Sarvam AI's glowing saffron pulse.
 * Features concentric animated rings, wave bars for listening, and a spinning gradient ring.
 */
export default function VoiceOrb({ status, onClick }) {
  const isActive = status !== 'idle';

  const orbConfig = useMemo(() => {
    switch (status) {
      case 'listening':
        return {
          bg: 'bg-gradient-to-br from-blue-500 to-blue-600',
          glow: 'shadow-glow-blue',
          ringColor: 'border-blue-500/30',
          ringColorOuter: 'border-blue-500/10',
          label: 'Listening...',
          sublabel: 'Speak naturally',
        };
      case 'thinking':
        return {
          bg: 'bg-gradient-to-br from-saffron-500 to-amber-500',
          glow: 'shadow-glow-saffron',
          ringColor: 'border-saffron-500/30',
          ringColorOuter: 'border-saffron-500/10',
          label: 'Processing',
          sublabel: 'Understanding your request...',
        };
      case 'speaking':
        return {
          bg: 'bg-gradient-to-br from-saffron-500 to-orange-500',
          glow: 'shadow-glow-saffron-lg',
          ringColor: 'border-saffron-500/40',
          ringColorOuter: 'border-saffron-500/15',
          label: 'Speaking',
          sublabel: 'Listen to the response',
        };
      default:
        return {
          bg: 'bg-gradient-to-br from-dark-500 to-dark-600',
          glow: '',
          ringColor: 'border-white/5',
          ringColorOuter: 'border-white/0',
          label: 'Start Conversation',
          sublabel: 'Tap the orb to begin',
        };
    }
  }, [status]);

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Orb container */}
      <div className="relative flex items-center justify-center w-[180px] h-[180px] sm:w-[240px] sm:h-[240px]">

        {/* Outer pulse ring */}
        {isActive && (
          <div
            className={`absolute rounded-full border-2 ${orbConfig.ringColorOuter}`}
            style={{
              width: 220,
              height: 220,
              animation: 'orbPulseOuter 2.5s ease-in-out infinite',
            }}
          />
        )}

        {/* Inner pulse ring */}
        {isActive && (
          <div
            className={`absolute rounded-full border-2 ${orbConfig.ringColor}`}
            style={{
              width: 190,
              height: 190,
              animation: 'orbPulse 2s ease-in-out infinite',
            }}
          />
        )}

        {/* Spinning gradient border ring */}
        {isActive && (
          <div
            className="absolute rounded-full animate-spin-slow"
            style={{
              width: 168,
              height: 168,
              background: `conic-gradient(from 0deg, transparent 0%, ${status === 'listening' ? 'rgba(59,130,246,0.4)' : 'rgba(255,107,43,0.4)'} 25%, transparent 50%)`,
              padding: 2,
            }}
          >
            <div className="w-full h-full rounded-full bg-dark-900" />
          </div>
        )}

        {/* Main orb button */}
        <button
          onClick={onClick}
          className={`relative z-10 w-28 h-28 sm:w-36 sm:h-36 rounded-full ${orbConfig.bg} ${orbConfig.glow} flex items-center justify-center transition-all duration-500 cursor-pointer hover:scale-105 active:scale-95`}
        >
          {/* Idle icon — microphone */}
          {status === 'idle' && (
            <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
            </svg>
          )}

          {/* Listening — animated wave bars */}
          {status === 'listening' && (
            <div className="flex items-center gap-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-1.5 bg-white rounded-full"
                  style={{
                    animation: `waveBar 0.8s ease-in-out ${i * 0.12}s infinite`,
                    height: 16,
                  }}
                />
              ))}
            </div>
          )}

          {/* Thinking — spinning loader */}
          {status === 'thinking' && (
            <div className="w-10 h-10 border-3 border-white/30 border-t-white rounded-full animate-spin" />
          )}

          {/* Speaking — audio wave */}
          {status === 'speaking' && (
            <div className="flex items-center gap-1.5">
              {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="w-1 bg-white/90 rounded-full"
                  style={{
                    animation: `waveBar 0.6s ease-in-out ${i * 0.08}s infinite`,
                    height: 12,
                  }}
                />
              ))}
            </div>
          )}
        </button>
      </div>

      {/* Status text */}
      <div className="text-center space-y-1.5">
        <p className={`text-lg font-semibold tracking-tight ${isActive ? 'text-dark-50' : 'text-dark-200'}`}>
          {orbConfig.label}
        </p>
        <p className="text-sm text-dark-300">
          {orbConfig.sublabel}
        </p>
      </div>
    </div>
  );
}
