import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PageContainer } from '../../components/PageContainer';
import { StatusBadge } from '../../components/StatusBadge';
import { GuidanceBlock } from '../../components/GuidanceBlock';
import { useDemo } from '../../context';
import { evaluateEligibility } from '../../utils/eligibilityEvaluator';
import { evaluateReadiness } from '../../utils/readinessEvaluator';
import type { ReadinessItemDetail } from '../../types';

export const RequirementsPage: React.FC = () => {
  const {
    currentScheme,
    answers,
    documentStatuses,
    updateDocumentStatus,
    resetDocumentStatuses,
  } = useDemo();

  // Upstream eligibility evaluation
  const eligibilityResult = useMemo(() => {
    return currentScheme ? evaluateEligibility(currentScheme, answers) : null;
  }, [currentScheme, answers]);

  // Document overrides scoped to current scheme
  const currentSchemeDocStatuses = useMemo(() => {
    return currentScheme ? (documentStatuses[currentScheme.id] || {}) : {};
  }, [documentStatuses, currentScheme]);

  // Application readiness evaluation
  const readinessResult = useMemo(() => {
    if (!currentScheme || !eligibilityResult) return null;
    return evaluateReadiness(currentScheme, eligibilityResult, currentSchemeDocStatuses);
  }, [currentScheme, eligibilityResult, currentSchemeDocStatuses]);

  // Edge case: In case currentScheme is undefined
  if (!currentScheme || !readinessResult) {
    return (
      <PageContainer
        stepNumber={7}
        title="What do you need before you can apply?"
        description="JANSETU has separated the requirements that are ready, missing, or still need verification based on your information."
        backPath="/schemes"
        nextPath="/schemes"
        nextLabel="Browse Scheme Catalog →"
      >
        <div className="requirements-summary-strip">
          <div>
            <h2 className="requirement-item-title">No Scheme Selected</h2>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
              Please select a government scheme to evaluate its required documents and prerequisites.
            </p>
          </div>
          <Link to="/schemes" className="btn btn-primary" style={{ textDecoration: 'none' }}>
            Browse Schemes
          </Link>
        </div>
      </PageContainer>
    );
  }

  const hasOverrides = Object.keys(currentSchemeDocStatuses).length > 0;

  return (
    <PageContainer
      stepNumber={7}
      title="What do you need before you can apply?"
      description="JANSETU has separated the requirements that are ready, missing, or still need verification based on your information."
      backPath="/readiness"
      nextPath="/next-action"
      nextLabel="View Recommended Action Roadmap →"
    >
      {/* Scheme Context Bar */}
      <section className="readiness-scheme-bar" aria-label="Scheme context">
        <div>
          <h2 className="readiness-scheme-name">{currentScheme.name}</h2>
          <p className="readiness-scheme-dept">
            {currentScheme.ministryOrDepartment} • Target Portal: {currentScheme.officialPortalName}
          </p>
        </div>
        {hasOverrides && (
          <button
            type="button"
            className="reset-status-btn"
            onClick={resetDocumentStatuses}
            title="Reset document status changes back to default scheme requirements"
          >
            ↺ Reset Document Statuses
          </button>
        )}
      </section>

      {/* Summary Diagnostic Strip */}
      <section className="requirements-summary-strip" aria-label="Requirement summary breakdown">
        <div>
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-brand-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Prerequisite Summary
          </span>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: 'var(--color-text-main)' }}>
            Based on the information provided and published guidelines for this scheme.
          </p>
        </div>
        <div className="requirements-counts-wrap">
          {readinessResult.blockers.length > 0 && (
            <span className="readiness-count-chip count-blocker">
              ! {readinessResult.blockers.length} Blocked
            </span>
          )}
          <span className="readiness-count-chip count-missing">
            ○ {readinessResult.missingItems.length} Missing
          </span>
          <span className="readiness-count-chip count-verify">
            ? {readinessResult.verificationItems.length} Needs Verification
          </span>
          <span className="readiness-count-chip count-ready">
            ✓ {readinessResult.readyItems.length} Ready
          </span>
        </div>
      </section>

      {/* Civic Assistance Notice */}
      <GuidanceBlock headline="Understanding Application Prerequisites" disclaimer="Assistance Prototype">
        <p style={{ margin: 0, lineHeight: '1.5' }}>
          Official portals such as <strong>{currentScheme.officialPortalName}</strong> cross-reference submitted proofs with state and national records. JANSETU highlights exactly which items must be obtained or verified in advance to prevent rejected applications or procedural delays.
        </p>
      </GuidanceBlock>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
        {/* SECTION 1: BLOCKERS (if any) */}
        {readinessResult.blockers.length > 0 && (
          <section aria-labelledby="heading-blockers">
            <h2 id="heading-blockers" className="requirements-section-title status-blocked-title">
              <span>!</span> Application Blockers ({readinessResult.blockers.length})
            </h2>
            <div className="readiness-items-list">
              {readinessResult.blockers.map((item: ReadinessItemDetail) => (
                <article key={item.id} className="requirement-detail-card card-blocker">
                  <header className="requirement-card-header">
                    <div>
                      <h3 className="requirement-item-title">{item.title}</h3>
                    </div>
                    <StatusBadge status="ineligible" customLabel="Blocked for now" />
                  </header>

                  <div className="requirement-breakdown-box">
                    <div className="requirement-field">
                      <span className="requirement-field-label">Why it matters:</span>
                      <p className="requirement-field-val">{item.purposeOrReason}</p>
                    </div>
                    <div className="requirement-field">
                      <span className="requirement-field-label">What JANSETU knows:</span>
                      <p className="requirement-field-val">
                        Condition reported as not satisfied based on your declared applicant profile.
                      </p>
                    </div>
                  </div>

                  <div className="requirement-action-box">
                    <span className="requirement-field-label" style={{ color: '#991b1b' }}>What to do:</span>
                    <p className="requirement-field-val" style={{ color: '#991b1b' }}>
                      {item.actionableHint || 'Submitting on the official portal right now will lead to immediate rejection.'}
                    </p>
                  </div>

                  <footer className="requirement-card-actions">
                    <span className="readiness-action-label">Action:</span>
                    <Link to="/eligibility" className="status-toggle-btn" style={{ textDecoration: 'none' }}>
                      ← Review Eligibility Responses
                    </Link>
                  </footer>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* SECTION 2: MISSING REQUIREMENTS */}
        <section aria-labelledby="heading-missing">
          <h2 id="heading-missing" className="requirements-section-title status-missing-title">
            <span>○</span> Missing Requirements ({readinessResult.missingItems.length})
          </h2>
          {readinessResult.missingItems.length === 0 ? (
            <div className="requirement-detail-card" style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                ✓ No missing mandatory requirements detected.
              </p>
            </div>
          ) : (
            <div className="readiness-items-list">
              {readinessResult.missingItems.map((item: ReadinessItemDetail) => (
                <article key={item.id} className="requirement-detail-card card-missing">
                  <header className="requirement-card-header">
                    <div>
                      <h3 className="requirement-item-title">{item.title}</h3>
                      {item.issuingAuthority && (
                        <div className="requirement-item-authority">
                          Issuing Authority: {item.issuingAuthority}
                        </div>
                      )}
                    </div>
                    <StatusBadge status="missing" customLabel="Missing" />
                  </header>

                  <div className="requirement-breakdown-box">
                    <div className="requirement-field">
                      <span className="requirement-field-label">Why it matters:</span>
                      <p className="requirement-field-val">{item.purposeOrReason}</p>
                    </div>
                    <div className="requirement-field">
                      <span className="requirement-field-label">What JANSETU knows:</span>
                      <p className="requirement-field-val">
                        JANSETU has not marked this requirement as available.
                      </p>
                    </div>
                  </div>

                  <div className="requirement-action-box">
                    <span className="requirement-field-label" style={{ color: '#c2410c' }}>What still needs to be done:</span>
                    <p className="requirement-field-val" style={{ color: '#c2410c' }}>
                      {item.actionableHint || 'Mandatory document must be acquired before submitting on the portal.'}
                    </p>
                  </div>

                  {item.type === 'document' && (
                    <footer className="requirement-card-actions">
                      <span className="readiness-action-label">I have this:</span>
                      <button
                        type="button"
                        className="status-toggle-btn btn-to-available"
                        onClick={() => updateDocumentStatus(item.id, 'available')}
                      >
                        ✓ Mark as Available
                      </button>
                      <button
                        type="button"
                        className="status-toggle-btn btn-to-verify"
                        onClick={() => updateDocumentStatus(item.id, 'needs_verification')}
                      >
                        ? Needs Verification
                      </button>
                    </footer>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        {/* SECTION 3: INFORMATION REQUIRING VERIFICATION */}
        <section aria-labelledby="heading-verification">
          <h2 id="heading-verification" className="requirements-section-title status-verify-title">
            <span>?</span> Information Requiring Verification ({readinessResult.verificationItems.length})
          </h2>
          {readinessResult.verificationItems.length === 0 ? (
            <div className="requirement-detail-card" style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                ✓ All known requirements have been validated. No pending checks.
              </p>
            </div>
          ) : (
            <div className="readiness-items-list">
              {readinessResult.verificationItems.map((item: ReadinessItemDetail) => (
                <article key={item.id} className="requirement-detail-card card-verify">
                  <header className="requirement-card-header">
                    <div>
                      <h3 className="requirement-item-title">{item.title}</h3>
                      {item.issuingAuthority && (
                        <div className="requirement-item-authority">
                          Verifying Authority: {item.issuingAuthority}
                        </div>
                      )}
                    </div>
                    <StatusBadge status="verification_required" customLabel="Needs Verification" />
                  </header>

                  <div className="requirement-breakdown-box">
                    <div className="requirement-field">
                      <span className="requirement-field-label">Why confirmation matters:</span>
                      <p className="requirement-field-val">{item.purposeOrReason}</p>
                    </div>
                    <div className="requirement-field">
                      <span className="requirement-field-label">What JANSETU knows:</span>
                      <p className="requirement-field-val">
                        Requirement exists in principle, but details or institutional linkage need confirmation before portal submission.
                      </p>
                    </div>
                  </div>

                  <div className="requirement-action-box">
                    <span className="requirement-field-label" style={{ color: '#0369a1' }}>What to confirm:</span>
                    <p className="requirement-field-val" style={{ color: '#0369a1' }}>
                      {item.actionableHint || 'Confirm that your official documents match this scheme requirement.'}
                    </p>
                  </div>

                  <footer className="requirement-card-actions">
                    {!item.id.startsWith('verify-crit-') ? (
                      <>
                        <span className="readiness-action-label">Update status:</span>
                        <button
                          type="button"
                          className="status-toggle-btn btn-to-available"
                          onClick={() => updateDocumentStatus(item.id, 'available')}
                        >
                          ✓ Confirmed & Available
                        </button>
                        <button
                          type="button"
                          className="status-toggle-btn btn-to-missing"
                          onClick={() => updateDocumentStatus(item.id, 'missing')}
                        >
                          ○ Mark as Missing
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="readiness-action-label">Action:</span>
                        <Link to="/eligibility" className="status-toggle-btn" style={{ textDecoration: 'none' }}>
                          ← Review Eligibility Answers
                        </Link>
                      </>
                    )}
                  </footer>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* SECTION 4: READY REQUIREMENTS (COMPACT) */}
        <section aria-labelledby="heading-ready">
          <h2 id="heading-ready" className="requirements-section-title status-ready-title">
            <span>✓</span> Ready Requirements ({readinessResult.readyItems.length})
          </h2>
          {readinessResult.readyItems.length === 0 ? (
            <div className="requirement-detail-card" style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                No requirements are currently marked ready.
              </p>
            </div>
          ) : (
            <div className="requirements-ready-list">
              {readinessResult.readyItems.map((item: ReadinessItemDetail) => (
                <article key={item.id} className="requirement-ready-compact-card">
                  <div className="requirement-ready-compact-info">
                    <h3 className="requirement-ready-compact-title">
                      <span aria-hidden="true" style={{ color: 'var(--color-status-ready)', marginRight: '0.375rem' }}>✓</span>
                      {item.title}
                    </h3>
                    <p className="requirement-ready-compact-desc">
                      {item.issuingAuthority ? `• Issuing Authority: ${item.issuingAuthority}` : '• Condition satisfied from profile'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <StatusBadge status="ready" customLabel="Ready" />
                    {item.type === 'document' && (
                      <div className="ready-quick-actions" style={{ display: 'inline-flex', gap: '0.375rem' }}>
                        <button
                          type="button"
                          className="status-toggle-btn btn-to-missing"
                          onClick={() => updateDocumentStatus(item.id, 'missing')}
                          title="If you do not actually possess this document"
                        >
                          ○ Mark as Missing
                        </button>
                        <button
                          type="button"
                          className="status-toggle-btn btn-to-verify"
                          onClick={() => updateDocumentStatus(item.id, 'needs_verification')}
                          title="If this document requires verification"
                        >
                          ? Needs Check
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </PageContainer>
  );
};
