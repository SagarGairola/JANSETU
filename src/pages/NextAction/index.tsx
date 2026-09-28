import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PageContainer } from '../../components/PageContainer';
import { GuidanceBlock } from '../../components/GuidanceBlock';
import { useDemo } from '../../context';
import { evaluateEligibility } from '../../utils/eligibilityEvaluator';
import { evaluateReadiness } from '../../utils/readinessEvaluator';
import { determineNextAction } from '../../utils/nextActionEngine';

export const NextActionPage: React.FC = () => {
  const { currentScheme, answers, documentStatuses } = useDemo();

  // 1. Evaluate upstream eligibility
  const eligibilityResult = useMemo(() => {
    return currentScheme ? evaluateEligibility(currentScheme, answers) : null;
  }, [currentScheme, answers]);

  // 2. Derive scheme-scoped document overrides
  const currentSchemeDocStatuses = useMemo(() => {
    return currentScheme ? (documentStatuses[currentScheme.id] || {}) : {};
  }, [documentStatuses, currentScheme]);

  // 3. Evaluate application readiness
  const readinessResult = useMemo(() => {
    if (!currentScheme || !eligibilityResult) return null;
    return evaluateReadiness(currentScheme, eligibilityResult, currentSchemeDocStatuses);
  }, [currentScheme, eligibilityResult, currentSchemeDocStatuses]);

  // 4. Derive prioritized next action
  const nextAction = useMemo(() => {
    if (!currentScheme || !readinessResult) return null;
    return determineNextAction(currentScheme, readinessResult);
  }, [currentScheme, readinessResult]);

  // Guard against missing scheme
  if (!currentScheme || !readinessResult || !nextAction) {
    return (
      <PageContainer
        stepNumber={8}
        title="Prioritized Next Action"
        description="JANSETU translates your eligibility and readiness status into a single, concrete next step."
        backPath="/schemes"
        nextPath="/schemes"
        nextLabel="Browse Scheme Catalog →"
      >
        <div className="requirements-summary-strip">
          <div>
            <h2 className="requirement-item-title">No Scheme Selected</h2>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
              Please select a government scheme to evaluate your prioritized next step.
            </p>
          </div>
          <Link to="/schemes" className="btn btn-primary" style={{ textDecoration: 'none' }}>
            Browse Schemes
          </Link>
        </div>
      </PageContainer>
    );
  }

  const isFullyReady = nextAction.type === 'prepare_application';

  return (
    <PageContainer
      stepNumber={8}
      title="Prioritized Next Action"
      description="JANSETU translates your eligibility and readiness status into a single, concrete next step."
      backPath="/requirements"
      nextPath={isFullyReady ? '/official-application' : '/requirements'}
      nextLabel={isFullyReady ? 'Proceed to Official Portal Info →' : 'View Application Requirements →'}
    >
      {/* Scheme Context Bar */}
      <section className="readiness-scheme-bar" aria-label="Scheme context">
        <div>
          <div className="readiness-scheme-name">{currentScheme.name}</div>
          <p className="readiness-scheme-dept">
            {currentScheme.ministryOrDepartment} • Target Portal: {currentScheme.officialPortalName}
          </p>
        </div>
      </section>

      {/* Primary Action Hero Spotlight */}
      <section
        aria-labelledby="primary-action-heading"
        className={`next-action-hero-card type-${nextAction.type}`}
      >
        <header className="next-action-hero-header">
          <span className={`next-action-priority-badge badge-${nextAction.type}`}>
            {nextAction.priorityLabel}
          </span>
          <h2 id="primary-action-heading" className="next-action-hero-title">
            {nextAction.title}
          </h2>
          {nextAction.designatedAuthorityOrPortal && (
            <div className="next-action-authority-tag">
              Designated Office / Portal: {nextAction.designatedAuthorityOrPortal}
            </div>
          )}
        </header>

        <div className="next-action-details-grid">
          {/* Why this comes first */}
          <div className="next-action-field">
            <span className="next-action-field-label">Why this comes first:</span>
            <p className="next-action-field-desc">{nextAction.whyThisComesFirst}</p>
          </div>

          {/* What to do */}
          <div className="next-action-field">
            <span className="next-action-field-label">What to do:</span>
            <p className="next-action-field-desc">{nextAction.whatToDo}</p>
          </div>

          {/* Step-by-step instructions */}
          <div className="next-action-steps-wrap">
            <span className="next-action-field-label">Action steps:</span>
            <ol className="next-action-steps-list">
              {nextAction.instructions.map((inst, idx) => (
                <li key={idx}>{inst}</li>
              ))}
            </ol>
          </div>

          {/* What happens after that */}
          <div className="next-action-after-box">
            <span className="next-action-field-label">What happens after that:</span>
            <p className="next-action-field-desc" style={{ margin: 0 }}>
              {nextAction.whatHappensNext}
            </p>
          </div>
        </div>

        {/* Visually Dominant Primary CTA */}
        <div className="next-action-cta-wrap">
          <Link
            to={nextAction.primaryCtaPath}
            className={`btn btn-primary next-action-primary-btn btn-${nextAction.type}`}
          >
            {nextAction.primaryCtaLabel}
          </Link>
        </div>
      </section>

      {/* Current Application Readiness Summary Strip */}
      <section
        aria-labelledby="status-summary-heading"
        className="next-action-status-card"
      >
        <h2 id="status-summary-heading" className="next-action-section-title">
          Your Application Readiness Status
        </h2>

        <div className="readiness-counts-strip" style={{ marginTop: '0.5rem', borderTop: 'none', paddingTop: 0 }}>
          <span className="readiness-count-chip count-ready">
            ✓ {readinessResult.readyItems.length} Ready
          </span>
          {readinessResult.missingItems.length > 0 && (
            <span className="readiness-count-chip count-missing">
              ○ {readinessResult.missingItems.length} Missing
            </span>
          )}
          {readinessResult.verificationItems.length > 0 && (
            <span className="readiness-count-chip count-verify">
              ? {readinessResult.verificationItems.length} Needs Check
            </span>
          )}
          {readinessResult.blockers.length > 0 && (
            <span className="readiness-count-chip count-blocker">
              ! {readinessResult.blockers.length} Blocker
            </span>
          )}
          <span className="readiness-count-chip" style={{ marginLeft: 'auto' }}>
            {readinessResult.totalReady} of {readinessResult.totalRequired} Total Items Satisfied
          </span>
        </div>

        <p style={{ margin: '0.75rem 0 0 0', fontSize: '0.875rem', lineHeight: '1.45', color: 'var(--color-text-main)' }}>
          <strong>Assessment:</strong> {readinessResult.summaryDiagnostic}
        </p>
      </section>

      {/* Secondary Actions Bar */}
      <section aria-labelledby="secondary-nav-heading" className="next-action-secondary-nav">
        <h2 id="secondary-nav-heading" className="sr-only">
          Secondary Navigation Options
        </h2>
        <div className="secondary-actions-bar">
          <Link to="/requirements" className="secondary-action-pill">
            ← Review Requirements Checklist
          </Link>
          <Link to="/eligibility" className="secondary-action-pill">
            ← Edit Eligibility Responses
          </Link>
          <Link to="/scheme-details" className="secondary-action-pill">
            View Scheme Details →
          </Link>
        </div>
      </section>

      {/* Civic Assistance Notice */}
      <GuidanceBlock headline="Assistance & Transparency Disclaimer" disclaimer="Civic-Tech Prototype">
        <p style={{ margin: 0, lineHeight: '1.5' }}>
          JANSETU is an advisory decision tool that helps citizens organize application prerequisites before visiting government portals. JANSETU does not issue government approvals or submit applications automatically. Official submission and eligibility decisions are conducted exclusively by <strong>{currentScheme.ministryOrDepartment}</strong>.
        </p>
      </GuidanceBlock>
    </PageContainer>
  );
};
