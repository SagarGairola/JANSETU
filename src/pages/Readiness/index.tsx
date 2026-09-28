import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PageContainer } from '../../components/PageContainer';
import { GuidanceBlock } from '../../components/GuidanceBlock';
import { AlertBlock } from '../../components/AlertBlock';
import { Button } from '../../components/Button';
import { FrictionBadge } from '../../components/StatusBadge';
import { useDemo } from '../../context';
import { evaluateEligibility } from '../../utils/eligibilityEvaluator';
import { evaluateReadiness } from '../../utils/readinessEvaluator';
import { findEligibleAlternatives } from '../../services/readinessEngine/alternativeEngine';
import type { ReadinessItemDetail } from '../../types';

export const ReadinessPage: React.FC = () => {
  const {
    schemes,
    currentScheme,
    setSelectedSchemeId,
    answers,
    documentStatuses,
    updateDocumentStatus,
    resetDocumentStatuses,
  } = useDemo();

  // Evaluate upstream eligibility
  const eligibilityResult = useMemo(() => {
    return evaluateEligibility(currentScheme, answers);
  }, [currentScheme, answers]);

  // Get document status overrides scoped to the current scheme
  const currentSchemeDocStatuses = useMemo(() => {
    return documentStatuses[currentScheme.id] || {};
  }, [documentStatuses, currentScheme.id]);

  // Evaluate readiness with any citizen-declared document status overrides
  const readinessResult = useMemo(() => {
    return evaluateReadiness(currentScheme, eligibilityResult, currentSchemeDocStatuses);
  }, [currentScheme, eligibilityResult, currentSchemeDocStatuses]);

  const hasOverrides = Object.keys(currentSchemeDocStatuses).length > 0;

  // Check for the "Wow Moment" scenario:
  // User matches criteria for PMEGP (or a heavy scheme) but lacks a heavy document (like EDP certificate)
  const heavyMissingDoc = useMemo(() => {
    return currentScheme.requiredDocuments.find((doc) => {
      const status = currentSchemeDocStatuses[doc.id] || doc.currentStatus;
      return status === 'missing' && (doc.isHeavyDocument || doc.id === 'doc-edp-cert');
    });
  }, [currentScheme, currentSchemeDocStatuses]);

  const immediateAlternative = useMemo(() => {
    if (!heavyMissingDoc) return null;
    const alternatives = findEligibleAlternatives(currentScheme, schemes);
    return alternatives.length > 0 ? alternatives[0] : null;
  }, [heavyMissingDoc, currentScheme, schemes]);

  // Separated counts for criteria vs physical documents
  const totalCriteria = eligibilityResult.criteria.length;
  const criteriaSatisfied = eligibilityResult.criteria.filter(
    (c) => c.status === 'appears_satisfied'
  ).length;

  const totalDocuments = currentScheme.requiredDocuments.length;
  const documentsReady = currentScheme.requiredDocuments.filter((doc) => {
    const status = currentSchemeDocStatuses[doc.id] || doc.currentStatus;
    return status === 'available';
  }).length;

  return (
    <PageContainer
      stepNumber={6}
      title="Application Readiness Engine"
      description="Moving beyond eligibility — assessing if you possess the verifiable documents, linkages, and prerequisites needed to submit right now."
      backPath="/eligibility"
      nextPath="/requirements"
      nextLabel="See What Needs Attention →"
    >
      {/* Scheme Context Bar with Bureaucracy Friction Badge */}
      <section className="readiness-scheme-bar" aria-label="Scheme context">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <h2 className="readiness-scheme-name" style={{ margin: 0 }}>{currentScheme.name}</h2>
            <FrictionBadge score={currentScheme.bureaucracyScore} label={currentScheme.frictionLabel} />
          </div>
          <p className="readiness-scheme-dept" style={{ marginTop: '0.25rem' }}>
            {currentScheme.ministryOrDepartment} • Target Portal: {currentScheme.officialPortalName}
          </p>
        </div>
        {hasOverrides && (
          <button
            type="button"
            className="reset-status-btn"
            onClick={resetDocumentStatuses}
            title="Reset all document status changes back to default scheme requirements"
          >
            ↺ Reset Document Statuses
          </button>
        )}
      </section>

      {/* THE "WOW MOMENT": Blocker to Alternative Pivot */}
      {heavyMissingDoc && immediateAlternative && (
        <section
          aria-label="Bureaucratic Blocker and Instant Alternative"
          style={{ marginBottom: '1.5rem' }}
        >
          <AlertBlock
            type="warning"
            title="⚠️ Critical Bureaucracy Barrier: Heavy Prerequisite Document Missing"
          >
            <div style={{ fontSize: '0.9375rem', lineHeight: '1.5' }}>
              <p style={{ margin: '0 0 0.5rem 0', fontWeight: 700, color: '#991b1b' }}>
                You match the criteria for {currentScheme.name}, BUT you are missing the {heavyMissingDoc.name}. This typically takes {heavyMissingDoc.estimatedTurnaroundDays ? `${heavyMissingDoc.estimatedTurnaroundDays === 14 ? '10-15' : heavyMissingDoc.estimatedTurnaroundDays} days` : '10-15 days'} to acquire.
              </p>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#78350f' }}>
                {heavyMissingDoc.notes || 'This mandatory institutional prerequisite halts your official application submission.'}
              </p>
            </div>
          </AlertBlock>

          <div
            className="alternative-pivot-card"
            style={{
              marginTop: '0.75rem',
              padding: '1.25rem',
              backgroundColor: '#ecfdf5',
              border: '2px solid #059669',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#065f46',
                  backgroundColor: '#d1fae5',
                  padding: '0.2rem 0.625rem',
                  borderRadius: '9999px',
                }}
              >
                ⚡ Immediate Low-Friction Alternative (Zero EDP Required)
              </span>
              {typeof immediateAlternative.bureaucracyScore === 'number' && (
                <FrictionBadge score={immediateAlternative.bureaucracyScore} label={immediateAlternative.frictionLabel} />
              )}
            </div>

            <h3 style={{ margin: '0.25rem 0 0.5rem 0', fontSize: '1.125rem', fontWeight: 800, color: '#064e3b' }}>
              {immediateAlternative.schemeName}
            </h3>

            <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.9375rem', fontWeight: 600, color: '#047857' }}>
              {immediateAlternative.immediateApplyMessage || `While you acquire that document, here is ${immediateAlternative.schemeName} that you can apply for TODAY with your current documents.`}
            </p>

            <p style={{ margin: '0 0 1rem 0', fontSize: '0.8125rem', color: '#065f46', lineHeight: 1.4 }}>
              <strong>Why this works today:</strong> {immediateAlternative.whyRelevant}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setSelectedSchemeId(immediateAlternative.schemeId)}
                style={{ backgroundColor: '#059669', borderColor: '#047857' }}
              >
                👉 Switch to {immediateAlternative.schemeName.includes('MUDRA') ? 'PM MUDRA Shishu' : immediateAlternative.schemeName} Now →
              </Button>
              <span style={{ fontSize: '0.8125rem', color: '#047857', fontWeight: 600 }}>
                ✓ Zero EDP Certificate Required • Apply Today with Aadhaar + Bank Statement
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Categorical Readiness Assessment Banner */}
      <section
        className={`readiness-assessment-banner state-${readinessResult.category}`}
        aria-label="Overall readiness assessment"
      >
        <div className="readiness-banner-header">
          <div>
            <span
              className={`readiness-category-badge badge-${readinessResult.category}`}
              role="status"
            >
              {readinessResult.categoryBadgeLabel}
            </span>
            <h2 className="readiness-category-title" style={{ marginTop: '0.5rem' }}>
              {readinessResult.headline}
            </h2>
          </div>
        </div>

        <p style={{ margin: 0, fontSize: '0.9375rem', lineHeight: '1.5', color: 'var(--color-text-main)' }}>
          {readinessResult.summaryDiagnostic}
        </p>

        {/* Readiness Breakdown Chips: Distinct Criteria & Documents */}
        <div className="readiness-counts-strip">
          <span className="readiness-count-chip count-ready" title="Upstream statutory criteria satisfied">
            ✓ Criteria: {criteriaSatisfied}/{totalCriteria} Satisfied
          </span>
          <span className="readiness-count-chip count-ready" title="Required application documents marked available">
            📄 Documents: {documentsReady}/{totalDocuments} Ready
          </span>
          {readinessResult.missingItems.length > 0 && (
            <span className="readiness-count-chip count-missing">
              ○ {readinessResult.missingItems.length} Missing
            </span>
          )}
          {readinessResult.verificationItems.length > 0 && (
            <span className="readiness-count-chip count-verify">
              ? {readinessResult.verificationItems.length} Need Check
            </span>
          )}
          {readinessResult.blockers.length > 0 && (
            <span className="readiness-count-chip count-blocker">
              ! {readinessResult.blockers.length} Disqualifying Blocker
            </span>
          )}
        </div>
      </section>

      {/* Diagnostic Guidance Block */}
      <GuidanceBlock headline="Why Can't I Apply Yet?" disclaimer="Readiness Engine Diagnostic">
        <p style={{ margin: 0, lineHeight: '1.5' }}>
          <strong>Eligibility ≠ Application Readiness.</strong> Meeting eligibility rules means you qualify in principle. However, official portals reject submissions that lack certified documentation, unexpired proofs, or active Aadhaar DBT bank linkages. JANSETU identifies exactly what is holding up your submission before you invest hours in the official application portal.
        </p>
      </GuidanceBlock>

      {/* SECTION 1: Blockers (if any) */}
      {readinessResult.blockers.length > 0 && (
        <section aria-labelledby="blockers-heading" style={{ marginBottom: '1.5rem' }}>
          <h2 id="blockers-heading" className="readiness-section-title" style={{ color: '#991b1b' }}>
            <span>!</span> Application Blockers ({readinessResult.blockers.length})
          </h2>
          <div className="readiness-items-list">
            {readinessResult.blockers.map((item: ReadinessItemDetail) => (
              <article key={item.id} className="readiness-item-card item-blocker">
                <div className="readiness-item-header">
                  <div>
                    <h3 className="readiness-item-title">{item.title}</h3>
                  </div>
                  <span className="status-badge badge-missing">Disqualifier</span>
                </div>
                <p className="readiness-item-purpose">{item.purposeOrReason}</p>
                {item.actionableHint && (
                  <div className="readiness-item-hint" style={{ color: '#991b1b' }}>
                    {item.actionableHint}
                  </div>
                )}
                <div className="readiness-item-actions">
                  <span className="readiness-action-label">Action:</span>
                  <Link to="/eligibility" className="status-toggle-btn" style={{ textDecoration: 'none' }}>
                    ← Edit Eligibility Responses
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 2: Missing Requirements */}
      <section aria-labelledby="missing-heading" style={{ marginBottom: '1.5rem' }}>
        <h2 id="missing-heading" className="readiness-section-title" style={{ color: '#ea580c' }}>
          <span>○</span> Missing Requirements ({readinessResult.missingItems.length})
        </h2>
        {readinessResult.missingItems.length === 0 ? (
          <div className="readiness-item-card" style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
              No missing mandatory documents detected.
            </p>
          </div>
        ) : (
          <div className="readiness-items-list">
            {readinessResult.missingItems.map((item: ReadinessItemDetail) => (
              <article key={item.id} className="readiness-item-card item-missing">
                <div className="readiness-item-header">
                  <div>
                    <h3 className="readiness-item-title">{item.title}</h3>
                    {item.issuingAuthority && (
                      <div className="readiness-item-authority">
                        Issuing Authority: {item.issuingAuthority}
                      </div>
                    )}
                  </div>
                  <span className="status-badge badge-missing">Missing</span>
                </div>
                <p className="readiness-item-purpose">{item.purposeOrReason}</p>
                {item.actionableHint && (
                  <div className="readiness-item-hint">
                    <strong>Note:</strong> {item.actionableHint}
                  </div>
                )}
                {item.type === 'document' && (
                  <div className="readiness-item-actions">
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
                      ? Needs Check / Verification
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      {/* SECTION 3: Information Requiring Verification */}
      <section aria-labelledby="verification-heading" style={{ marginBottom: '1.5rem' }}>
        <h2 id="verification-heading" className="readiness-section-title" style={{ color: '#0284c7' }}>
          <span>?</span> Information Requiring Verification ({readinessResult.verificationItems.length})
        </h2>
        {readinessResult.verificationItems.length === 0 ? (
          <div className="readiness-item-card" style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
              All requirements have been validated. No pending checks.
            </p>
          </div>
        ) : (
          <div className="readiness-items-list">
            {readinessResult.verificationItems.map((item: ReadinessItemDetail) => (
              <article key={item.id} className="readiness-item-card item-verify">
                <div className="readiness-item-header">
                  <div>
                    <h3 className="readiness-item-title">{item.title}</h3>
                    {item.issuingAuthority && (
                      <div className="readiness-item-authority">
                        Verifying Authority: {item.issuingAuthority}
                      </div>
                    )}
                  </div>
                  <span className="status-badge badge-verify">Needs Verification</span>
                </div>
                <p className="readiness-item-purpose">{item.purposeOrReason}</p>
                {item.actionableHint && (
                  <div className="readiness-item-hint">
                    <strong>Verification requirement:</strong> {item.actionableHint}
                  </div>
                )}
                {item.type === 'verification' && (
                  <div className="readiness-item-actions">
                    <span className="readiness-action-label">Update status:</span>
                    <button
                      type="button"
                      className="status-toggle-btn btn-to-available"
                      onClick={() => updateDocumentStatus(item.id, 'available')}
                    >
                      ✓ Confirmed & Verified
                    </button>
                    <button
                      type="button"
                      className="status-toggle-btn btn-to-missing"
                      onClick={() => updateDocumentStatus(item.id, 'missing')}
                    >
                      ○ Mark as Missing
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      {/* SECTION 4: Ready Requirements */}
      <section aria-labelledby="ready-heading" style={{ marginBottom: '1.5rem' }}>
        <h2 id="ready-heading" className="readiness-section-title" style={{ color: '#166534' }}>
          <span>✓</span> Ready Requirements ({readinessResult.readyItems.length})
        </h2>
        {readinessResult.readyItems.length === 0 ? (
          <div className="readiness-item-card" style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
              No requirements are currently marked ready.
            </p>
          </div>
        ) : (
          <div className="readiness-items-list">
            {readinessResult.readyItems.map((item: ReadinessItemDetail) => (
              <article key={item.id} className="readiness-item-card item-ready">
                <div className="readiness-item-header">
                  <div>
                    <h3 className="readiness-item-title">{item.title}</h3>
                    {item.issuingAuthority && (
                      <div className="readiness-item-authority">
                        Issuing Authority: {item.issuingAuthority}
                      </div>
                    )}
                  </div>
                  <span className="status-badge badge-ready">Ready</span>
                </div>
                <p className="readiness-item-purpose">{item.purposeOrReason}</p>
                {item.type === 'document' && (
                  <div className="readiness-item-actions">
                    <span className="readiness-action-label">Change status:</span>
                    <button
                      type="button"
                      className="status-toggle-btn btn-to-missing"
                      onClick={() => updateDocumentStatus(item.id, 'missing')}
                    >
                      ○ Mark as Missing
                    </button>
                    <button
                      type="button"
                      className="status-toggle-btn btn-to-verify"
                      onClick={() => updateDocumentStatus(item.id, 'needs_verification')}
                    >
                      ? Needs Check
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </PageContainer>
  );
};
