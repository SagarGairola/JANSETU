import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

interface StepItem {
  path: string;
  label: string;
  stepNum: number;
}

const DEMO_STEPS: StepItem[] = [
  { stepNum: 1, label: 'Welcome', path: '/' },
  { stepNum: 2, label: 'Need', path: '/need' },
  { stepNum: 3, label: 'Schemes', path: '/schemes' },
  { stepNum: 4, label: 'Details', path: '/scheme-details' },
  { stepNum: 5, label: 'Eligibility', path: '/eligibility' },
  { stepNum: 6, label: 'Readiness', path: '/readiness' },
  { stepNum: 7, label: 'Requirements', path: '/requirements' },
  { stepNum: 8, label: 'Next Action', path: '/next-action' },
  { stepNum: 9, label: 'Official Portal', path: '/official-application' },
  { stepNum: 10, label: 'Blocker Helper', path: '/blocker' },
];

export const ProgressIndicator: React.FC = () => {
  const location = useLocation();
  const currentStep = DEMO_STEPS.find((s) => s.path === location.pathname) || DEMO_STEPS[0];

  let currentPhase = 'Understand';
  if (currentStep.stepNum >= 9) currentPhase = 'Act';
  else if (currentStep.stepNum >= 7) currentPhase = 'Prepare';
  else if (currentStep.stepNum >= 5) currentPhase = 'Check';

  return (
    <nav className="progress-nav" aria-label="Demo flow progress">
      <div className="progress-phase-strip">
        <span className="phase-label">Journey Phase:</span>
        <span className={`phase-pill ${currentPhase === 'Understand' ? 'phase-active' : ''}`} title="needEngine: Natural language understanding & taxonomy">
          1. Understand <small style={{ opacity: 0.75, fontSize: '0.6875rem' }}>(needEngine)</small>
        </span>
        <span className="phase-sep" aria-hidden="true">→</span>
        <span className={`phase-pill ${currentPhase === 'Check' ? 'phase-active' : ''}`} title="eligibilityEvaluator: Evidence grounding & rule checking">
          2. Check <small style={{ opacity: 0.75, fontSize: '0.6875rem' }}>(evidenceEngine)</small>
        </span>
        <span className="phase-sep" aria-hidden="true">→</span>
        <span className={`phase-pill ${currentPhase === 'Prepare' ? 'phase-active' : ''}`} title="readinessEvaluator: Friction scoring & document readiness">
          3. Prepare <small style={{ opacity: 0.75, fontSize: '0.6875rem' }}>(readinessEngine)</small>
        </span>
        <span className="phase-sep" aria-hidden="true">→</span>
        <span className={`phase-pill ${currentPhase === 'Act' ? 'phase-active' : ''}`} title="blockerResolver: Resolution options & portal handoff">
          4. Act <small style={{ opacity: 0.75, fontSize: '0.6875rem' }}>(blockerResolver)</small>
        </span>
      </div>
      <div className="progress-track">
        {DEMO_STEPS.map((step, idx) => (
          <React.Fragment key={step.path}>
            <NavLink
              to={step.path}
              className={({ isActive }) =>
                `progress-step ${isActive ? 'active' : ''}`
              }
            >
              <span aria-hidden="true" style={{ opacity: 0.8 }}>
                {step.stepNum}.
              </span>
              <span>{step.label}</span>
            </NavLink>
            {idx < DEMO_STEPS.length - 1 && (
              <span className="progress-divider" aria-hidden="true">
                →
              </span>
            )}
          </React.Fragment>
        ))}
      </div>
    </nav>
  );
};
