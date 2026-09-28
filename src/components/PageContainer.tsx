import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './Button';

export interface PageContainerProps {
  stepNumber: number;
  title: string;
  description: string;
  children: React.ReactNode;
  backPath?: string;
  nextPath?: string;
  nextLabel?: string;
  onNext?: () => void;
  primaryActionDisabled?: boolean;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  stepNumber,
  title,
  description,
  children,
  backPath,
  nextPath,
  nextLabel = 'Continue to Next Step →',
  onNext,
  primaryActionDisabled = false,
}) => {
  const navigate = useNavigate();

  const handleNext = () => {
    if (onNext) {
      onNext();
    } else if (nextPath) {
      navigate(nextPath);
    }
  };

  const handleBack = () => {
    if (backPath) {
      navigate(backPath);
    }
  };

  return (
    <main className="page-container">
      <header className="page-header">
        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-brand-primary)', marginBottom: '0.25rem' }}>
          SCREEN {stepNumber} OF 10
        </div>
        <h1 className="page-title">{title}</h1>
        <p className="page-description">{description}</p>
      </header>

      <section className="page-content">{children}</section>

      <nav className="page-nav-actions" aria-label="Step navigation">
        <div>
          {backPath ? (
            <Button variant="secondary" onClick={handleBack}>
              ← Back
            </Button>
          ) : (
            <span />
          )}
        </div>
        <div>
          {(nextPath || onNext) && (
            <Button
              variant="primary"
              onClick={handleNext}
              disabled={primaryActionDisabled}
            >
              {nextLabel}
            </Button>
          )}
        </div>
      </nav>
    </main>
  );
};
