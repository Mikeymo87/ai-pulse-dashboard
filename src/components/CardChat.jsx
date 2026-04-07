/**
 * CardChatButton — fires a custom DOM event that ChatPanel listens for.
 * ChatPanel opens itself and auto-sends the contextMessage as the conversation opener.
 *
 * Props:
 *   color          — hex accent color for the button
 *   contextMessage — the pre-built message to send into chat (string)
 *   label          — optional button label (default: "Discuss in chat →")
 */
const MONO = "'JetBrains Mono', 'Fira Code', monospace";

export function CardChatButton({ color, contextMessage, label }) {
  const isNarrative = color === '#7DE69B';
  const textColor   = isNarrative ? '#4db86e' : color;

  function handleClick() {
    document.dispatchEvent(
      new CustomEvent('card-chat', { detail: { contextMessage } })
    );
  }

  return (
    <button
      onClick={handleClick}
      style={{
        width: '100%',
        background: 'transparent',
        border: `1px solid ${color}22`,
        borderRadius: 8,
        padding: '11px 14px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        transition: 'all 0.15s ease',
        marginTop: 2,
        minHeight: 44,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = `${color}10`;
        e.currentTarget.style.borderColor = `${color}35`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.borderColor = `${color}22`;
      }}
    >
      <span style={{
        fontFamily: MONO, fontSize: 9, fontWeight: 700,
        letterSpacing: '0.12em', color: textColor,
        display: 'flex', alignItems: 'center', gap: 7,
      }}>
        <span style={{ fontSize: 10, opacity: 0.75 }}>✦</span>
        {label ?? 'ASK AI ABOUT THIS'}
      </span>
      <span style={{ fontFamily: MONO, fontSize: 10, color: textColor, opacity: 0.6 }}>→</span>
    </button>
  );
}
