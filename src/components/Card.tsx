import React from 'react';
import { FrictionBadge } from './StatusBadge';

export interface CardProps {
  title?: string;
  titleAs?: 'h2' | 'h3' | 'h4';
  subtitle?: string;
  badge?: React.ReactNode;
  frictionScore?: number;
  frictionLabel?: string;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  isSelected?: boolean;
}

export const Card: React.FC<CardProps> = ({
  title,
  titleAs = 'h2',
  subtitle,
  badge,
  frictionScore,
  frictionLabel,
  children,
  onClick,
  className = '',
  isSelected,
}) => {
  const clickableClass = onClick ? 'card-clickable' : '';
  const selectedClass = isSelected ? 'card-selected' : '';
  const TitleTag = titleAs;

  return (
    <article
      className={`card ${clickableClass} ${selectedClass} ${className}`.trim()}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      aria-pressed={onClick ? isSelected : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      {(title || subtitle || badge || typeof frictionScore === 'number') && (
        <header className="card-header">
          <div>
            {title && <TitleTag className="card-title">{title}</TitleTag>}
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.375rem' }}>
            {badge && <div>{badge}</div>}
            {typeof frictionScore === 'number' && (
              <FrictionBadge score={frictionScore} label={frictionLabel} />
            )}
          </div>
        </header>
      )}
      <div className="card-body">{children}</div>
    </article>
  );
};
