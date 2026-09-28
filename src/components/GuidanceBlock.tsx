import React from 'react';

export interface GuidanceBlockProps {
  headline?: string;
  children: React.ReactNode;
  disclaimer?: string;
  className?: string;
}

export const GuidanceBlock: React.FC<GuidanceBlockProps> = ({
  headline = 'JANSETU Readiness Assessment',
  children,
  disclaimer = 'Based on the information provided',
  className = '',
}) => {
  return (
    <aside className={`guidance-block ${className}`.trim()} aria-label="Guidance assessment">
      <div className="guidance-header">
        <span className="guidance-tag">
          <span aria-hidden="true">✦</span> {headline}
        </span>
        <span className="guidance-disclaimer">{disclaimer}</span>
      </div>
      <div className="guidance-content">{children}</div>
    </aside>
  );
};
