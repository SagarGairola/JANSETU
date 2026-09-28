import React from 'react';

export interface AlertBlockProps {
  type?: 'info' | 'warning' | 'danger';
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const AlertBlock: React.FC<AlertBlockProps> = ({
  type = 'info',
  title,
  children,
  className = '',
}) => {
  const typeClass =
    type === 'warning'
      ? 'alert-warning'
      : type === 'danger'
      ? 'alert-danger'
      : '';

  const icon = type === 'warning' ? '⚠' : type === 'danger' ? '✕' : 'ℹ';

  return (
    <div className={`alert-block ${typeClass} ${className}`.trim()} role="alert">
      <span aria-hidden="true" style={{ fontWeight: 'bold' }}>
        {icon}
      </span>
      <div>
        {title && <strong style={{ display: 'block', marginBottom: '0.25rem' }}>{title}</strong>}
        <div>{children}</div>
      </div>
    </div>
  );
};
