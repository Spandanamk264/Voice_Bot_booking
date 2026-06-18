/**
 * Scrollable conversation transcript panel with timestamped entries.
 */
export default function ConversationLog({ history }) {
  if (!history || history.length === 0) return null;

  return (
    <div className="w-full max-w-lg mt-6 animate-fadeInUp">
      <div className="glass-card p-5 max-h-64 overflow-y-auto space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-dark-300 mb-3">
          Conversation Transcript
        </p>
        {history.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-accent-blue/10 text-blue-300 border border-blue-500/10 rounded-br-md'
                  : 'bg-saffron-500/10 text-saffron-200 border border-saffron-500/10 rounded-bl-md'
              }`}
            >
              <span className="block text-[10px] font-medium uppercase tracking-wider mb-1 opacity-50">
                {msg.role === 'user' ? 'You' : 'Assistant'}
              </span>
              {msg.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
