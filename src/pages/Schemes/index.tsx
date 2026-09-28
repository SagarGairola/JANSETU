import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../../components/PageContainer';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { useDemo } from '../../context';
import { evaluateSchemeRelevance } from '../../services/relevanceEngine';

export const SchemesPage: React.FC = () => {
  const { schemes, selectedSchemeId, setSelectedSchemeId, userNeed, needProfile } = useDemo();
  const navigate = useNavigate();

  // Multi-signal relevance evaluation
  const relevance = useMemo(() => {
    if (!userNeed || !userNeed.trim()) {
      return {
        hasMatches: true,
        results: schemes.map((scheme) => ({
          scheme,
          tier: 'RELEVANT_ALTERNATIVE' as const,
          relevanceLabel: 'Relevant to explore' as const,
          relevanceScore: 50,
          whyItFits: scheme.whyRelevantDefault || 'General citizen assistance scheme.',
          worthChecking: scheme.worthCheckingPoints || [
            'Basic eligibility criteria',
            'Required identity documents',
          ],
          signals: {
            domainMatch: true,
            goalMatch: false,
            beneficiaryMatch: false,
            contextMatch: false,
          },
        })),
        directMatches: [],
        alternativeMatches: [],
        needProfile,
      };
    }
    return evaluateSchemeRelevance(needProfile, schemes);
  }, [userNeed, needProfile, schemes]);

  const { results, hasMatches } = relevance;

  // Other catalog schemes (for catalog exploration when a primary match is found)
  const otherSchemes = useMemo(() => {
    if (!hasMatches || !userNeed.trim()) return [];
    return schemes.filter((s) => !results.some((r) => r.scheme.id === s.id));
  }, [hasMatches, results, schemes, userNeed]);

  // Ensure selectedSchemeId exists only when matches exist
  React.useEffect(() => {
    if (results.length > 0) {
      if (!selectedSchemeId || !schemes.some((s) => s.id === selectedSchemeId)) {
        setSelectedSchemeId(results[0].scheme.id);
      }
    } else if (!hasMatches && userNeed.trim()) {
      if (selectedSchemeId) {
        setSelectedSchemeId('');
      }
    }
  }, [selectedSchemeId, results, hasMatches, userNeed, setSelectedSchemeId, schemes]);

  const handleSelectAndExplore = (schemeId: string) => {
    setSelectedSchemeId(schemeId);
    navigate('/scheme-details');
  };

  const displayedNeed = userNeed && userNeed.trim()
    ? `"${userNeed.trim()}"`
    : "Let's find support based on your needs.";

  return (
    <PageContainer
      stepNumber={3}
      title="Support that may fit your need"
      description="Based on what you told us, these schemes are worth checking first. Explore one to review detailed requirements and check your application readiness."
      backPath="/need"
      nextPath="/scheme-details"
      nextLabel={!hasMatches ? 'Clarify requirement to explore schemes' : 'Explore Selected Scheme Details →'}
      primaryActionDisabled={!hasMatches}
    >
      {/* Contextual User Need Area */}
      <section className="need-context-banner" aria-label="Your stated requirement">
        <span className="need-context-label">You told JANSETU</span>
        <p className="need-context-text">{displayedNeed}</p>
      </section>

      {/* Civic-Tech Clarity Banner: Discovery & Friction Scoring */}
      <div className="discovery-clarity-banner" role="status" style={{ borderLeft: '4px solid #10b981' }}>
        <span className="discovery-clarity-icon" aria-hidden="true">⚡</span>
        <div className="discovery-clarity-text">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <strong>Deterministic Pipeline Resolved:</strong>
            <span style={{ fontSize: '0.75rem', backgroundColor: '#dcfce7', color: '#15803d', padding: '0.125rem 0.5rem', borderRadius: '9999px', fontWeight: 700 }}>
              ✓ Need Extracted
            </span>
            <span style={{ fontSize: '0.75rem', backgroundColor: '#dcfce7', color: '#15803d', padding: '0.125rem 0.5rem', borderRadius: '9999px', fontWeight: 700 }}>
              ✓ Criteria Evaluated
            </span>
            <span style={{ fontSize: '0.75rem', backgroundColor: '#dcfce7', color: '#15803d', padding: '0.125rem 0.5rem', borderRadius: '9999px', fontWeight: 700 }}>
              ✓ Bureaucracy Friction Scored
            </span>
          </div>
          <div style={{ marginTop: '0.375rem', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
            Schemes are ranked by need fit and scored with a <strong>Bureaucracy Friction Index (1-10)</strong> reflecting document acquisition complexity.
          </div>
        </div>
      </div>

      {/* No Forced Results State */}
      {!hasMatches ? (
        <Card title="No closely matching support found yet" titleAs="h2">
          <div
            className="alert-block alert-warning"
            role="note"
            aria-label="Discovery matching note"
            style={{ marginBottom: '1.25rem' }}
          >
            <span aria-hidden="true" style={{ fontWeight: 'bold' }}>ℹ</span>
            <div>
              <strong>Clarification needed:</strong>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
                JANSETU could not identify a sufficiently relevant support option from the information available in the current local catalogue.
              </p>
            </div>
          </div>
          <p style={{ fontSize: '0.9375rem', lineHeight: '1.6', color: 'var(--color-text-main)', marginBottom: '1.5rem' }}>
            We need a little more information before we can look for a useful match. Government welfare schemes are structured for specific purposes (such as college education scholarships, farmer income support, or new business credit).
          </p>
          <div>
            <Button
              variant="primary"
              onClick={() => navigate('/need')}
              aria-label="Refine your requirement"
            >
              ← Refine your requirement
            </Button>
          </div>
        </Card>
      ) : (
        /* Curated Scheme Results List */
        <section aria-label="Curated scheme options">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {results.map(({ scheme, relevanceLabel, whyItFits, worthChecking }) => {
              const isSelected = scheme.id === selectedSchemeId;
              const badgeClass =
                relevanceLabel === 'Strong match'
                  ? 'badge-strong'
                  : 'badge-explore';

              return (
                <Card
                  key={scheme.id}
                  title={scheme.name}
                  titleAs="h2"
                  subtitle={scheme.ministryOrDepartment}
                  frictionScore={scheme.bureaucracyScore}
                  frictionLabel={scheme.frictionLabel}
                  badge={
                    <span
                      className={`status-badge ${badgeClass}`}
                      role="note"
                      aria-label={`Match assessment: ${relevanceLabel}`}
                    >
                      <span aria-hidden="true">✦</span>
                      <span>{relevanceLabel}</span>
                    </span>
                  }
                  isSelected={isSelected}
                  onClick={() => setSelectedSchemeId(scheme.id)}
                >
                  {/* Short Purpose & What it Provides */}
                  <div style={{ marginBottom: '0.625rem', fontSize: '0.9375rem', lineHeight: '1.5' }}>
                    <strong>Overview:</strong> {scheme.shortPurpose}
                  </div>
                  <div style={{ marginBottom: '0.75rem', fontSize: '0.9375rem', lineHeight: '1.5' }}>
                    <strong>What this provides:</strong> {scheme.benefitSummary}
                  </div>

                  {/* Why it may fit */}
                  <div style={{ backgroundColor: 'var(--color-bg-subtle)', padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-md)', margin: '0.75rem 0' }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-brand-primary)' }}>
                      Why this may fit:
                    </span>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: 'var(--color-text-main)' }}>
                      {whyItFits}
                    </p>
                  </div>

                  {/* Worth Checking */}
                  <div>
                    <span className="scheme-section-label">Worth checking:</span>
                    <ul className="scheme-points-list">
                      {worthChecking.map((point, idx) => (
                        <li key={idx}>{point}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Card Actions */}
                  <footer className="scheme-card-actions">
                    <div>
                      {isSelected ? (
                        <span className="selected-indicator">
                          <span aria-hidden="true">✓</span> Currently selected for exploration
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                          Click card to select
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <Button
                        variant={isSelected ? 'secondary' : 'outline'}
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSchemeId(scheme.id);
                        }}
                        aria-label={`${isSelected ? 'Selected' : 'Select'} ${scheme.name}`}
                      >
                        {isSelected ? '✓ Selected' : 'Select Scheme'}
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectAndExplore(scheme.id);
                        }}
                        aria-label={`Explore ${scheme.name} details`}
                      >
                        Explore Scheme Details →
                      </Button>
                    </div>
                  </footer>
                </Card>
              );
            })}

            {/* Other catalogue schemes for exploration when a match is found */}
            {otherSchemes.map((scheme) => {
              const isSelected = scheme.id === selectedSchemeId;
              return (
                <Card
                  key={scheme.id}
                  title={scheme.name}
                  titleAs="h2"
                  subtitle={scheme.ministryOrDepartment}
                  frictionScore={scheme.bureaucracyScore}
                  frictionLabel={scheme.frictionLabel}
                  badge={
                    <span
                      className="status-badge badge-explore"
                      role="note"
                      aria-label="Alternative catalogue option"
                    >
                      <span aria-hidden="true">✦</span>
                      <span>Alternative catalogue option</span>
                    </span>
                  }
                  isSelected={isSelected}
                  onClick={() => setSelectedSchemeId(scheme.id)}
                >
                  <div style={{ marginBottom: '0.625rem', fontSize: '0.9375rem', lineHeight: '1.5' }}>
                    <strong>Overview:</strong> {scheme.shortPurpose}
                  </div>
                  <div style={{ marginBottom: '0.75rem', fontSize: '0.9375rem', lineHeight: '1.5' }}>
                    <strong>What this provides:</strong> {scheme.benefitSummary}
                  </div>
                  <div style={{ backgroundColor: 'var(--color-bg-subtle)', padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-md)', margin: '0.75rem 0' }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>
                      Alternative catalogue option:
                    </span>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                      {scheme.whyRelevantDefault || 'Alternative welfare scheme in our directory.'}
                    </p>
                  </div>
                  <footer className="scheme-card-actions">
                    <div>
                      {isSelected ? (
                        <span className="selected-indicator">
                          <span aria-hidden="true">✓</span> Currently selected for exploration
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                          Click card to select
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <Button
                        variant={isSelected ? 'secondary' : 'outline'}
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSchemeId(scheme.id);
                        }}
                        aria-label={`${isSelected ? 'Selected' : 'Select'} ${scheme.name}`}
                      >
                        {isSelected ? '✓ Selected' : 'Select Scheme'}
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectAndExplore(scheme.id);
                        }}
                        aria-label={`Explore ${scheme.name} details`}
                      >
                        Explore Scheme Details →
                      </Button>
                    </div>
                  </footer>
                </Card>
              );
            })}
          </div>
        </section>
      )}
    </PageContainer>
  );
};
