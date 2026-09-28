import React from 'react';
import type { ReadinessStatus } from '../types';

export interface StatusBadgeProps {
  status: ReadinessStatus | 'available';
  customLabel?: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  customLabel,
  className = '',
}) => {
  let badgeClass = 'badge-neutral';
  let icon = '•';
  let defaultLabel = 'Pending';

  switch (status) {
    case 'ready':
    case 'available':
      badgeClass = 'badge-ready';
      icon = '✓';
      defaultLabel = 'Ready / Available';
      break;
    case 'missing':
      badgeClass = 'badge-missing';
      icon = '✕';
      defaultLabel = 'Missing Document';
      break;
    case 'verification_required':
      badgeClass = 'badge-verify';
      icon = '⚠';
      defaultLabel = 'Needs Verification';
      break;
    case 'ineligible':
      badgeClass = 'badge-missing';
      icon = '✕';
      defaultLabel = 'Requirement Not Satisfied';
      break;
  }

  const labelText = customLabel || defaultLabel;

  return (
    <span
      className={`status-badge ${badgeClass} ${className}`.trim()}
      role="status"
      aria-label={labelText}
    >
      <span aria-hidden="true">{icon}</span>
      <span>{labelText}</span>
    </span>
  );
};

export interface FrictionBadgeProps {
  score: number;
  label?: string;
  className?: string;
}

export const FrictionBadge: React.FC<FrictionBadgeProps> = ({ score, label, className = '' }) => {
  let badgeColorStyle: React.CSSProperties = {
    backgroundColor: '#ecfdf5',
    color: '#065f46',
    border: '1px solid #a7f3d0',
  };
  let dotColor = '#10b981';
  let defaultLabel = 'Fast to Apply';

  if (score >= 7) {
    badgeColorStyle = {
      backgroundColor: '#fef2f2',
      color: '#991b1b',
      border: '1px solid #fecaca',
    };
    dotColor = '#ef4444';
    defaultLabel = 'High Documentation Required';
  } else if (score >= 4) {
    badgeColorStyle = {
      backgroundColor: '#fffbeb',
      color: '#92400e',
      border: '1px solid #fde68a',
    };
    dotColor = '#f59e0b';
    defaultLabel = 'Moderate Documentation';
  }

  const displayLabel = label || defaultLabel;

  return (
    <span
      className={`friction-badge inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border shadow-sm ${className}`.trim()}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.375rem',
        padding: '0.2rem 0.625rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: 700,
        ...badgeColorStyle,
      }}
      role="note"
      aria-label={`Bureaucracy friction score ${score} out of 10: ${displayLabel}`}
    >
      <span
        style={{
          width: '0.5rem',
          height: '0.5rem',
          borderRadius: '9999px',
          backgroundColor: dotColor,
          display: 'inline-block',
        }}
        aria-hidden="true"
      />
      <span>Friction: {score}/10</span>
      <span style={{ opacity: 0.85, fontWeight: 500 }}>• {displayLabel}</span>
    </span>
  );
};
