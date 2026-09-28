import React from 'react';
import { PageContainer } from '../../components/PageContainer';
import { Card } from '../../components/Card';
import { AlertBlock } from '../../components/AlertBlock';
import { GuidanceBlock } from '../../components/GuidanceBlock';
import { useDemo } from '../../context';

export const OfficialApplicationPage: React.FC = () => {
  const { currentScheme } = useDemo();

  return (
    <PageContainer
      stepNumber={9}
      title="Official Application Portal"
      description="Connect directly to the authorized government platform to submit your legal application."
      backPath="/next-action"
      nextPath="/blocker"
      nextLabel="Simulate Portal Blocker / Rejection Helper →"
    >
      <AlertBlock type="info" title="Official Boundary Clarification">
        <strong>JANSETU is your readiness and eligibility guide.</strong> The official application must be legally submitted on the authorized government portal. JANSETU will never ask for your government account passwords or directly submit applications on your behalf.
      </AlertBlock>

      <Card
        title={`Official Channel: ${currentScheme.officialPortalName}`}
        subtitle={`Operated by: ${currentScheme.ministryOrDepartment}`}
      >
        <p style={{ fontSize: '0.9375rem', lineHeight: 1.6 }}>
          When your documents are ready, complete your registration on the official portal below:
        </p>
        <div style={{ margin: '1rem 0' }}>
          <a
            href={currentScheme.officialPortalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{ textDecoration: 'none' }}
          >
            Open Official Portal: {currentScheme.officialPortalUrl} ↗
          </a>
        </div>
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
          Note: Ensure you are on the authentic <code>.gov.in</code> domain to prevent fraudulent portals.
        </p>
      </Card>

      <GuidanceBlock headline="Submission Readiness Check" disclaimer="Pre-submission safety">
        Make sure you have:
        <br />• Valid identification and caste/category credentials where applicable
        <br />• Aadhaar-linked active mobile number for OTP authentication
        {currentScheme.id === 'post-matric-scholarship' && (
          <>
            <br />• Active student admission enrollment number from your college
            <br />• Current academic year income certificate
          </>
        )}
        {currentScheme.id === 'pm-kisan' && (
          <>
            <br />• Updated land record documents (ROR / Khatauni) in applicant's name
            <br />• Bank account seeded with Aadhaar and NPCI mapping active
          </>
        )}
        {currentScheme.id === 'pmegp-micro-enterprise' && (
          <>
            <br />• EDP Training Completion Certificate
            <br />• Detailed Project Report (DPR) with financial cost breakdown
          </>
        )}
      </GuidanceBlock>
    </PageContainer>
  );
};
