import React from 'react';
import { PageContainer } from '../../components/PageContainer';
import { Button } from '../../components/Button';
import { useNavigate } from 'react-router-dom';

export const WelcomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/need');
  };

  return (
    <PageContainer
      stepNumber={1}
      title="Welcome to JANSETU"
      description="A civic readiness platform that helps citizens discover welfare schemes and prepare complete, blocker-free applications."
      nextPath="/need"
      nextLabel="Find support for me →"
    >
      <section className="welcome-hero" aria-labelledby="hero-heading">
        <h2 id="hero-heading" className="welcome-headline">
          Government support, made easier to act on.
        </h2>
        <p className="welcome-subhead">
          Navigating public schemes shouldn't be confusing. JANSETU translates complex official guidelines into plain language, checks your eligibility prerequisites, and identifies exactly what you need to apply.
        </p>
        <div>
          <Button variant="primary" size="lg" onClick={handleStart}>
            Find support for me →
          </Button>
        </div>
      </section>

      <section aria-labelledby="how-it-works-heading">
        <h2 id="how-it-works-heading" style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 1rem 0' }}>
          How JANSETU works with you
        </h2>

        <div className="pillars-grid">
          <div className="pillar-card">
            <span className="pillar-step-badge" aria-hidden="true">1</span>
            <h3 className="pillar-title">Tell us what you need</h3>
            <p className="pillar-desc">
              Describe your personal or household need in your own everyday words. You don't need to know complex government scheme names.
            </p>
          </div>

          <div className="pillar-card">
            <span className="pillar-step-badge" aria-hidden="true">2</span>
            <h3 className="pillar-title">Check what criteria match</h3>
            <p className="pillar-desc">
              Understand which published government schemes match your situation and which criteria appear satisfied based on available data.
            </p>
          </div>

          <div className="pillar-card">
            <span className="pillar-step-badge" aria-hidden="true">3</span>
            <h3 className="pillar-title">Know what you need next</h3>
            <p className="pillar-desc">
              Move beyond basic eligibility. Discover missing certificates, pending verifications, and your exact next practical step before applying.
            </p>
          </div>
        </div>
      </section>

      <div className="trust-boundary-box" role="note" aria-label="Trust and boundary clarification">
        <strong>Trust &amp; Service Scope:</strong> JANSETU is an independent assistance guide designed to help citizens understand and prepare for government schemes. It does not submit applications or approve benefits. All official applications are completed through official government channels.
      </div>
    </PageContainer>
  );
};
