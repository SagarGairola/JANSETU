import React from 'react';
import { PageContainer } from '../../components/PageContainer';
import { Card } from '../../components/Card';
import { StatusBadge } from '../../components/StatusBadge';
import { useDemo } from '../../context';

export const SchemeDetailsPage: React.FC = () => {
  const { currentScheme } = useDemo();

  return (
    <PageContainer
      stepNumber={4}
      title={currentScheme.name}
      description={`Overview and published guidelines issued by ${currentScheme.ministryOrDepartment}.`}
      backPath="/schemes"
      nextPath="/eligibility"
      nextLabel="Start Eligibility Check →"
    >
      <Card title="What This Scheme Provides">
        <p style={{ margin: 0, fontSize: '0.9375rem', lineHeight: 1.6 }}>
          {currentScheme.benefitSummary}
        </p>
      </Card>

      <Card title="Target Beneficiaries & Scope">
        <p style={{ margin: 0, fontSize: '0.9375rem', lineHeight: 1.6 }}>
          {currentScheme.targetAudience}
        </p>
      </Card>

      <Card title="Published Mandatory Requirements">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          <div>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
              Core Eligibility Conditions:
            </h3>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.875rem' }}>
              {currentScheme.eligibilityCriteria.map((c) => (
                <li key={c.id} style={{ marginBottom: '0.25rem' }}>
                  {c.label}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
              Required Verification Documents:
            </h3>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.875rem' }}>
              {currentScheme.requiredDocuments.map((d) => (
                <li key={d.id} style={{ marginBottom: '0.25rem' }}>
                  {d.name} {d.isMandatory ? '(Mandatory)' : '(Optional)'}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      <Card title="Official Source & Governing Body">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <div style={{ fontWeight: 600 }}>{currentScheme.officialPortalName}</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>{currentScheme.officialPortalUrl}</div>
          </div>
          <StatusBadge status="ready" customLabel="Official Portal Source" />
        </div>
      </Card>
    </PageContainer>
  );
};
