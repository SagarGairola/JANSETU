import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PageContainer } from '../../components/PageContainer';
import { GuidanceBlock } from '../../components/GuidanceBlock';
import { useDemo } from '../../context';
import { evaluateEligibility } from '../../utils/eligibilityEvaluator';
import { evaluateReadiness } from '../../utils/readinessEvaluator';

interface BlockerInfo {
  conditionCode: string;
  portalQuote: string;
  meaning: string;
  meaningSubtext: string;
  userProvidedText: string;
  publishedRuleText: string;
  conditionLabel: string;
  whyItMatters: string;
  option1Title: string;
  option1Desc: string;
  option2Title: string;
  option2Desc: string;
  option3Title: string;
  option3Desc: string;
  resetText: string;
}

function resolveBlockerInfo(
  scheme: any,
  blockerId: string,
  blockerTitle: string,
  blockerReason: string
): BlockerInfo {
  const cleanId = blockerId.replace(/^blocker-/, '');

  if (cleanId === 'crit-income') {
    return {
      conditionCode: 'INCOME_EXCEEDS_CEILING',
      portalQuote:
        '"Application Submission Blocked [Illustrative Portal Message — Simulation]: The applicant profile does not satisfy published eligibility parameters for the active cycle. Condition code: INCOME_EXCEEDS_CEILING. Transaction suspended."',
      meaning: `Based on the information provided in this demo, your declared annual household income (marked as Above ₹2,50,000 / year) is higher than the published income ceiling for ${scheme.name}.`,
      meaningSubtext:
        'The government portal automated checker halts the application because the published rules restrict this scheme to households below ₹2,50,000 annually.',
      userProvidedText: 'Annual household income: Above ₹2,50,000 / year',
      publishedRuleText: 'Family income limit: Under ₹2,50,000 / year',
      conditionLabel: 'Annual Family Income Limit',
      whyItMatters: `The income condition is a mandatory eligibility criterion for this scheme. If the declared income is accurate, submitting this application on ${scheme.officialPortalName} will result in immediate rejection or refusal of disbursals by the administering ministry.`,
      option1Title: '1. If information was entered by mistake',
      option1Desc:
        'If your actual household income is under ₹2,50,000 and you selected the wrong option during the check, return and correct your answer.',
      option2Title: '2. If reported income is accurate',
      option2Desc:
        'If your income genuinely exceeds the limit, this scholarship does not apply. Explore other educational or loan-subsidy schemes that have higher or no income caps.',
      option3Title: '3. If unsure of official records',
      option3Desc:
        'Review the official scheme requirements checklist to understand which document is required to prove household income.',
      resetText: 'Demo helper: Reset income back to eligible threshold to test clean flow.',
    };
  }

  if (cleanId === 'crit-land') {
    return {
      conditionCode: 'LAND_RECORD_UNVERIFIED',
      portalQuote:
        '"Application Submission Blocked [Illustrative Portal Message — Simulation]: Landholding record verification failed in state revenue database. Condition code: LAND_RECORD_UNVERIFIED. Direct benefit transfer halted."',
      meaning: `Based on the information provided in this demo, you indicated that you do not hold cultivable agricultural land in family revenue records. PM-KISAN Samman Nidhi is statutory income support exclusively reserved for registered landholding farmer families.`,
      meaningSubtext:
        'The PM-KISAN portal cross-checks applicant details against state Bhulekh/RoR registries. Non-landholding applicants are automatically stopped from enrolling.',
      userProvidedText: 'Cultivable landholding: No',
      publishedRuleText: 'Must possess cultivable landholding in family revenue records',
      conditionLabel: 'Cultivable Landholding',
      whyItMatters: `Land ownership registered in official land revenue records is the fundamental eligibility prerequisite for PM-KISAN. Without verified land titles, submitting on ${scheme.officialPortalName} will lead to immediate rejection by state nodal verification officers.`,
      option1Title: '1. If information was entered by mistake',
      option1Desc:
        'If your family actually owns cultivable land registered in revenue records and you selected "No" by mistake, return and correct your answer.',
      option2Title: '2. If you do not own agricultural land',
      option2Desc:
        'If you do not own farmland, explore tenant farmer or non-agricultural welfare schemes such as rural livelihood missions or enterprise loans.',
      option3Title: '3. If unsure of revenue records',
      option3Desc:
        'Review the official scheme requirements checklist to check how land ownership documents (Khatauni / RoR) are verified.',
      resetText: 'Demo helper: Reset landholding back to eligible state to test clean flow.',
    };
  }

  if (cleanId === 'crit-age-biz') {
    return {
      conditionCode: 'APPLICANT_UNDERAGE',
      portalQuote:
        '"Application Submission Blocked [Illustrative Portal Message — Simulation]: Applicant does not satisfy minimum age requirement (18+). Condition code: APPLICANT_UNDERAGE. Loan subsidy application rejected."',
      meaning: `Based on the information provided in this demo, you indicated that the applicant is under 18 years of age. PMEGP credit-linked subsidies require applicants to be at least 18 years old at the time of application.`,
      meaningSubtext:
        'Under statutory lending regulations, banks and KVIC cannot execute credit agreements or disburse government margin money subsidies to minors.',
      userProvidedText: 'Applicant age (18+): No',
      publishedRuleText: 'Minimum age 18 years at application time (no upper age limit)',
      conditionLabel: 'Minimum Age (18+ Years)',
      whyItMatters: `Legal adult status is a strict statutory requirement for bank loans and government credit guarantees. Applications with age below 18 will be rejected during Aadhaar verification on ${scheme.officialPortalName}.`,
      option1Title: '1. If information was entered by mistake',
      option1Desc:
        'If you are 18 or older and clicked the wrong option during the check, return and update your response.',
      option2Title: '2. If applicant is under 18 years',
      option2Desc:
        "If you are under 18, consider applying under an adult family member's name or explore youth skill development programs until eligible.",
      option3Title: '3. If verifying age documentation',
      option3Desc:
        'Review the requirements checklist to ensure your Aadhaar or birth certificate accurately reflects your legal date of birth.',
      resetText: 'Demo helper: Reset age requirement back to 18+ to test clean flow.',
    };
  }

  if (cleanId === 'crit-unit-biz') {
    return {
      conditionCode: 'EXISTING_UNIT_INELIGIBLE',
      portalQuote:
        '"Application Submission Blocked [Illustrative Portal Message — Simulation]: Project proposal indicates existing business unit. Condition code: EXISTING_UNIT_INELIGIBLE. Application rejected."',
      meaning: `Based on the information provided in this demo, you indicated that assistance is requested for an existing business unit. PMEGP subsidies are strictly reserved for setting up new greenfield micro-ventures.`,
      meaningSubtext:
        'Existing units already assisted under government schemes or seeking expansion/refinancing are ineligible under PMEGP guidelines.',
      userProvidedText: 'New greenfield venture: No',
      publishedRuleText: 'Assistance available exclusively for setting up new projects/enterprises',
      conditionLabel: 'New Unit Establishment',
      whyItMatters: `PMEGP is designed exclusively for new employment generation projects. Submitting an application for an existing unit will result in disqualification during District Task Force Committee (DTFC) review.`,
      option1Title: '1. If information was entered by mistake',
      option1Desc:
        'If you are setting up a completely new venture and selected existing unit by mistake, return and correct your answer.',
      option2Title: '2. If expanding an existing business',
      option2Desc:
        'Explore second-loan PMEGP upgradation schemes or MUDRA refinance schemes specifically designed for existing enterprise growth.',
      option3Title: '3. If preparing project proposal',
      option3Desc:
        'Review the DPR (Detailed Project Report) requirements checklist to clarify project scope.',
      resetText: 'Demo helper: Reset new unit question back to yes to test clean flow.',
    };
  }

  // Fallback for any other criterion
  const cleanTitle = blockerTitle.replace('Eligibility Blocker: ', '');
  return {
    conditionCode: 'CRITERION_NOT_SATISFIED',
    portalQuote:
      '"Application Submission Blocked [Illustrative Portal Message — Simulation]: The applicant profile does not satisfy published eligibility parameters for the active cycle. Condition code: PARAMETER_MISMATCH. Transaction suspended."',
    meaning: `Based on the information provided, the condition "${cleanTitle}" does not appear satisfied under published rules for ${scheme.name}. ${blockerReason}`,
    meaningSubtext:
      'The automated portal validation halts application submission when published criteria are not met.',
    userProvidedText: 'Response indicates condition is not met',
    publishedRuleText: `Published rule requirement: ${cleanTitle}`,
    conditionLabel: cleanTitle,
    whyItMatters: `This condition is a mandatory eligibility criterion for ${scheme.name}. Submitting without meeting this condition will lead to immediate rejection on ${scheme.officialPortalName}.`,
    option1Title: '1. If information was entered by mistake',
    option1Desc:
      'If your actual details qualify under published limits and you made an error during the check, return and update your response.',
    option2Title: '2. If information is accurate',
    option2Desc:
      'Explore alternative welfare or support schemes that do not require this specific condition.',
    option3Title: '3. If unsure of official documentation',
    option3Desc: 'Review the official scheme requirements checklist to understand mandatory documents.',
    resetText: 'Demo helper: Reset eligibility answers to test clean flow.',
  };
}

export const BlockerPage: React.FC = () => {
  const { currentScheme, answers, updateAnswer, documentStatuses } = useDemo();

  // 1. Evaluate upstream eligibility
  const eligibilityResult = useMemo(() => {
    return currentScheme ? evaluateEligibility(currentScheme, answers) : null;
  }, [currentScheme, answers]);

  // 2. Scoped document overrides
  const currentSchemeDocStatuses = useMemo(() => {
    return currentScheme ? (documentStatuses[currentScheme.id] || {}) : {};
  }, [documentStatuses, currentScheme]);

  // 3. Application readiness evaluation
  const readinessResult = useMemo(() => {
    if (!currentScheme || !eligibilityResult) return null;
    return evaluateReadiness(currentScheme, eligibilityResult, currentSchemeDocStatuses);
  }, [currentScheme, eligibilityResult, currentSchemeDocStatuses]);

  // Check if there is an active blocker from evaluation
  const hasActiveBlocker = readinessResult && readinessResult.blockers.length > 0;
  const activeBlocker = hasActiveBlocker ? readinessResult.blockers[0] : null;

  // Resolve blocker details dynamically based on active criterion
  const blockerInfo = useMemo(() => {
    if (!currentScheme || !activeBlocker) return null;
    return resolveBlockerInfo(
      currentScheme,
      activeBlocker.id,
      activeBlocker.title,
      activeBlocker.purposeOrReason
    );
  }, [currentScheme, activeBlocker]);

  // Controlled demo trigger: scheme-aware blocker simulation
  const handleSimulateBlocker = () => {
    if (currentScheme?.id === 'pm-kisan') {
      updateAnswer('hasLandholding', 'no');
    } else if (currentScheme?.id === 'pmegp-micro-enterprise') {
      updateAnswer('isAge18Plus', 'no');
    } else {
      updateAnswer('annualIncome', 'over_250k');
    }
  };

  // Clear simulated blocker
  const handleClearBlocker = () => {
    if (currentScheme?.id === 'pm-kisan') {
      updateAnswer('hasLandholding', 'yes');
    } else if (currentScheme?.id === 'pmegp-micro-enterprise') {
      updateAnswer('isAge18Plus', 'yes');
    } else {
      updateAnswer('annualIncome', 'under_250k');
    }
  };

  // Guard against missing scheme
  if (!currentScheme || !readinessResult) {
    return (
      <PageContainer
        stepNumber={10}
        title="Portal Blocker & Rejection Explainer"
        description="Translate opaque government rejection messages into clear, actionable next steps."
        backPath="/official-application"
        nextPath="/"
        nextLabel="Return to Welcome →"
      >
        <div className="requirements-summary-strip">
          <div>
            <h2 className="requirement-item-title">No Scheme Selected</h2>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
              Please select a government scheme to evaluate blocker scenarios.
            </p>
          </div>
          <Link to="/schemes" className="btn btn-primary" style={{ textDecoration: 'none' }}>
            Browse Schemes
          </Link>
        </div>
      </PageContainer>
    );
  }

  const simulateBtnText =
    currentScheme.id === 'pm-kisan'
      ? 'Simulate Landholding Blocker Scenario →'
      : currentScheme.id === 'pmegp-micro-enterprise'
      ? 'Simulate Age Limit Blocker Scenario →'
      : 'Simulate Income Blocker Scenario →';

  const simulateDescText =
    currentScheme.id === 'pm-kisan'
      ? 'Experience how JANSETU assists citizens when portal validation fails for agricultural land records.'
      : currentScheme.id === 'pmegp-micro-enterprise'
      ? 'Experience how JANSETU assists entrepreneurs when portal validation halts due to age requirements.'
      : 'Experience how JANSETU assists citizens who receive confusing rejection messages when applying on government portals (e.g. income threshold exceeded).';

  return (
    <PageContainer
      stepNumber={10}
      title="Portal Blocker & Rejection Explainer"
      description="Resolve opaque, confusing errors received while trying to apply on government portals."
      backPath="/official-application"
      nextPath="/"
      nextLabel="Complete Tour / Return to Home ↺"
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

      {!hasActiveBlocker ? (
        /* NO-BLOCKER STATE */
        <div className="blocker-clean-state">
          <section aria-labelledby="no-blocker-title" className="blocker-no-blocker-card">
            <span
              className="status-badge badge-ready"
              style={{ fontSize: '0.875rem', padding: '0.375rem 0.875rem' }}
            >
              ✓ No Active Blocker Detected
            </span>
            <h2 id="no-blocker-title" style={{ fontSize: '1.25rem', margin: '0.75rem 0 0.5rem 0' }}>
              Your application appears free of disqualifying blockers
            </h2>
            <p style={{ margin: 0, fontSize: '0.9375rem', color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
              Based on the information currently provided for <strong>{currentScheme.name}</strong>, JANSETU has not detected any condition that immediately disqualifies you under the published guidelines.
            </p>

            <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link to="/readiness" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                View Readiness Summary →
              </Link>
              <Link to="/next-action" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
                View Next Action →
              </Link>
            </div>
          </section>

          {/* Controlled Demo Shortcut Box */}
          <section aria-labelledby="demo-shortcut-title" className="blocker-demo-shortcut-card">
            <div className="blocker-demo-tag">⚡ Judge / Hackathon Demo Shortcut</div>
            <h2 id="demo-shortcut-title" style={{ fontSize: '1.0625rem', margin: '0.5rem 0 0.25rem 0' }}>
              Simulate an Opaque Portal Rejection Message
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: '0 0 1rem 0', lineHeight: '1.45' }}>
              {simulateDescText}
            </p>
            <button
              type="button"
              className="btn btn-primary blocker-simulate-btn"
              onClick={handleSimulateBlocker}
            >
              {simulateBtnText}
            </button>
          </section>
        </div>
      ) : (
        /* ACTIVE BLOCKER EXPLANATION EXPERIENCE */
        <div className="blocker-active-flow">
          {/* 1. Demo Portal Message Box */}
          <section aria-labelledby="portal-msg-heading" className="blocker-portal-message-card">
            <header className="blocker-portal-header">
              <span className="blocker-portal-badge">
                Example Portal Rejection / Error Message (Simulation)
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                Source: {currentScheme.officialPortalName}
              </span>
            </header>
            <h2 id="portal-msg-heading" className="sr-only">
              Simulated Portal Message
            </h2>
            <div className="blocker-portal-quote">
              <span aria-hidden="true" className="blocker-quote-icon">⚠️</span>
              <blockquote>{blockerInfo?.portalQuote}</blockquote>
            </div>
            <p className="blocker-portal-note">
              This simulated message illustrates the opaque, technical language citizens typically receive upon portal submission rejection.
            </p>
          </section>

          {/* 2. Plain-Language Explanation */}
          <section aria-labelledby="meaning-heading" className="blocker-explanation-section">
            <h2 id="meaning-heading" className="blocker-heading">
              <span>💡</span> What this message actually means
            </h2>
            <div className="blocker-card">
              <p style={{ margin: 0, fontSize: '0.9375rem', lineHeight: '1.5', color: 'var(--color-text-main)' }}>
                {blockerInfo?.meaning}
              </p>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: '1.45' }}>
                {blockerInfo?.meaningSubtext}
              </p>
            </div>
          </section>

          {/* 3. Evidence / Information Used */}
          <section aria-labelledby="evidence-heading" className="blocker-explanation-section">
            <h2 id="evidence-heading" className="blocker-heading">
              <span>📋</span> Information JANSETU used for this interpretation
            </h2>
            <div className="blocker-evidence-grid">
              <div className="blocker-evidence-item">
                <span className="blocker-evidence-label">Information Provided By You</span>
                <p className="blocker-evidence-value">
                  <strong>{blockerInfo?.userProvidedText}</strong>
                </p>
              </div>
              <div className="blocker-evidence-item">
                <span className="blocker-evidence-label">Published Scheme Rule</span>
                <p className="blocker-evidence-value">
                  <strong>{blockerInfo?.publishedRuleText}</strong>
                </p>
              </div>
              <div className="blocker-evidence-item">
                <span className="blocker-evidence-label">Active Scheme</span>
                <p className="blocker-evidence-value">
                  {currentScheme.name} ({currentScheme.ministryOrDepartment})
                </p>
              </div>
              <div className="blocker-evidence-item">
                <span className="blocker-evidence-label">Relevant Condition</span>
                <p className="blocker-evidence-value">
                  {blockerInfo?.conditionLabel}
                </p>
              </div>
            </div>
            <p className="blocker-evidence-disclaimer">
              <em>Note:</em> JANSETU derived this interpretation strictly from your declared answers in this demo. JANSETU has not accessed any official tax or government database.
            </p>
          </section>

          {/* 4. Why This Matters */}
          <section aria-labelledby="why-heading" className="blocker-explanation-section">
            <h2 id="why-heading" className="blocker-heading">
              <span>⚖️</span> Why this matters
            </h2>
            <div className="blocker-card" style={{ borderLeft: '4px solid #ea580c' }}>
              <p style={{ margin: 0, fontSize: '0.9375rem', lineHeight: '1.5', color: 'var(--color-text-main)' }}>
                {blockerInfo?.whyItMatters}
              </p>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                JANSETU has not officially rejected you — only the authorized government authority can make legal determinations. However, understanding this rule prevents wasted effort and portal registration delays.
              </p>
            </div>
          </section>

          {/* 5. What The Citizen Can Do */}
          <section aria-labelledby="actions-heading" className="blocker-explanation-section">
            <h2 id="actions-heading" className="blocker-heading">
              <span>🎯</span> What you can do next
            </h2>

            <div className="blocker-options-grid">
              {/* Option A: If entered incorrectly */}
              <article className="blocker-option-card">
                <h3 className="blocker-option-title">
                  {blockerInfo?.option1Title}
                </h3>
                <p className="blocker-option-desc">
                  {blockerInfo?.option1Desc}
                </p>
                <div style={{ marginTop: 'auto', paddingTop: '0.75rem' }}>
                  <Link to="/eligibility" className="btn btn-primary btn-sm" style={{ width: '100%', textAlign: 'center', textDecoration: 'none' }}>
                    ← Edit Eligibility Responses
                  </Link>
                </div>
              </article>

              {/* Option B: If accurate, explore other schemes */}
              <article className="blocker-option-card">
                <h3 className="blocker-option-title">
                  {blockerInfo?.option2Title}
                </h3>
                <p className="blocker-option-desc">
                  {blockerInfo?.option2Desc}
                </p>
                <div style={{ marginTop: 'auto', paddingTop: '0.75rem' }}>
                  <Link to="/schemes" className="btn btn-secondary btn-sm" style={{ width: '100%', textAlign: 'center', textDecoration: 'none' }}>
                    Explore Other Schemes →
                  </Link>
                </div>
              </article>

              {/* Option C: If unsure, check documentation */}
              <article className="blocker-option-card">
                <h3 className="blocker-option-title">
                  {blockerInfo?.option3Title}
                </h3>
                <p className="blocker-option-desc">
                  {blockerInfo?.option3Desc}
                </p>
                <div style={{ marginTop: 'auto', paddingTop: '0.75rem' }}>
                  <Link to="/requirements" className="btn btn-outline btn-sm" style={{ width: '100%', textAlign: 'center', textDecoration: 'none' }}>
                    View Requirements Checklist →
                  </Link>
                </div>
              </article>
            </div>
          </section>

          {/* Quick Demo Reset Shortcut */}
          <section aria-labelledby="reset-demo-heading" className="blocker-reset-strip">
            <h2 id="reset-demo-heading" className="sr-only">Reset Demo State</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', width: '100%' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                {blockerInfo?.resetText}
              </span>
              <button
                type="button"
                className="reset-status-btn"
                onClick={handleClearBlocker}
                title="Reset condition response back to eligible state"
              >
                ↺ Clear Simulated Blocker
              </button>
            </div>
          </section>
        </div>
      )}

      {/* Civic Assistance Notice */}
      <GuidanceBlock headline="Assistance & Transparency Disclaimer" disclaimer="Civic-Tech Prototype">
        <p style={{ margin: 0, lineHeight: '1.5' }}>
          JANSETU explains published portal requirements to empower citizens with clarity. JANSETU does not issue government rejections, legal appeals, or official determinations. Official applications are evaluated exclusively by <strong>{currentScheme.ministryOrDepartment}</strong>.
        </p>
      </GuidanceBlock>
    </PageContainer>
  );
};
