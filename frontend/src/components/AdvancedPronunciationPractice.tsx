import React, { useState } from 'react';
import { AccentSelector, SpanishAccent } from './AccentSelector';
import { usePronunciationAnalysis } from '../hooks/usePronunciationAnalysis';
import { PronunciationWaveform } from './PronunciationWaveform';

interface AdvancedPronunciationPracticeProps {
  targetPhrase: string;
  onClose?: () => void;
}

export const AdvancedPronunciationPractice: React.FC<AdvancedPronunciationPracticeProps> = ({
  targetPhrase,
  onClose
}) => {
  const [selectedAccent, setSelectedAccent] = useState<SpanishAccent>(SpanishAccent.NEUTRAL);
  const [showAccentSelector, setShowAccentSelector] = useState(true);

  const {
    isRecording,
    isAnalyzing,
    analysisResult,
    error,
    audioLevel,
    startRecording,
    stopRecording,
    clearResults
  } = usePronunciationAnalysis('demo-user');

  const handleStartRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording(targetPhrase, selectedAccent);
    }
  };

  const handleAccentChange = (accent: SpanishAccent) => {
    setSelectedAccent(accent);
    clearResults();
  };

  const accentName = selectedAccent === SpanishAccent.NEUTRAL ? 'Neutral' :
    selectedAccent === SpanishAccent.MEXICO ? 'Mexican' :
      selectedAccent === SpanishAccent.SPAIN ? 'Spanish' :
        selectedAccent === SpanishAccent.ARGENTINA ? 'Argentinian' : 'Colombian';

  const accentEmoji = selectedAccent === SpanishAccent.NEUTRAL ? '🌍' :
    selectedAccent === SpanishAccent.MEXICO ? '🇲🇽' :
      selectedAccent === SpanishAccent.SPAIN ? '🇪🇸' :
        selectedAccent === SpanishAccent.ARGENTINA ? '🇦🇷' : '🇨🇴';

  return (
    <div className="advanced-practice-module fade-in">
      <div className="glass-card main-container">
        <header className="practice-header">
          <div className="title-stack">
            <span className="badge-pill">Acoustic Lab</span>
            <h2>Phonetic Precision</h2>
          </div>
          {onClose && (
            <button onClick={onClose} className="close-trigger">✕</button>
          )}
        </header>

        <section className="target-phrase-exposure glass-card">
          <span className="tiny-label">Enunciation Target</span>
          <p className="focus-text">"{targetPhrase}"</p>
        </section>

        {showAccentSelector ? (
          <div className="accent-discovery-view fade-in">
            <AccentSelector
              selectedAccent={selectedAccent}
              onAccentChange={handleAccentChange}
              showDetails={true}
            />
            <button
              onClick={() => setShowAccentSelector(false)}
              className="primary-btn continue-btn"
            >
              Calibrate to {accentName} Spanish
            </button>
          </div>
        ) : (
          <div className="active-lab-view fade-in">
            <div className="lab-config-bar">
              <div className="config-item">
                <span className="emoji-v">{accentEmoji}</span>
                <span className="v-label">{accentName} Spanish Mode</span>
              </div>
              <button
                onClick={() => setShowAccentSelector(true)}
                className="text-link-btn"
              >
                Switch Dialect
              </button>
            </div>

            <div className="recording-deck glass-card">
              <p className="deck-instruction">Mirror the native cadence of your selected region.</p>

              <div className="waveform-wrapper">
                <PronunciationWaveform
                  audioLevel={audioLevel}
                  isRecording={isRecording}
                  height={100}
                />
              </div>

              <div className="deck-controls">
                {!isAnalyzing ? (
                  <button
                    onClick={handleStartRecording}
                    className={`record-trigger ${isRecording ? 'stop' : 'start'}`}
                  >
                    {isRecording ? (
                      <><span className="icon">⏹️</span> End Capture</>
                    ) : (
                      <><span className="icon">🎤</span> Start Acquisition</>
                    )}
                  </button>
                ) : (
                  <div className="lab-processing glass-card">
                    <div className="themed-spinner mini"></div>
                    <span>Deconstructing Audio Waves...</span>
                  </div>
                )}
              </div>

              {error && (
                <div className="lab-error fade-in">
                  <span className="icon">⚠️</span>
                  <p>{error}</p>
                </div>
              )}
            </div>

            {analysisResult && (
              <div className="analysis-summary-view fade-in">
                <header className="summary-header">
                  <h4>Vector Analysis</h4>
                </header>

                <div className="metric-grid">
                  {[
                    { label: 'Overall', val: analysisResult.overallScore, color: 'var(--accent)' },
                    { label: 'Accuracy', val: analysisResult.accuracy, color: 'var(--primary)' },
                    { label: 'Fluency', val: analysisResult.fluency, color: 'var(--warning)' }
                  ].map((m) => (
                    <div key={m.label} className="metric-card glass-card">
                      <span className="m-val">{m.val}%</span>
                      <span className="m-label">{m.label}</span>
                      <div className="m-bar-bg">
                        <div className="m-fill" style={{ width: `${m.val}%`, backgroundColor: m.color }}></div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="feedback-triptych">
                  <div className="f-card glass-card pos">
                    <h6>Linguistic Gains</h6>
                    <ul className="f-list">
                      {analysisResult.feedback.strengths.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                  <div className="f-card glass-card imp">
                    <h6>Calibration Points</h6>
                    <ul className="f-list">
                      {analysisResult.feedback.improvements.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                  <div className="f-card glass-card tip">
                    <h6>Native Insight</h6>
                    <ul className="f-list">
                      {analysisResult.feedback.specificTips.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                </div>

                <footer className="summary-footer">
                  <button onClick={clearResults} className="secondary-btn">New Attempt</button>
                  <button onClick={() => setShowAccentSelector(true)} className="primary-btn">Explore Other Accents</button>
                </footer>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{styles}</style>
    </div>
  );
};

const styles = `
    .advanced-practice-module { max-width: 900px; margin: 2rem auto; }
    .main-container { padding: 0 !important; overflow: hidden; }

    .practice-header { padding: var(--space-xl); display: flex; justify-content: space-between; align-items: flex-start; background: rgba(255,255,255,0.02); border-bottom: 1px solid var(--border-glass); }
    .badge-pill { display: inline-block; background: rgba(99, 102, 241, 0.1); color: var(--primary); padding: 0.2rem 0.8rem; border-radius: var(--radius-full); font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; border: 1px solid rgba(99, 102, 241, 0.2); margin-bottom: 0.5rem; }
    .practice-header h2 { font-size: 2rem; margin: 0; color: var(--text-primary); }

    .close-trigger { background: rgba(255,255,255,0.05); border: 1px solid var(--border-glass); color: var(--text-secondary); width: 40px; height: 40px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
    .close-trigger:hover { background: var(--danger); color: white; border-color: var(--danger); }

    .target-phrase-exposure { margin: var(--space-xl); background: rgba(0,0,0,0.3) !important; border: 1px solid var(--border-glass) !important; text-align: center; }
    .tiny-label { font-size: 0.65rem; text-transform: uppercase; font-weight: 800; color: var(--primary); opacity: 0.8; }
    .focus-text { font-size: 2rem; color: var(--text-primary); font-weight: 700; margin: 0.5rem 0 0 0; }

    .accent-discovery-view { padding: 0 var(--space-xl) var(--space-xl); }
    .continue-btn { width: 100%; margin-top: var(--space-xl); padding: 1.2rem; font-size: 1.1rem; }

    .active-lab-view { padding: 0 var(--space-xl) var(--space-xl); }
    .lab-config-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-lg); padding: 0.8rem 1.2rem; background: rgba(16, 185, 129, 0.1); border-radius: var(--radius-md); border: 1px solid rgba(16, 185, 129, 0.2); }
    .config-item { display: flex; align-items: center; gap: 0.75rem; }
    .emoji-v { font-size: 1.2rem; }
    .v-label { font-size: 0.9rem; font-weight: 700; color: var(--accent); }
    .text-link-btn { background: none; border: none; color: var(--text-secondary); font-size: 0.8rem; font-weight: 700; cursor: pointer; text-decoration: underline; }

    .recording-deck { text-align: center; padding: var(--space-xl) !important; background: rgba(0,0,0,0.2) !important; margin-bottom: var(--space-xl); }
    .deck-instruction { color: var(--text-secondary); margin-bottom: var(--space-xl); font-size: 1rem; }
    .waveform-wrapper { margin-bottom: var(--space-xl); min-height: 100px; display: flex; align-items: center; justify-content: center; }

    .record-trigger { padding: 1rem 3rem; border-radius: var(--radius-full); border: none; font-size: 1.2rem; font-weight: 800; color: white; cursor: pointer; display: flex; align-items: center; gap: 1rem; margin: 0 auto; transition: all 0.2s; }
    .record-trigger.start { background: var(--primary); box-shadow: 0 10px 30px rgba(99, 102, 241, 0.3); }
    .record-trigger.stop { background: var(--danger); animation: lab-pulse 2s infinite; }
    .record-trigger:hover { transform: translateY(-4px); }

    .lab-processing { display: flex; align-items: center; gap: 1rem; width: fit-content; margin: 0 auto; padding: 0.8rem 2rem !important; }
    .lab-error { margin-top: var(--space-lg); padding: var(--space-md); background: rgba(239, 68, 68, 0.1); color: var(--danger); border-radius: var(--radius-md); border-left: 3px solid var(--danger); display: flex; items: center; gap: 0.5rem; justify-content: center; }

    /* Analysis Summary */
    .summary-header { margin-bottom: var(--space-lg); text-align: center; }
    .summary-header h4 { font-size: 1.4rem; color: var(--text-primary); margin: 0; }

    .metric-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-lg); margin-bottom: var(--space-xl); }
    .metric-card { text-align: center; padding: var(--space-lg) !important; }
    .m-val { font-size: 2.2rem; font-weight: 900; color: var(--text-primary); display: block; }
    .m-label { font-size: 0.75rem; font-weight: 800; color: var(--text-secondary); text-transform: uppercase; margin-bottom: 0.8rem; display: block; }
    .m-bar-bg { height: 4px; background: rgba(255,255,255,0.05); border-radius: 2px; overflow: hidden; }
    .m-fill { height: 100%; border-radius: 2px; }

    .feedback-triptych { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-md); margin-bottom: var(--space-xl); }
    .f-card { padding: var(--space-md) !important; background: rgba(255,255,255,0.02) !important; }
    .f-card h6 { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: var(--text-primary); margin: 0 0 0.8rem 0; }
    .f-card.pos { border-top: 3px solid var(--accent) !important; }
    .f-card.imp { border-top: 3px solid var(--warning) !important; }
    .f-card.tip { border-top: 3px solid var(--primary) !important; }
    
    .f-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.5rem; }
    .f-list li { font-size: 0.85rem; color: var(--text-secondary); line-height: 1.4; padding-left: 1rem; position: relative; }
    .f-list li::before { content: '→'; position: absolute; left: 0; color: var(--primary); opacity: 0.5; }

    .summary-footer { display: flex; justify-content: center; gap: var(--space-md); }

    @keyframes lab-pulse { 0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); } 70% { box-shadow: 0 0 0 15px rgba(239, 68, 68, 0); } 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); } }

    @media (max-width: 800px) {
        .metric-grid, .feedback-triptych, .summary-footer { grid-template-columns: 1fr; flex-direction: column; }
    }
`;
