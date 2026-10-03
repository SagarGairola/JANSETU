import React, { useState, useEffect, useRef } from 'react';
import { storyContent } from '../data/storyContent';
import { audioManager } from '../audio/AudioManager';
import { SceneContainer } from '../components/SceneContainer';

interface EndingSceneProps {
  userCompliment?: string;
  onReplay: () => void;
}

type EndingSubState =
  | 'SUBMITTED_HOLD'
  | 'RESULT_INTRO'
  | 'RESULT_REVEAL'
  | 'SHORT_REFLECTION'
  | 'QUICK_FLASHES'
  | 'EMOTIONAL_PUNCH'
  | 'TEAM_BADGE_HOLD'
  | 'COMEDY_CUT'
  | 'FINAL_CREDITS'
  | 'FINAL_SCREEN';

export const EndingScene: React.FC<EndingSceneProps> = ({
  userCompliment,
  onReplay
}) => {
  const content = storyContent.ending;

  const [subState, setSubState] = useState<EndingSubState>('SUBMITTED_HOLD');

  const [resultIntroIdx, setResultIntroIdx] = useState<number>(0);
  const [reflectionIdx, setReflectionIdx] = useState<number>(0);
  const [flashIdx, setFlashIdx] = useState<number>(0);
  const [emotionalIdx, setEmotionalIdx] = useState<number>(0);
  const [showThatPartIsOurs, setShowThatPartIsOurs] = useState<boolean>(false);
  const [comedyIdx, setComedyIdx] = useState<number>(0);
  const [showYet, setShowYet] = useState<boolean>(false);
  const [creditWordIdx, setCreditWordIdx] = useState<number>(0);
  const [creditsPayoffIdx, setCreditsPayoffIdx] = useState<number>(0);
  const [finalMessageIdx, setFinalMessageIdx] = useState<number>(0);
  const [showReplay, setShowReplay] = useState<boolean>(false);

  const isMounted = useRef<boolean>(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // 1. SUBMITTED_HOLD -> RESULT_INTRO (~2s)
  useEffect(() => {
    if (subState === 'SUBMITTED_HOLD') {
      audioManager.playSubmissionHold();
      const timer = setTimeout(() => {
        if (isMounted.current) setSubState('RESULT_INTRO');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [subState]);

  // 2. RESULT_INTRO: "Okay." -> "So..." -> "we got the result."
  useEffect(() => {
    if (subState === 'RESULT_INTRO') {
      if (resultIntroIdx < content.resultIntro.length - 1) {
        const timer = setTimeout(() => {
          if (isMounted.current) setResultIntroIdx(prev => prev + 1);
        }, 1300);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => {
          if (isMounted.current) {
            audioManager.cutToSilence();
            setSubState('RESULT_REVEAL');
          }
        }, 1600);
        return () => clearTimeout(timer);
      }
    }
  }, [subState, resultIntroIdx, content.resultIntro.length]);

  // 3. RESULT_REVEAL: "JANSETU wasn't selected." -> Silence for ~2.4s
  useEffect(() => {
    if (subState === 'RESULT_REVEAL') {
      const timer = setTimeout(() => {
        if (isMounted.current) setSubState('SHORT_REFLECTION');
      }, 2400);
      return () => clearTimeout(timer);
    }
  }, [subState]);

  // 4. SHORT_REFLECTION: "That kinda hurts." -> "Not gonna lie." -> "But..." -> "before the result, there was everything we did to get here." (~5.7s)
  useEffect(() => {
    if (subState === 'SHORT_REFLECTION') {
      if (reflectionIdx === 0) {
        audioManager.playReflectiveScore();
      }

      if (reflectionIdx < content.shiftLines.length - 1) {
        const delays = [1300, 1300, 1100];
        const delay = delays[reflectionIdx] ?? 1300;
        const timer = setTimeout(() => {
          if (isMounted.current) setReflectionIdx(prev => prev + 1);
        }, delay);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => {
          if (isMounted.current) setSubState('QUICK_FLASHES');
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [subState, reflectionIdx, content.shiftLines.length]);

  // 5. QUICK_FLASHES: IDEA -> PPT -> CODING -> BUGS -> DEADLINE -> DEMO -> SUBMITTED (~260ms per item = ~1.8s)
  useEffect(() => {
    if (subState === 'QUICK_FLASHES') {
      if (flashIdx < content.memoryFragments.length) {
        audioManager.playMontageTick();
        const timer = setTimeout(() => {
          if (isMounted.current) setFlashIdx(prev => prev + 1);
        }, 260);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => {
          if (isMounted.current) setSubState('EMOTIONAL_PUNCH');
        }, 320);
        return () => clearTimeout(timer);
      }
    }
  }, [subState, flashIdx, content.memoryFragments.length]);

  // 6. EMOTIONAL_PUNCH: "We had an idea." -> "We built it." -> "We made it together." -> Pause -> "That part is ours." (~6.3s)
  useEffect(() => {
    if (subState === 'EMOTIONAL_PUNCH') {
      if (emotionalIdx < content.emotionalLines.length - 1) {
        const timer = setTimeout(() => {
          if (isMounted.current) setEmotionalIdx(prev => prev + 1);
        }, 1400);
        return () => clearTimeout(timer);
      } else if (!showThatPartIsOurs) {
        const timer = setTimeout(() => {
          if (isMounted.current) setShowThatPartIsOurs(true);
        }, 1600);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => {
          if (isMounted.current) setSubState('TEAM_BADGE_HOLD');
        }, 1900);
        return () => clearTimeout(timer);
      }
    }
  }, [subState, emotionalIdx, showThatPartIsOurs, content.emotionalLines.length]);

  // 7. TEAM_BADGE_HOLD: "TEAM JANSETU ❤️" (~2.2s hold)
  useEffect(() => {
    if (subState === 'TEAM_BADGE_HOLD') {
      audioManager.playGoldenChime();
      const timer = setTimeout(() => {
        if (isMounted.current) {
          audioManager.playRecordScratch();
          setSubState('COMEDY_CUT');
        }
      }, 2200);
      return () => clearTimeout(timer);
    }
  }, [subState]);

  // 8. COMEDY_CUT: Record scratch cut to black/dark -> "Okay." -> "Enough emotional damage." -> "Obviously we're disappointed." -> "But we're not deleting the group chat." -> "...yet."
  useEffect(() => {
    if (subState === 'COMEDY_CUT') {
      if (comedyIdx < content.comedyReturn.lines.length - 1) {
        const timer = setTimeout(() => {
          if (isMounted.current) setComedyIdx(prev => prev + 1);
        }, 1300);
        return () => clearTimeout(timer);
      } else if (!showYet) {
        const timer = setTimeout(() => {
          if (isMounted.current) {
            setShowYet(true);
            audioManager.playSubtleChuckle();
          }
        }, 1400);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => {
          if (isMounted.current) {
            audioManager.playCreditsTheme();
            setSubState('FINAL_CREDITS');
          }
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [subState, comedyIdx, showYet, content.comedyReturn.lines.length]);

  // 9. FINAL_CREDITS: Credit words ticker -> Payoff -> Final Message
  useEffect(() => {
    if (subState === 'FINAL_CREDITS') {
      if (creditWordIdx < content.creditWords.length) {
        audioManager.playMontageTick();
        const timer = setTimeout(() => {
          if (isMounted.current) setCreditWordIdx(prev => prev + 1);
        }, 550);
        return () => clearTimeout(timer);
      } else if (creditsPayoffIdx < content.creditsPayoff.length) {
        const timer = setTimeout(() => {
          if (isMounted.current) setCreditsPayoffIdx(prev => prev + 1);
        }, 1800);
        return () => clearTimeout(timer);
      } else if (finalMessageIdx < content.finalMessage.length) {
        const timer = setTimeout(() => {
          if (isMounted.current) setFinalMessageIdx(prev => prev + 1);
        }, 1500);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => {
          if (isMounted.current) setSubState('FINAL_SCREEN');
        }, 2600);
        return () => clearTimeout(timer);
      }
    }
  }, [subState, creditWordIdx, creditsPayoffIdx, finalMessageIdx, content.creditWords.length, content.creditsPayoff.length, content.finalMessage.length]);

  // 10. FINAL_SCREEN: Reveal replay and subtle footer note
  useEffect(() => {
    if (subState === 'FINAL_SCREEN') {
      const timer = setTimeout(() => {
        if (isMounted.current) setShowReplay(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [subState]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: subState === 'COMEDY_CUT' ? '#000000' : '#030305',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        transition: 'background-color 0.3s ease'
      }}
    >
      <SceneContainer transitionType="cinematic">
        <div
          style={{
            width: '100%',
            maxWidth: '380px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '16px 8px',
            minHeight: '340px'
          }}
        >
          {/* STAGE 1: SUBMITTED HOLD */}
          {subState === 'SUBMITTED_HOLD' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <h1
                className="animate-pop-in"
                style={{
                  fontSize: 'clamp(32px, 8.5vw, 46px)',
                  fontWeight: 900,
                  color: 'var(--color-accent)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase'
                }}
              >
                {content.jansetuTitle}
              </h1>

              <div
                className="animate-pop-in"
                style={{
                  padding: '8px 24px',
                  borderRadius: 'var(--radius-pill)',
                  background: 'rgba(101, 230, 165, 0.12)',
                  border: '1.5px solid var(--color-yes)',
                  color: 'var(--color-yes)',
                  fontSize: '18px',
                  fontWeight: 900,
                  letterSpacing: '0.1em'
                }}
              >
                {content.submittedBadge}
              </div>
            </div>
          )}

          {/* STAGE 2: RESULT INTRO */}
          {subState === 'RESULT_INTRO' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {content.resultIntro.slice(0, resultIntroIdx + 1).map((line, idx) => (
                <p
                  key={idx}
                  className="animate-fade-in"
                  style={{
                    fontSize: idx === 2 ? 'clamp(22px, 5.8vw, 28px)' : 'clamp(18px, 4.8vw, 22px)',
                    color: idx === 2 ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontWeight: idx === 2 ? 700 : 500,
                    letterSpacing: '-0.01em'
                  }}
                >
                  {line}
                </p>
              ))}
            </div>
          )}

          {/* STAGE 3: RESULT REVEAL (Pure silence) */}
          {subState === 'RESULT_REVEAL' && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px 0'
              }}
            >
              <h2
                className="animate-pop-in"
                style={{
                  fontSize: 'clamp(26px, 7vw, 34px)',
                  fontWeight: 800,
                  color: '#ffffff',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.3
                }}
              >
                {content.resultHeadline}
              </h2>
            </div>
          )}

          {/* STAGE 4: SHORT REFLECTION */}
          {subState === 'SHORT_REFLECTION' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {content.shiftLines.slice(0, reflectionIdx + 1).map((line, idx) => {
                const isFinal = idx === 3;
                return (
                  <p
                    key={idx}
                    className="animate-fade-in"
                    style={{
                      fontSize: isFinal ? 'clamp(21px, 5.5vw, 27px)' : 'clamp(18px, 4.8vw, 22px)',
                      color: isFinal ? 'var(--color-accent)' : 'var(--text-secondary)',
                      fontWeight: isFinal ? 800 : 500,
                      letterSpacing: isFinal ? '-0.01em' : 'normal'
                    }}
                  >
                    {line}
                  </p>
                );
              })}
            </div>
          )}

          {/* STAGE 5: QUICK FLASHES (Rapid ~260ms memory flashes) */}
          {subState === 'QUICK_FLASHES' && (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {flashIdx < content.memoryFragments.length && (
                <div className="animate-pop-in" key={flashIdx}>
                  <span
                    style={{
                      fontSize: 'clamp(32px, 9vw, 48px)',
                      fontWeight: 900,
                      color: '#ffd166',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      display: 'inline-block'
                    }}
                  >
                    {content.memoryFragments[flashIdx]}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* STAGE 6: EMOTIONAL PUNCH (Slow down -> That part is ours) */}
          {subState === 'EMOTIONAL_PUNCH' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
              {content.emotionalLines.slice(0, emotionalIdx + 1).map((line, idx) => (
                <p
                  key={idx}
                  className="animate-fade-in"
                  style={{
                    fontSize: 'clamp(20px, 5.2vw, 26px)',
                    color: 'var(--text-primary)',
                    fontWeight: 600,
                    letterSpacing: '-0.01em'
                  }}
                >
                  {line}
                </p>
              ))}

              {showThatPartIsOurs && (
                <h3
                  className="headline-lg animate-pop-in"
                  style={{
                    fontSize: 'clamp(24px, 6.4vw, 32px)',
                    color: 'var(--color-accent)',
                    fontWeight: 800,
                    letterSpacing: '-0.01em',
                    marginTop: '8px'
                  }}
                >
                  {content.thatPartIsOurs}
                </h3>
              )}
            </div>
          )}

          {/* STAGE 7: TEAM BADGE HOLD (TEAM JANSETU ❤️) */}
          {subState === 'TEAM_BADGE_HOLD' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div
                className="animate-pop-in"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 28px',
                  borderRadius: 'var(--radius-pill)',
                  background: 'rgba(255, 75, 75, 0.12)',
                  border: '1.5px solid rgba(255, 100, 100, 0.6)',
                  color: '#ffffff',
                  fontSize: 'clamp(22px, 6vw, 30px)',
                  fontWeight: 900,
                  letterSpacing: '0.08em',
                  boxShadow: '0 0 32px rgba(255, 75, 75, 0.28)'
                }}
              >
                {content.teamBadge}
              </div>
            </div>
          )}

          {/* STAGE 8: COMEDY CUT (Record scratch cut -> Enough emotional damage) */}
          {subState === 'COMEDY_CUT' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {content.comedyReturn.lines.slice(0, comedyIdx + 1).map((line, idx) => (
                <p
                  key={idx}
                  className="animate-fade-in"
                  style={{
                    fontSize: idx === 1 ? 'clamp(22px, 5.8vw, 28px)' : 'clamp(17px, 4.6vw, 21px)',
                    color: idx === 1 ? '#ffd166' : 'var(--text-secondary)',
                    fontWeight: idx === 1 ? 800 : 500,
                    letterSpacing: idx === 1 ? '-0.01em' : 'normal'
                  }}
                >
                  {line}
                </p>
              ))}

              {showYet && (
                <p
                  className="animate-pop-in"
                  style={{
                    fontSize: 'clamp(24px, 6.5vw, 32px)',
                    color: 'var(--color-accent)',
                    fontWeight: 900,
                    letterSpacing: '0.04em',
                    marginTop: '4px'
                  }}
                >
                  {content.comedyReturn.finalWord}
                </p>
              )}
            </div>
          )}

          {/* STAGE 9: FINAL CREDITS */}
          {subState === 'FINAL_CREDITS' && (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {creditWordIdx < content.creditWords.length ? (
                <div className="animate-pop-in" key={creditWordIdx}>
                  <span
                    style={{
                      fontSize: 'clamp(32px, 9vw, 48px)',
                      fontWeight: 900,
                      letterSpacing: '0.04em',
                      color: 'var(--color-accent)',
                      textTransform: 'uppercase',
                      display: 'inline-block'
                    }}
                  >
                    {content.creditWords[creditWordIdx]}
                  </span>
                </div>
              ) : creditsPayoffIdx < content.creditsPayoff.length ? (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {creditsPayoffIdx >= 0 && (
                    <p
                      style={{
                        fontSize: 'clamp(17px, 4.6vw, 21px)',
                        color: 'var(--text-secondary)',
                        fontWeight: 500
                      }}
                    >
                      {content.creditsPayoff[0]}
                    </p>
                  )}

                  {creditsPayoffIdx >= 1 && (
                    <p
                      className="animate-fade-in"
                      style={{
                        fontSize: 'clamp(20px, 5.2vw, 25px)',
                        color: 'var(--text-primary)',
                        fontWeight: 600
                      }}
                    >
                      {content.creditsPayoff[1]}
                    </p>
                  )}

                  {creditsPayoffIdx >= 2 && (
                    <h2
                      className="headline-lg animate-pop-in"
                      style={{
                        fontSize: 'clamp(30px, 8vw, 42px)',
                        color: 'var(--color-accent)',
                        fontWeight: 900,
                        letterSpacing: '-0.02em',
                        marginTop: '4px'
                      }}
                    >
                      {content.creditsPayoff[2]}
                    </h2>
                  )}
                </div>
              ) : (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {finalMessageIdx >= 0 && (
                    <p
                      style={{
                        fontSize: 'clamp(17px, 4.6vw, 21px)',
                        color: 'var(--text-secondary)',
                        fontWeight: 500
                      }}
                    >
                      {content.finalMessage[0]}
                    </p>
                  )}

                  {finalMessageIdx >= 1 && (
                    <p
                      className="animate-fade-in"
                      style={{
                        fontSize: 'clamp(18px, 4.8vw, 22px)',
                        color: 'var(--text-primary)',
                        fontWeight: 600
                      }}
                    >
                      {content.finalMessage[1]}
                    </p>
                  )}

                  {finalMessageIdx >= 2 && (
                    <h3
                      className="headline-lg animate-pop-in"
                      style={{
                        fontSize: 'clamp(24px, 6.4vw, 32px)',
                        color: '#ffd166',
                        fontWeight: 900,
                        letterSpacing: '0.06em',
                        marginTop: '8px'
                      }}
                    >
                      {content.finalMessage[2]}
                    </h3>
                  )}

                  {finalMessageIdx >= 3 && (
                    <p
                      className="animate-fade-in"
                      style={{
                        fontSize: '16px',
                        color: 'var(--text-muted)',
                        fontWeight: 700,
                        letterSpacing: '0.12em'
                      }}
                    >
                      {content.finalMessage[3]}
                    </p>
                  )}

                  {finalMessageIdx >= 4 && (
                    <p
                      className="animate-fade-in"
                      style={{
                        fontSize: '19px',
                        fontWeight: 800,
                        color: 'var(--color-accent)',
                        letterSpacing: '0.06em',
                        marginTop: '6px'
                      }}
                    >
                      {content.finalMessage[4]}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* STAGE 10: FINAL SCREEN */}
          {subState === 'FINAL_SCREEN' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', width: '100%' }}>
              <p
                style={{
                  fontSize: '13px',
                  color: 'var(--text-muted)',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  fontWeight: 700
                }}
              >
                {content.finalScreen.jansetu}
              </p>

              <p
                style={{
                  fontSize: 'clamp(15px, 4vw, 18px)',
                  color: 'var(--text-secondary)',
                  fontWeight: 500,
                  letterSpacing: '0.02em'
                }}
              >
                {content.finalScreen.notSelected}
              </p>

              <h2
                className="headline-lg animate-fade-in"
                style={{
                  fontSize: 'clamp(26px, 7vw, 34px)',
                  color: 'var(--color-accent)',
                  fontWeight: 900,
                  letterSpacing: '-0.01em',
                  marginTop: '4px'
                }}
              >
                {content.finalScreen.stillOurs}
              </h2>

              {userCompliment && (
                <div
                  className="animate-fade-in"
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px dashed rgba(255, 255, 255, 0.12)',
                    borderRadius: '14px',
                    padding: '8px 14px',
                    marginTop: '8px',
                    fontSize: '12.5px',
                    color: 'var(--text-muted)'
                  }}
                >
                  <span>Evidence on file: </span>
                  <span style={{ color: '#ffd166', fontStyle: 'italic' }}>
                    "{userCompliment}"
                  </span>
                </div>
              )}

              {showReplay && (
                <div
                  className="animate-fade-in"
                  style={{
                    marginTop: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                    width: '100%',
                    maxWidth: '240px'
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      audioManager.playClick();
                      onReplay();
                    }}
                    className="btn-primary variant-subtle"
                    style={{
                      padding: '12px 20px',
                      fontSize: '14px',
                      fontWeight: 600,
                      borderRadius: 'var(--radius-pill)',
                      width: '100%'
                    }}
                  >
                    {content.finalScreen.replayButton}
                  </button>

                  <p
                    style={{
                      fontSize: '11.5px',
                      color: 'var(--text-muted)',
                      letterSpacing: '0.02em',
                      opacity: 0.65,
                      marginTop: '4px'
                    }}
                  >
                    {content.finalScreen.footerNote}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </SceneContainer>
    </div>
  );
};
