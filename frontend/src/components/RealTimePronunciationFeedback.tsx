import React, { useState, useEffect } from 'react';
import { usePronunciationAnalysis } from '../hooks/usePronunciationAnalysis';
import { PronunciationWaveform } from './PronunciationWaveform';
import { optimizeForBrowser } from '../utils/speechRecognitionUtils';

interface RealTimePronunciationFeedbackProps {
  targetPhrase: string;
  englishPhrase: string;
  userId: string;
  onComplete?: (score: number) => void;
  onClose?: () => void;
}

export const RealTimePronunciationFeedback: React.FC<RealTimePronunciationFeedbackProps> = ({
  targetPhrase,
  englishPhrase,
  userId,
  onComplete,
  onClose
}) => {
  const [sessionStarted, setSessionStarted] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [bestScore, setBestScore] = useState(0);

  const {
    isRecording,
    isAnalyzing,
    isSupported,
    hasPermission,
    currentTranscript,
    analysisResult,
    error,
    audioLevel,
    startRecording,
    stopRecording,
    clearResults,
    requestPermission
  } = usePronunciationAnalysis(userId);

  const browserInfo = optimizeForBrowser();

  useEffect(() => {
    if (analysisResult && !isRecording && !isAnalyzing) {
      setAttempts(prev => prev + 1);
      if (analysisResult.overallScore > bestScore) {
        setBestScore(analysisResult.overallScore);
      }
      if (onComplete) {
        onComplete(analysisResult.overallScore);
      }
    }
  }, [analysisResult, isRecording, isAnalyzing, bestScore, onComplete]);

  const handleStartSession = async () => {
    if (!hasPermission) {
      const granted = await requestPermission();
      if (!granted) return;
    }
    setSessionStarted(true);
    clearResults();
  };

  const handleStartRecording = async () => {
    await startRecording(targetPhrase);
  };

  const handleTryAgain = () => {
    clearResults();
  };

  const playExample = () => {
    const utterance = new SpeechSynthesisUtterance(targetPhrase);
    utterance.lang = 'es-ES';
    utterance.rate = 0.8;
    speechSynthesis.speak(utterance);
  };

  if (!isSupported) {
    return (
      <div className="feedback-module unsupported fade-in">
        <div className="glass-card error-container">
          <header className="module-header">
            <span className="badge-pill danger">Compatibility Issue</span>
            <h3>Neural Synthesis Unavailable</h3>
            <p>Your current environment does not support real-time audio analysis.</p>
          </header>

          <div className="recommendation-box glass-card">
            <h4>Recommended Hardware/Software:</h4>
            <ul className="compat-list">
              <li><span className="icon">✅</span> Google Chrome <small>(Premium Support)</small></li>
              <li><span className="icon">⚠️</span> Microsoft Edge <small>(Standard Support)</small></li>
              <li><span className="icon">❌</span> Mobile Environments <small>(Limited API)</small></li>
            </ul>
          </div>

          {onClose && (
            <button onClick={onClose} className="secondary-btn">
              Return to Safe Mode
            </button>
          )}
        </div>
        <style jsx>{styles}</style>
      </div>
    );
  }

  if (!sessionStarted) {
    return (
      <div className="feedback-module setup fade-in">
        <div className="glass-card setup-card">
          <header className="module-header">
            <span className="badge-pill">Voice Engine 2.0</span>
            <h3>Acoustic Calibration</h3>
            <p>Sync your voice with our neural model for instant phonic feedback.</p>
          </header>

          <div className="phrase-calibration-grid">
            <div className="context-card glass-card">
              <span className="card-label">Original Thought</span>
              <p className="context-text">{englishPhrase}</p>
            </div>
            <div className="context-card glass-card target">
              <span className="card-label">Target Syntax</span>
              <p className="context-text spanish">{targetPhrase}</p>
              <button onClick={playExample} className="audio-trigger-btn">
                🔊 Hear Archetype
              </button>
            </div>
          </div>

          <footer className="setup-footer">
            {!hasPermission ? (
              <button onClick={requestPermission} className="primary-btn pulse">
                Grant Acoustic Access
              </button>
            ) : (
              <button onClick={handleStartSession} className="primary-btn">
                Initialize Voice Stream
              </button>
            )}
            {onClose && (
              <button onClick={onClose} className="text-btn">
                Cancel Session
              </button>
            )}
          </footer>
        </div>
        <style jsx>{styles}</style>
      </div>
    );
  }

  return (
    <div className="feedback-module active fade-in">
      <div className="glass-card active-session-container">
        <header className="session-meta">
          <div className="meta-left">
            <span className="status-dot"></span>
            <span className="session-title">Live Analysis</span>
          </div>
          <div className="stats-indicator">
            <span className="stat-tag">Attempts: <strong>{attempts}</strong></span>
            {bestScore > 0 && <span className="stat-tag best">High Orbit Score: <strong>{bestScore}</strong></span>}
          </div>
        </header>

        <section className="vocal-target glass-card">
          <div className="target-info">
            <span className="tiny-label">Enunciate clearly</span>
            <h2 className="focus-phrase">{targetPhrase}</h2>
          </div>
          <button onClick={playExample} className="mini-audio-btn">🔊</button>
        </section>

        <section className="wave-monitor glass-card">
          <PronunciationWaveform
            audioLevel={audioLevel}
            isRecording={isRecording}
            width={500}
            height={120}
          />

          {currentTranscript && (
            <div className="real-time-subtitles fade-in">
              <span className="sub-label">Interpreted:</span>
              <p className="sub-text">"{currentTranscript}"</p>
            </div>
          )}

          {error && (
            <div className="stream-error fade-in">
              <span className="error-icon">⚠️</span>
              <p>{error}</p>
            </div>
          )}
        </section>

        <footer className="vocal-controls">
          {!isRecording && !isAnalyzing ? (
            <button onClick={handleStartRecording} className="record-trigger start">
              <span className="trigger-icon">🎤</span>
              Capture Vocal Profile
            </button>
          ) : isRecording ? (
            <button onClick={stopRecording} className="record-trigger stop">
              <span className="trigger-icon">⏹️</span>
              Process Batch
            </button>
          ) : (
            <div className="processing-state glass-card">
              <div className="themed-spinner mini"></div>
              <span>Scanning Phonetic Dissonance...</span>
            </div>
          )}
        </footer>

        {analysisResult && (
          <div className="analysis-exposure fade-in">
            <div className="score-hero">
              <div className="orbital-score">
                <span className="val">{analysisResult.overallScore}</span>
                <span className="unit">/100</span>
              </div>
              <div className="vector-metrics">
                {['Accuracy', 'Fluency', 'Prosody'].map((m) => {
                  const val = m === 'Accuracy' ? analysisResult.accuracy :
                    m === 'Fluency' ? analysisResult.fluency :
                      analysisResult.pronunciation;
                  return (
                    <div key={m} className="vector-row">
                      <span className="v-label">{m}</span>
                      <div className="v-bar-bg"><div className="v-fill" style={{ width: `${val}%` }}></div></div>
                      <span className="v-val">{val}%</span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="feedback-triptych">
              <div className="t-card glass-card positive">
                <h6>Linguistic Wins</h6>
                <ul className="t-list">
                  {analysisResult.feedback.strengths.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
              <div className="t-card glass-card guidance">
                <h6>Areas for Calibration</h6>
                <ul className="t-list">
                  {analysisResult.feedback.improvements.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
              <div className="t-card glass-card tips">
                <h6>Neural Tips</h6>
                <ul className="t-list">
                  {analysisResult.feedback.specificTips.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            </div>

            <div className="exposure-actions">
              <button onClick={handleTryAgain} className="secondary-btn">Recalibrate Voice</button>
              {onClose && <button onClick={onClose} className="primary-btn">Mission Complete</button>}
            </div>
          </div>
        )}
      </div>
      <style jsx>{styles}</style>
    </div>
  );
};

const styles = `
    .feedback-module { max-width: 800px; margin: 0 auto; }
    .glass-card { padding: var(--space-xl) !important; }

    .module-header { text-align: center; margin-bottom: var(--space-xl); }
    .module-header h3 { font-size: 2rem; margin: var(--space-md) 0; color: var(--text-primary); }
    .module-header p { color: var(--text-secondary); opacity: 0.7; }

    .badge-pill {
        display: inline-block;
        background: rgba(99, 102, 241, 0.1);
        color: var(--primary);
        padding: 0.2rem 0.8rem;
        border-radius: var(--radius-full);
        font-size: 0.7rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        border: 1px solid rgba(99, 102, 241, 0.2);
    }
    .badge-pill.danger { background: rgba(239, 68, 68, 0.1); color: var(--danger); border-color: rgba(239, 68, 68, 0.2); }

    /* Setup State */
    .phrase-calibration-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-lg); margin-bottom: var(--space-xl); }
    .context-card { background: rgba(0,0,0,0.2) !important; display: flex; flex-direction: column; gap: var(--space-sm); }
    .context-card.target { border-color: var(--accent) !important; background: rgba(16, 185, 129, 0.05) !important; }
    .card-label { font-size: 0.7rem; font-weight: 800; color: var(--text-secondary); text-transform: uppercase; }
    .context-text { font-size: 1.1rem; font-weight: 600; color: var(--text-primary); }
    .context-text.spanish { font-size: 1.4rem; color: var(--accent); }

    .audio-trigger-btn { align-self: flex-start; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); color: var(--accent); padding: 0.4rem 0.8rem; border-radius: var(--radius-md); font-size: 0.8rem; cursor: pointer; transition: all 0.2s; font-weight: 700; }
    .audio-trigger-btn:hover { background: var(--accent); color: white; }

    .setup-footer { display: flex; flex-direction: column; align-items: center; gap: var(--space-md); }
    .text-btn { background: none; border: none; color: var(--text-secondary); cursor: pointer; font-weight: 700; font-size: 0.9rem; }

    /* Active State */
    .active-session-container { padding: 0 !important; overflow: hidden; }
    .session-meta { padding: var(--space-lg) var(--space-xl); background: rgba(255, 255, 255, 0.02); border-bottom: 1px solid var(--border-glass); display: flex; justify-content: space-between; align-items: center; }
    .meta-left { display: flex; align-items: center; gap: 0.75rem; }
    .status-dot { width: 8px; height: 8px; background: var(--danger); border-radius: 50%; box-shadow: 0 0 10px var(--danger); animation: pulse 2s infinite; }
    .session-title { font-weight: 800; text-transform: uppercase; font-size: 0.75rem; color: var(--text-secondary); }
    .stat-tag { font-size: 0.8rem; color: var(--text-secondary); padding: 0.3rem 0.7rem; background: rgba(255, 255, 255, 0.05); border-radius: var(--radius-sm); margin-left: 0.5rem; }
    .stat-tag.best { border: 1px solid var(--accent); color: var(--accent); }

    .vocal-target { margin: var(--space-xl); background: rgba(0,0,0,0.3) !important; display: flex; justify-content: space-between; align-items: center; border: 1px solid var(--border-glass) !important; }
    .tiny-label { font-size: 0.65rem; text-transform: uppercase; font-weight: 800; color: var(--primary); opacity: 0.8; }
    .focus-phrase { font-size: 2rem; color: var(--text-primary); margin: 0.2rem 0 0 0; }
    .mini-audio-btn { width: 50px; height: 50px; background: var(--primary); border: none; border-radius: 50%; color: white; font-size: 1.2rem; cursor: pointer; transition: all 0.2s; }
    .mini-audio-btn:hover { transform: scale(1.1); box-shadow: 0 0 20px rgba(99, 102, 241, 0.4); }

    .wave-monitor { margin: 0 var(--space-xl) var(--space-xl); background: rgba(0,0,0,0.2) !important; text-align: center; }
    .real-time-subtitles { margin-top: var(--space-md); padding: var(--space-md); background: rgba(99, 102, 241, 0.05); border-radius: var(--radius-md); text-align: left; border-left: 3px solid var(--primary); }
    .sub-label { font-size: 0.65rem; font-weight: 800; color: var(--primary); text-transform: uppercase; }
    .sub-text { margin: 0.2rem 0 0 0; font-size: 1.1rem; color: var(--text-primary); font-style: italic; }

    .stream-error { margin-top: var(--space-md); padding: var(--space-md); background: rgba(239, 68, 68, 0.1); color: var(--danger); border-radius: var(--radius-md); border-left: 3px solid var(--danger); display: flex; items: center; gap: 0.5rem; }

    .vocal-controls { text-align: center; margin-bottom: var(--space-xl); }
    .record-trigger { padding: 1rem 3rem; border-radius: var(--radius-full); border: none; font-size: 1.2rem; font-weight: 800; color: white; cursor: pointer; display: flex; align-items: center; gap: 1rem; margin: 0 auto; transition: all 0.2s; }
    .record-trigger.start { background: var(--primary); box-shadow: 0 10px 30px rgba(99, 102, 241, 0.3); }
    .record-trigger.stop { background: var(--danger); animation: pulse-red 2s infinite; }
    .trigger-icon { font-size: 1.5rem; }
    .record-trigger:hover { transform: translateY(-4px); }

    .processing-state { display: flex; align-items: center; justify-content: center; gap: 1rem; width: fit-content; margin: 0 auto; padding: 0.8rem 2rem !important; }

    /* Analysis View */
    .analysis-exposure { padding: var(--space-xl); background: rgba(0,0,0,0.2); border-top: 1px solid var(--border-glass); }
    .score-hero { display: grid; grid-template-columns: auto 1fr; gap: var(--space-xl); align-items: center; margin-bottom: var(--space-xl); }
    .orbital-score { width: 120px; height: 120px; border-radius: 50%; border: 4px solid var(--accent); display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(16, 185, 129, 0.05); }
    .orbital-score .val { font-size: 3rem; font-weight: 900; color: var(--text-primary); line-height: 1; }
    .orbital-score .unit { font-size: 0.9rem; color: var(--text-secondary); font-weight: 800; }

    .vector-metrics { display: flex; flex-direction: column; gap: 0.75rem; }
    .vector-row { display: grid; grid-template-columns: 80px 1fr 40px; align-items: center; gap: 1rem; }
    .v-label { font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); }
    .v-bar-bg { height: 6px; background: rgba(255,255,255,0.05); border-radius: 3px; overflow: hidden; }
    .v-fill { height: 100%; background: var(--accent); border-radius: 3px; }
    .v-val { font-size: 0.8rem; font-weight: 800; color: var(--text-primary); text-align: right; }

    .feedback-triptych { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-md); margin-bottom: var(--space-xl); }
    .t-card { padding: var(--space-md) !important; background: rgba(255,255,255,0.02) !important; display: flex; flex-direction: column; gap: 0.5rem; }
    .t-card h6 { margin: 0; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; }
    .t-card.positive { border-top: 3px solid var(--accent) !important; }
    .t-card.guidance { border-top: 3px solid var(--warning) !important; }
    .t-card.tips { border-top: 3px solid var(--primary) !important; }
    .t-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.4rem; }
    .t-list li { font-size: 0.85rem; color: var(--text-secondary); line-height: 1.4; padding-left: 1rem; position: relative; }
    .t-list li::before { content: '→'; position: absolute; left: 0; color: var(--primary); opacity: 0.6; }

    .exposure-actions { display: flex; justify-content: center; gap: var(--space-md); }

    @keyframes pulse-red { 0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); } 70% { box-shadow: 0 0 0 15px rgba(239, 68, 68, 0); } 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); } }
    @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }

    @media (max-width: 700px) {
        .phrase-calibration-grid, .feedback-triptych, .score-hero { grid-template-columns: 1fr; }
        .orbital-score { margin: 0 auto; }
    }
`;
