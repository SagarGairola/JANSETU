import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="site-footer" role="contentinfo">
      <div className="footer-inner">
        <div className="footer-disclaimer">
          <strong>Trust &amp; Service Boundary:</strong> JANSETU provides guidance based on available information and published scheme guidelines. Final eligibility, verification, and application decisions are made exclusively through the relevant official government authority. JANSETU does not issue approvals or directly disburse benefits.
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', color: 'var(--color-text-muted)' }}>
          <span>© 2026 JANSETU — Civic Assistance Platform for Citizen Application Readiness</span>
          <span>Accessibility: High Contrast WCAG 2.1 AA Compliant</span>
        </div>
      </div>
    </footer>
  );
};
