import React from 'react';
import { audioManager } from '../audio/AudioManager';

interface PrimaryButtonProps {
  label: string;
  subtext?: string;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: 'yes' | 'no' | 'accent' | 'subtle';
  style?: React.CSSProperties;
  className?: string;
  disabled?: boolean;
  ariaLabel?: string;
  suppressSound?: boolean;
  type?: 'button' | 'submit';
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  label,
  subtext,
  onClick,
  variant = 'accent',
  style,
  className = '',
  disabled = false,
  ariaLabel,
  suppressSound = false,
  type = 'button'
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (!suppressSound) {
      audioManager.playClick();
    }
    onClick(e);
  };

  return (
    <button
      type={type}
      className={`btn-primary variant-${variant} ${className}`}
      onClick={handleClick}
      disabled={disabled}
      aria-label={ariaLabel || label}
      style={style}
    >
      <span className="btn-main-label">{label}</span>
      {subtext && <span className="btn-sub-label">{subtext}</span>}
    </button>
  );
};
