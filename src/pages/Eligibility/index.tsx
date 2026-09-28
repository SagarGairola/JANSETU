import React, { useMemo } from 'react';
import { PageContainer } from '../../components/PageContainer';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { useDemo } from '../../context';
import { evaluateEligibility } from '../../utils/eligibilityEvaluator';
import type { CitizenProfileAnswers } from '../../types';

export const EligibilityPage: React.FC = () => {
  const { currentScheme, answers, updateAnswer, setSampleApplicant } = useDemo();

  // Evaluate eligibility dynamically against current scheme and answers
  const evaluation = useMemo(() => {
    return evaluateEligibility(currentScheme, answers);
  }, [currentScheme, answers]);

  const handleSelectOption = (field: keyof CitizenProfileAnswers, value: string) => {
    updateAnswer(field, value);
  };

  return (
    <PageContainer
      stepNumber={5}
      title="Eligibility Condition Check"
      description="Reviewing whether the published rules for this scheme appear to fit your situation. This is not an official government approval."
      backPath="/scheme-details"
      nextPath="/readiness"
      nextLabel="Check application readiness →"
    >
      {/* Selected Scheme Context */}
      <section className="eligibility-intro-banner" aria-label="Scheme context">
        <div>
          <span style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-brand-primary)' }}>
            Checking eligibility for
          </span>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-main)', margin: '0.25rem 0' }}>
            {currentScheme.name}
          </h2>
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
            Issued by {currentScheme.ministryOrDepartment}
          </span>
        </div>
        <div style={{ maxWidth: '320px', fontSize: '0.8125rem', color: 'var(--color-text-muted)', lineHeight: '1.4' }}>
          We check the key published conditions using your declared details in this demo.
        </div>
      </section>

      {/* Preset Bar for Demo Shortcut */}
      <div className="preset-bar">
        <span className="preset-caption">
          <strong>Demo shortcut:</strong> Load sample answers for this scheme demonstration.
        </span>
        <Button variant="outline" size="sm" onClick={setSampleApplicant}>
          ⚡ Use sample applicant data
        </Button>
      </div>

      {/* Conversational Profile Questions */}
      <Card title="Tell Us A Little About Your Situation" titleAs="h2">
        <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
          JANSETU only asks for details necessary to check conditions published for {currentScheme.name}.
        </p>

        {/* Education Scheme Questions */}
        {currentScheme.category === 'education' && (
          <div>
            <div className="question-block">
              <div className="question-title">
                1. What is your approximate annual family income?
              </div>
              <span className="question-hint">
                Used to check the published income ceiling condition (&lt; ₹2.50 Lakh/year).
              </span>
              <div className="options-container" role="radiogroup" aria-label="Annual income">
                <button
                  type="button"
                  role="radio"
                  aria-checked={answers.annualIncome === 'under_250k'}
                  className={`option-pill ${answers.annualIncome === 'under_250k' ? 'active' : ''}`}
                  onClick={() => handleSelectOption('annualIncome', 'under_250k')}
                >
                  Under ₹2,50,000 / year
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={answers.annualIncome === 'over_250k'}
                  className={`option-pill ${answers.annualIncome === 'over_250k' ? 'active' : ''}`}
                  onClick={() => handleSelectOption('annualIncome', 'over_250k')}
                >
                  Above ₹2,50,000 / year
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={answers.annualIncome === 'unknown'}
                  className={`option-pill ${answers.annualIncome === 'unknown' ? 'active' : ''}`}
                  onClick={() => handleSelectOption('annualIncome', 'unknown')}
                >
                  Not sure yet
                </button>
              </div>
            </div>

            <div className="question-block">
              <div className="question-title">
                2. Are you currently enrolled in a recognized post-matric course or degree?
              </div>
              <span className="question-hint">
                Scholarship covers students enrolled in affiliated colleges, polytechnics, or universities.
              </span>
              <div className="options-container" role="radiogroup" aria-label="College enrollment">
                <button
                  type="button"
                  role="radio"
                  aria-checked={answers.isEnrolledInCollege === 'yes'}
                  className={`option-pill ${answers.isEnrolledInCollege === 'yes' ? 'active' : ''}`}
                  onClick={() => handleSelectOption('isEnrolledInCollege', 'yes')}
                >
                  Yes, actively enrolled
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={answers.isEnrolledInCollege === 'no'}
                  className={`option-pill ${answers.isEnrolledInCollege === 'no' ? 'active' : ''}`}
                  onClick={() => handleSelectOption('isEnrolledInCollege', 'no')}
                >
                  No / Not enrolled
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={answers.isEnrolledInCollege === 'pending'}
                  className={`option-pill ${answers.isEnrolledInCollege === 'pending' ? 'active' : ''}`}
                  onClick={() => handleSelectOption('isEnrolledInCollege', 'pending')}
                >
                  Admission in progress
                </button>
              </div>
            </div>

            <div className="question-block">
              <div className="question-title">
                3. Are you a permanent resident (domicile) of the applying state?
              </div>
              <span className="question-hint">
                Official quota requires matching state domicile residency records.
              </span>
              <div className="options-container" role="radiogroup" aria-label="State domicile">
                <button
                  type="button"
                  role="radio"
                  aria-checked={answers.isDomicileResident === 'yes'}
                  className={`option-pill ${answers.isDomicileResident === 'yes' ? 'active' : ''}`}
                  onClick={() => handleSelectOption('isDomicileResident', 'yes')}
                >
                  Yes, have domicile proof
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={answers.isDomicileResident === 'unclear'}
                  className={`option-pill ${answers.isDomicileResident === 'unclear' ? 'active' : ''}`}
                  onClick={() => handleSelectOption('isDomicileResident', 'unclear')}
                >
                  Residing here, but proof unverified
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={answers.isDomicileResident === 'no'}
                  className={`option-pill ${answers.isDomicileResident === 'no' ? 'active' : ''}`}
                  onClick={() => handleSelectOption('isDomicileResident', 'no')}
                >
                  No, different state resident
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Agriculture Scheme Questions */}
        {currentScheme.category === 'agriculture' && (
          <div>
            <div className="question-block">
              <div className="question-title">
                1. Does your family possess cultivable landholding in land revenue records?
              </div>
              <span className="question-hint">
                PM-KISAN benefits apply to landholding farmer families with registered land titles.
              </span>
              <div className="options-container" role="radiogroup" aria-label="Landholding">
                <button
                  type="button"
                  role="radio"
                  aria-checked={answers.hasLandholding === 'yes'}
                  className={`option-pill ${answers.hasLandholding === 'yes' ? 'active' : ''}`}
                  onClick={() => handleSelectOption('hasLandholding', 'yes')}
                >
                  Yes, registered landholder
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={answers.hasLandholding === 'no'}
                  className={`option-pill ${answers.hasLandholding === 'no' ? 'active' : ''}`}
                  onClick={() => handleSelectOption('hasLandholding', 'no')}
                >
                  No cultivable landholding
                </button>
              </div>
            </div>

            <div className="question-block">
              <div className="question-title">
                2. Has your Aadhaar e-KYC (OTP or biometric) been completed?
              </div>
              <span className="question-hint">
                Mandatory verification required for release of upcoming scheme installments.
              </span>
              <div className="options-container" role="radiogroup" aria-label="Aadhaar e-KYC">
                <button
                  type="button"
                  role="radio"
                  aria-checked={answers.hasCompletedEkyc === 'yes'}
                  className={`option-pill ${answers.hasCompletedEkyc === 'yes' ? 'active' : ''}`}
                  onClick={() => handleSelectOption('hasCompletedEkyc', 'yes')}
                >
                  Yes, completed on portal
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={answers.hasCompletedEkyc === 'unclear'}
                  className={`option-pill ${answers.hasCompletedEkyc === 'unclear' ? 'active' : ''}`}
                  onClick={() => handleSelectOption('hasCompletedEkyc', 'unclear')}
                >
                  Pending or not sure
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={answers.hasCompletedEkyc === 'no'}
                  className={`option-pill ${answers.hasCompletedEkyc === 'no' ? 'active' : ''}`}
                  onClick={() => handleSelectOption('hasCompletedEkyc', 'no')}
                >
                  Not done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Business Scheme Questions */}
        {currentScheme.category === 'business' && (
          <div>
            <div className="question-block">
              <div className="question-title">
                1. Are you at least 18 years of age?
              </div>
              <span className="question-hint">
                PMEGP credit subsidies are available to any adult Indian citizen above 18.
              </span>
              <div className="options-container" role="radiogroup" aria-label="Age requirement">
                <button
                  type="button"
                  role="radio"
                  aria-checked={answers.isAge18Plus === 'yes'}
                  className={`option-pill ${answers.isAge18Plus === 'yes' ? 'active' : ''}`}
                  onClick={() => handleSelectOption('isAge18Plus', 'yes')}
                >
                  Yes, 18 years or older
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={answers.isAge18Plus === 'no'}
                  className={`option-pill ${answers.isAge18Plus === 'no' ? 'active' : ''}`}
                  onClick={() => handleSelectOption('isAge18Plus', 'no')}
                >
                  Under 18
                </button>
              </div>
            </div>

            <div className="question-block">
              <div className="question-title">
                2. Is this loan intended for establishing a brand new micro-unit?
              </div>
              <span className="question-hint">
                Scheme assistance applies strictly to new ventures; existing operational units are ineligible.
              </span>
              <div className="options-container" role="radiogroup" aria-label="Unit establishment">
                <button
                  type="button"
                  role="radio"
                  aria-checked={answers.isNewUnit === 'yes'}
                  className={`option-pill ${answers.isNewUnit === 'yes' ? 'active' : ''}`}
                  onClick={() => handleSelectOption('isNewUnit', 'yes')}
                >
                  Yes, brand new venture
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={answers.isNewUnit === 'no'}
                  className={`option-pill ${answers.isNewUnit === 'no' ? 'active' : ''}`}
                  onClick={() => handleSelectOption('isNewUnit', 'no')}
                >
                  No, existing operational unit
                </button>
              </div>
            </div>

            <div className="question-block">
              <div className="question-title">
                3. What is your highest educational qualification?
              </div>
              <span className="question-hint">
                Minimum Class 8 pass is required for manufacturing projects exceeding ₹10 Lakh.
              </span>
              <div className="options-container" role="radiogroup" aria-label="Educational qualification">
                <button
                  type="button"
                  role="radio"
                  aria-checked={answers.educationQualification === 'class_8_plus'}
                  className={`option-pill ${answers.educationQualification === 'class_8_plus' ? 'active' : ''}`}
                  onClick={() => handleSelectOption('educationQualification', 'class_8_plus')}
                >
                  Class 8 pass or higher
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={answers.educationQualification === 'below_class_8'}
                  className={`option-pill ${answers.educationQualification === 'below_class_8' ? 'active' : ''}`}
                  onClick={() => handleSelectOption('educationQualification', 'below_class_8')}
                >
                  Below Class 8
                </button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Evaluated Conditions List */}
      <section aria-labelledby="conditions-evaluation-heading" style={{ marginTop: '1.5rem' }}>
        <h2 id="conditions-evaluation-heading" style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 1rem 0' }}>
          Condition-by-Condition Assessment
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {evaluation.criteria.map((item) => {
            let badgeClass = 'badge-unclear';
            let badgeIcon = '?';
            let badgeLabel = 'Needs verification';

            if (item.status === 'appears_satisfied') {
              badgeClass = 'badge-satisfied';
              badgeIcon = '✓';
              badgeLabel = 'Appears satisfied';
            } else if (item.status === 'appears_not_satisfied') {
              badgeClass = 'badge-unsatisfied';
              badgeIcon = '✕';
              badgeLabel = 'Appears not satisfied';
            }

            return (
              <Card
                key={item.criterionId}
                title={item.label}
                titleAs="h3"
                badge={
                  <span className={`status-badge ${badgeClass}`} role="note">
                    <span aria-hidden="true">{badgeIcon}</span>
                    <span>{badgeLabel}</span>
                  </span>
                }
              >
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-main)', marginBottom: '0.5rem' }}>
                  <strong>Official requirement:</strong> {item.description}
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', backgroundColor: 'var(--color-bg-subtle)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)' }}>
                  <strong>Assessment note:</strong> {item.explanation}
                </div>
                <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  <strong>Official Source:</strong> {currentScheme.officialPortalName || 'Official Scheme Portal'} ({currentScheme.ministryOrDepartment})
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Summary Box */}
      <section className="eligibility-summary-box" aria-label="Eligibility summary">
        <div style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-brand-primary)', marginBottom: '0.25rem' }}>
          Eligibility Check Summary
        </div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-main)', margin: '0 0 0.5rem 0' }}>
          {evaluation.summaryHeadline}
        </h3>
        <p style={{ margin: '0 0 1rem 0', fontSize: '0.9375rem', color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
          {evaluation.summaryExplanation}
        </p>

        {/* Step 11: Dedicated Eligibility to Application Readiness Bridge */}
        <div className="eligibility-readiness-bridge" role="region" aria-label="Next stage preview">
          <div className="bridge-header">
            <span className="bridge-badge">Next Step</span>
            <h4 className="bridge-title">Eligibility is only the first step. Now let's check your Application Readiness.</h4>
          </div>
          <p className="bridge-content">
            Meeting eligibility criteria means you fit the policy intent, but applications often get rejected when documents are expired, names do not match, or bank accounts lack Aadhaar seeding. Next, JANSETU will audit your exact application readiness.
          </p>
          <div className="bridge-steps-preview">
            <div className="bridge-step-item">
              <span aria-hidden="true">📄</span>
              <span><strong>Document Status:</strong> Complete, missing, or needs update</span>
            </div>
            <div className="bridge-step-item">
              <span aria-hidden="true">🏦</span>
              <span><strong>Prerequisites:</strong> Active bank account, Aadhaar seeding</span>
            </div>
            <div className="bridge-step-item">
              <span aria-hidden="true">⏳</span>
              <span><strong>Timelines:</strong> Application window & renewal validity</span>
            </div>
          </div>
        </div>
      </section>
    </PageContainer>
  );
};
