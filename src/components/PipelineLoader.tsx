import React, { useEffect, useState } from 'react';

interface PipelineStep {
  id: string;
  name: string;
  engine: string;
  description: string;
}

const PIPELINE_STEPS: PipelineStep[] = [
  {
    id: 'need',
    name: 'Analyzing Need & Extracting Profile...',
    engine: 'needEngine (Taxonomy & Profile Extractor)',
    description: 'Classified domain, extracted beneficiary attributes, and filtered negations.',
  },
  {
    id: 'eligibility',
    name: 'Evaluating Strict Eligibility Criteria...',
    engine: 'eligibilityEvaluator (Evidence Grounding)',
    description: 'Checked rules against statutory income, age, and institutional thresholds.',
  },
  {
    id: 'friction',
    name: 'Calculating Document Readiness & Bureaucracy Friction...',
    engine: 'readinessEvaluator (Friction Index 1-10)',
    description: 'Calculated document turnaround delays and administrative burden scores.',
  },
  {
    id: 'blockers',
    name: 'Resolving Application Blockers & Low-Friction Alternatives...',
    engine: 'blockerResolver & alternativeEngine',
    description: 'Identified heavy documentation blockers and instant pivot alternatives.',
  },
];

interface PipelineLoaderProps {
  onComplete: () => void;
  speedMultiplier?: number;
}

export const PipelineLoader: React.FC<PipelineLoaderProps> = ({ onComplete, speedMultiplier = 1 }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    const stepDuration = 450 * speedMultiplier;

    const timer = setInterval(() => {
      setCurrentStepIndex((prev) => {
        setCompletedSteps((done) => [...done, prev]);
        if (prev >= PIPELINE_STEPS.length - 1) {
          clearInterval(timer);
          setTimeout(onComplete, 400 * speedMultiplier);
          return prev;
        }
        return prev + 1;
      });
    }, stepDuration);

    return () => clearInterval(timer);
  }, [onComplete, speedMultiplier]);

  const progressPercent = Math.round(
    ((completedSteps.length + (currentStepIndex === PIPELINE_STEPS.length - 1 ? 1 : 0.5)) /
      PIPELINE_STEPS.length) *
      100
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-fadeIn"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem',
      }}
      role="dialog"
      aria-modal="true"
      aria-label="JANSETU Intelligence Pipeline Execution"
    >
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        style={{
          width: '100%',
          maxWidth: '34rem',
          backgroundColor: '#ffffff',
          borderRadius: '1rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #cbd5e1',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: '#1e3a8a',
            padding: '1.25rem 1.5rem',
            color: '#ffffff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#93c5fd' }}>
              Deterministic Intelligence Pipeline
            </span>
            <span style={{ fontSize: '0.8125rem', fontFamily: 'monospace', fontWeight: 700, color: '#bfdbfe' }}>
              {Math.min(progressPercent, 100)}% Complete
            </span>
          </div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>
            Executing Application Readiness Pipeline
          </h2>
          {/* Progress Bar */}
          <div
            style={{
              width: '100%',
              height: '6px',
              backgroundColor: '#1e40af',
              borderRadius: '9999px',
              marginTop: '0.75rem',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${Math.min(progressPercent, 100)}%`,
                height: '100%',
                backgroundColor: '#38bdf8',
                borderRadius: '9999px',
                transition: 'width 0.3s ease-in-out',
              }}
            />
          </div>
        </div>

        {/* Steps List */}
        <div style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {PIPELINE_STEPS.map((step, idx) => {
              const isDone = completedSteps.includes(idx);
              const isCurrent = currentStepIndex === idx && !isDone;

              return (
                <div
                  key={step.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    backgroundColor: isCurrent ? '#eff6ff' : isDone ? '#f8fafc' : 'transparent',
                    border: isCurrent ? '1px solid #bfdbfe' : '1px solid transparent',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {/* Status Icon */}
                  <div
                    style={{
                      width: '1.75rem',
                      height: '1.75rem',
                      borderRadius: '9999px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      flexShrink: 0,
                      backgroundColor: isDone
                        ? '#059669'
                        : isCurrent
                        ? '#2563eb'
                        : '#e2e8f0',
                      color: isDone || isCurrent ? '#ffffff' : '#64748b',
                    }}
                  >
                    {isDone ? (
                      '✓'
                    ) : isCurrent ? (
                      <span className="animate-spin" style={{ display: 'inline-block' }}>
                        ⚙
                      </span>
                    ) : (
                      idx + 1
                    )}
                  </div>

                  {/* Text */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <h3
                        style={{
                          margin: 0,
                          fontSize: '0.9375rem',
                          fontWeight: 700,
                          color: isCurrent ? '#1e3a8a' : isDone ? '#0f172a' : '#94a3b8',
                        }}
                      >
                        {step.name}
                      </h3>
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          fontFamily: 'monospace',
                          padding: '0.125rem 0.375rem',
                          borderRadius: '0.25rem',
                          backgroundColor: isCurrent ? '#dbeafe' : '#f1f5f9',
                          color: isCurrent ? '#1d4ed8' : '#64748b',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {step.engine.split(' ')[0]}
                      </span>
                    </div>

                    <p
                      style={{
                        margin: '0.25rem 0 0 0',
                        fontSize: '0.8125rem',
                        color: isCurrent ? '#2563eb' : isDone ? '#475569' : '#94a3b8',
                        lineHeight: 1.4,
                      }}
                    >
                      {isDone ? step.description : step.engine}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div
            style={{
              marginTop: '1.25rem',
              paddingTop: '0.75rem',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
              color: '#64748b',
            }}
          >
            <span>Deterministic Rule Evaluation Engine</span>
            <span>Zero Hallucinations</span>
          </div>
        </div>
      </div>
    </div>
  );
};
