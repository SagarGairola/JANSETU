import React from 'react';

interface ReactionTextProps {
  text: string;
  className?: string;
  variant?: 'subtle' | 'warning' | 'accent' | 'comedy';
  shakeOnChange?: boolean;
}

export const ReactionText: React.FC<ReactionTextProps> = ({
  text,
  className = '',
  variant = 'comedy',
  shakeOnChange = true
}) => {
  if (!text) return null;

  const colorMap = {
    subtle: 'var(--text-secondary)',
    warning: 'var(--color-no)',
    accent: 'var(--color-accent)',
    comedy: '#ffd166'
  };

  return (
    <div
      key={text}
      role="status"
      aria-live="polite"
      className={`reaction-text-container ${shakeOnChange ? 'animate-shake' : 'animate-fade-in'} ${className}`}
      style={{
        color: colorMap[variant],
        fontSize: 'clamp(14px, 4.2vw, 17px)',
        fontWeight: 600,
        textAlign: 'center',
        minHeight: '26px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: '12px'
      }}
    >
      {text}
    </div>
  );
};
