import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../../components/PageContainer';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { PipelineLoader } from '../../components/PipelineLoader';
import { useDemo } from '../../context';
import { evaluateClarification } from '../../services/clarificationEngine';

interface QuickPrompt {
  id: string;
  label: string;
  text: string;
}

const QUICK_PROMPTS: QuickPrompt[] = [
  {
    id: 'business',
    label: 'Youth Entrepreneurship',
    text: 'I want financial assistance to start a new business enterprise.',
  },
  {
    id: 'skills',
    label: 'Free Skill Development',
    text: 'I want free technical skill training and certification to get a job.',
  },
  {
    id: 'education',
    label: 'Higher Education Fees',
    text: 'I want financial support for my higher education and technical studies.',
  },
];

export const NeedInputPage: React.FC = () => {
  const navigate = useNavigate();
  const { userNeed, setUserNeed, needProfile, submitClarificationAnswer } = useDemo();
  const [isExecutingPipeline, setIsExecutingPipeline] = React.useState(false);

  const handlePromptClick = (promptText: string) => {
    setUserNeed(promptText);
  };

  const clarification = React.useMemo(() => {
    if (!userNeed.trim()) {
      return { needsClarification: false, questions: [], reason: 'Need is sufficiently understood' as const };
    }
    return evaluateClarification(needProfile);
  }, [userNeed, needProfile]);

  const handleStartSearch = () => {
    setIsExecutingPipeline(true);
  };

  const handlePipelineComplete = () => {
    setIsExecutingPipeline(false);
    navigate('/schemes');
  };

  return (
    <>
      {isExecutingPipeline && (
        <PipelineLoader onComplete={handlePipelineComplete} />
      )}
      <PageContainer
        stepNumber={2}
        title="What do you need help with?"
        description="Tell JANSETU what you're trying to do or what support you're looking for. You can write it in your own words."
        backPath="/"
        nextPath="/schemes"
        onNext={handleStartSearch}
        nextLabel="Find relevant support →"
        primaryActionDisabled={!userNeed.trim() || clarification.needsClarification}
      >
        <Card title="Describe Your Need" titleAs="h2">
        <div className="form-group">
          <label htmlFor="need-input" className="form-label">
            What kind of support are you looking for?
          </label>
          <textarea
            id="need-input"
            rows={5}
            className="form-textarea"
            value={userNeed}
            onChange={(e) => setUserNeed(e.target.value)}
            placeholder="e.g. I need financial support for my education..."
            aria-describedby="need-input-hint"
          />
          <span id="need-input-hint" className="form-hint">
            You don't need to know official scheme titles or technical terms. Simple words work best.
          </span>
        </div>

        <div className="quick-prompts-section">
          <span className="quick-prompts-label">
            Or choose a common example to try:
          </span>
          <div className="quick-prompts-container" role="group" aria-label="Example need prompts">
            {QUICK_PROMPTS.map((prompt) => {
              const isSelected = userNeed.trim() === prompt.text.trim();
              return (
                <button
                  key={prompt.id}
                  type="button"
                  className={`quick-prompt-btn ${isSelected ? 'selected' : ''}`.trim()}
                  onClick={() => handlePromptClick(prompt.text)}
                  aria-pressed={isSelected}
                >
                  {isSelected && (
                    <span className="prompt-check" aria-hidden="true">
                      ✓
                    </span>
                  )}
                  <span>{prompt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--color-border-main)', display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="primary"
            size="md"
            onClick={handleStartSearch}
            disabled={!userNeed.trim() || clarification.needsClarification}
          >
            Find relevant support →
          </Button>
        </div>
      </Card>

      {clarification.needsClarification && clarification.questions.length > 0 && (
        <div style={{ marginTop: '1.25rem' }}>
          <Card title="Help JANSETU pinpoint your requirement" titleAs="h3" className="clarification-card">
          <div className="alert-block alert-info" style={{ marginBottom: '1rem' }} role="status">
            <span aria-hidden="true" style={{ fontWeight: 'bold' }}>ℹ</span>
            <div>
              <strong>Clarification needed:</strong>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
                To find genuinely relevant government schemes rather than showing random options, please clarify:
              </p>
            </div>
          </div>

          {clarification.questions.map((q) => (
            <div key={q.id} className="clarification-question-block" style={{ marginBottom: '1rem' }}>
              <p style={{ fontWeight: 600, fontSize: '0.9375rem', marginBottom: '0.5rem', color: 'var(--color-text-main)' }}>
                {q.question}
              </p>
              {q.options && (
                <div className="quick-prompts-container" role="group" aria-label="Clarification options">
                  {q.options.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      className="quick-prompt-btn"
                      onClick={() => submitClarificationAnswer(q.field, opt)}
                    >
                      <span>{opt}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </Card>
      </div>
      )}

      {!userNeed.trim() ? (
        <p style={{ fontSize: '0.875rem', color: 'var(--color-status-verify)', marginTop: '0.75rem' }}>
          ℹ Please enter your requirement or pick an example prompt above to continue.
        </p>
      ) : clarification.needsClarification ? (
        <p style={{ fontSize: '0.875rem', color: 'var(--color-status-verify)', marginTop: '0.75rem' }}>
          ℹ Please select one of the clarification options above so JANSETU can find matching schemes.
        </p>
      ) : null}
      </PageContainer>
    </>
  );
};
