import React, { useState, useRef } from 'react';
import { usePronunciationAnalysis } from '../hooks/usePronunciationAnalysis';
import { PronunciationWaveform } from './PronunciationWaveform';

interface PronunciationFeedbackProps {
  spanishPhrase: string;
  englishPhrase: string;
  onComplete: (score: number) => void;
  userId?: string;
  enableRealTimeAnalysis?: boolean;
}

interface PronunciationFeedback {
  overallScore: number;
  accuracy: number;
  fluency: number;
  pronunciation: number;
  transcription: string;
  tips: string[];
}

export const PronunciationFeedback: React.FC<PronunciationFeedbackProps> = ({
  spanishPhrase,
  englishPhrase,
  onComplete,
  userId = 'demo-user-123',
  enableRealTimeAnalysis = true
}) => {
  // Legacy recording state for backward compatibility
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<PronunciationFeedback | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Real-time pronunciation analysis
  const {
    isRecording: isRealTimeRecording,
    isAnalyzing: isRealTimeAnalyzing,
    isSupported,
    hasPermission,
    currentTranscript,
    analysisResult,
    error: realTimeError,
    audioLevel,
    startRecording: startRealTimeRecording,
    stopRecording: stopRealTimeRecording,
    clearResults,
    requestPermission
  } = usePronunciationAnalysis(userId);

  // Use real-time analysis if enabled and supported
  const shouldUseRealTime = enableRealTimeAnalysis && isSupported;
  const currentIsRecording = shouldUseRealTime ? isRealTimeRecording : isRecording;
  const currentIsAnalyzing = shouldUseRealTime ? isRealTimeAnalyzing : isAnalyzing;

  // Handle real-time analysis completion
  React.useEffect(() => {
    if (analysisResult && !isRealTimeRecording && !isRealTimeAnalyzing) {
      onComplete(analysisResult.overallScore);
    }
  }, [analysisResult, isRealTimeRecording, isRealTimeAnalyzing, onComplete]);

  const playExample = () => {
    const utterance = new SpeechSynthesisUtterance(spanishPhrase);
    utterance.lang = 'es-ES';
    utterance.rate = 0.8;
    speechSynthesis.speak(utterance);
  };

  const startRecording = async () => {
    if (shouldUseRealTime) {
      if (!hasPermission) {
        const granted = await requestPermission();
        if (!granted) {
          alert('Microphone permission is required for pronunciation analysis');
          return;
        }
      }
      await startRealTimeRecording(spanishPhrase);
    } else {
      // Legacy recording method
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.onstop = async () => {
          setIsAnalyzing(true);
          setTimeout(() => {
            const mockFeedback = generateMockFeedback(spanishPhrase);
            setFeedback(mockFeedback);
            setIsAnalyzing(false);
            onComplete(mockFeedback.overallScore);
          }, 2000);

          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
      } catch {
        alert('Could not access microphone');
      }
    }
  };

  const stopRecording = () => {
    if (shouldUseRealTime) {
      stopRealTimeRecording();
    } else if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Display results from either real-time or legacy analysis
  const currentFeedback = shouldUseRealTime ? analysisResult : feedback;
  const showError = shouldUseRealTime ? realTimeError : null;

  if (currentIsAnalyzing) {
    return (
      <div className="pronunciation-feedback analyzing glass-card">
        <div className="analyzing-view">
          <div className="themed-spinner big"></div>
          <h3>Analyzing your <span className="highlight">Accent</span></h3>
          <p>Running advanced phonic comparisons...</p>

          {shouldUseRealTime && (
            <div className="waveform-display">
              <PronunciationWaveform
                audioLevel={audioLevel}
                isRecording={false}
                width={200}
                height={40}
              />
            </div>
          )}
        </div>
        <style jsx>{styles}</style>
      </div>
    );
  }

  if (currentFeedback) {
    const score = currentFeedback.overallScore;

    return (
      <div className="pronunciation-feedback results glass-card">
        <header className="results-header">
          <div className="score-main">
            <div className="score-radial">
              <span className="score-text">{score}</span>
              <span className="score-sub">pts</span>
            </div>
            <div className="title-area">
              <h3>Pronunciation Score</h3>
              <p className="status-text">{score > 85 ? 'Excelente!' : score > 70 ? 'Muy bien!' : 'Sigue practicando!'}</p>
            </div>
          </div>
        </header>

        <div className="results-body">
          <div className="metric-bars">
            {['Accuracy', 'Fluency', 'Enunciation'].map((label, idx) => {
              const value = idx === 0 ? currentFeedback.accuracy :
                idx === 1 ? currentFeedback.fluency :
                  currentFeedback.pronunciation;
              return (
                <div key={label} className="metric-row">
                  <div className="metric-header">
                    <span className="metric-label">{label}</span>
                    <span className="metric-value">{value}%</span>
                  </div>
                  <div className="metric-track">
                    <div className="metric-fill" style={{ width: `${value}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="tips-section">
            <h4>💡 Refinement Tips</h4>
            <ul className="tips-list">
              {(() => {
                const tips = 'tips' in currentFeedback ? currentFeedback.tips : currentFeedback.feedback.specificTips;
                return tips.map((tip, index) => (
                  <li key={index} className="tip-item">
                    <span className="tip-bullet">•</span>
                    <span className="tip-text">{tip}</span>
                  </li>
                ));
              })()}
            </ul>
          </div>
        </div>

        <div className="results-footer">
          <button onClick={clearResults || (() => setFeedback(null))} className="secondary-btn">
            Try Again
          </button>
        </div>
        <style jsx>{styles}</style>
      </div>
    );
  }

  return (
    <div className="pronunciation-feedback glass-card fade-in">
      <div className="practice-header">
        <span className="badge-pill">Accent Tool</span>
        <h3>Mirror Your Pronunciation</h3>
        <p>Record the Spanish phrase below to receive your AI score.</p>
        {showError && (
          <div className="error-banner">
            <p>⚠️ {showError}</p>
          </div>
        )}
      </div>

      <div className="phrase-highlight glass-card">
        <div className="spanish-text-group">
          <span className="label">Target Phrase</span>
          <p className="spanish-text">{spanishPhrase}</p>
          <button onClick={playExample} className="audio-play-btn">
            🔊 Play Guide
          </button>
        </div>
      </div>

      <div className="interaction-zone">
        {shouldUseRealTime && (
          <div className="waveform-box">
            <PronunciationWaveform
              audioLevel={audioLevel}
              isRecording={currentIsRecording}
              width={200}
              height={60}
            />
          </div>
        )}

        <div className="control-center">
          {!currentIsRecording ? (
            <button onClick={startRecording} className="record-action start">
              <span className="dot"></span> Start Practice
            </button>
          ) : (
            <button onClick={stopRecording} className="record-action stop">
              <span className="square"></span> Stop & Analyze
            </button>
          )}
        </div>
      </div>

      <style jsx>{styles}</style>
    </div>
  );
};

function generateMockFeedback(spanishPhrase: string): PronunciationFeedback {
  const baseScore = 70 + Math.random() * 25;
  return {
    overallScore: Math.round(baseScore),
    accuracy: Math.round(baseScore + Math.random() * 10 - 5),
    fluency: Math.round(baseScore + Math.random() * 10 - 5),
    pronunciation: Math.round(baseScore + Math.random() * 10 - 5),
    transcription: spanishPhrase,
    tips: [
      "Improve emphasis on the middle syllables",
      "Vowel sounds could be slightly sharper",
      "Great rhythm overall, keep it up!"
    ]
  };
}

const styles = `
  .pronunciation-feedback {
    padding: var(--space-xl);
    text-align: center;
  }

  .highlight {
    background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .analyzing-view {
      padding: var(--space-xl) 0;
  }

  .themed-spinner.big { width: 60px; height: 60px; border-width: 4px; border-top-color: var(--primary); margin: 0 auto var(--space-lg); }

  .waveform-display { margin-top: var(--space-lg); opacity: 0.6; }

  .results-header {
      border-bottom: 1px solid var(--border-glass);
      padding-bottom: var(--space-lg);
      margin-bottom: var(--space-lg);
  }

  .score-main {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-xl);
      text-align: left;
  }

  .score-radial {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      border: 4px solid var(--accent);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: rgba(16, 185, 129, 0.05);
      box-shadow: 0 0 20px rgba(16, 185, 129, 0.2);
  }

  .score-text { font-size: 2.5rem; font-weight: 900; line-height: 1; color: var(--accent); }
  .score-sub { font-size: 0.8rem; text-transform: uppercase; font-weight: 700; opacity: 0.7; }

  .status-text { color: var(--text-secondary); font-weight: 600; margin-top: 0.2rem; }

  .results-body {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-xl);
      text-align: left;
  }

  @media (max-width: 600px) {
      .results-body { grid-template-columns: 1fr; }
      .score-main { flex-direction: column; text-align: center; }
  }

  .metric-row { margin-bottom: var(--space-md); }
  .metric-header { display: flex; justify-content: space-between; margin-bottom: 0.4rem; font-weight: 700; font-size: 0.9rem; }
  .metric-label { color: var(--text-secondary); }
  .metric-track { height: 6px; background: rgba(255, 255, 255, 0.05); border-radius: var(--radius-full); overflow: hidden; }
  .metric-fill { height: 100%; background: var(--secondary); border-radius: var(--radius-full); }

  .tips-section h4 { font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-secondary); margin-bottom: var(--space-md); }
  .tips-list { list-style: none; padding: 0; }
  .tip-item { display: flex; gap: 0.75rem; margin-bottom: 0.6rem; line-height: 1.4; color: var(--text-primary); font-size: 0.95rem; }
  .tip-bullet { color: var(--accent); font-weight: 900; }

  .results-footer { margin-top: var(--space-xl); }

  .badge-pill {
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

  .phrase-highlight {
      margin: var(--space-xl) 0;
      background: rgba(0, 0, 0, 0.2) !important;
      padding: var(--space-lg) !important;
  }

  .label { font-size: 0.75rem; text-transform: uppercase; color: var(--text-secondary); font-weight: 800; display: block; margin-bottom: 0.75rem; }
  .spanish-text { font-size: 1.8rem; font-weight: 700; color: var(--text-primary); margin: 0.5rem 0; }

  .audio-play-btn {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border-glass);
      color: var(--text-primary);
      padding: 0.4rem 1rem;
      border-radius: var(--radius-sm);
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      margin-top: var(--space-md);
      transition: all 0.2s;
  }
  .audio-play-btn:hover { background: rgba(255, 255, 255, 0.1); }

  .interaction-zone {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-xl);
  }

  .record-action {
      padding: 1rem 2.5rem;
      border-radius: var(--radius-full);
      border: none;
      font-weight: 800;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 1.1rem;
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .record-action.start {
      background: var(--accent);
      color: white;
  }
  .record-action.stop {
      background: var(--danger);
      color: white;
      animation: pulse-danger 2s infinite;
  }

  .dot { width: 10px; height: 10px; background: white; border-radius: 50%; }
  .square { width: 10px; height: 10px; background: white; }

  @keyframes pulse-danger {
      0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
      70% { box-shadow: 0 0 0 15px rgba(239, 68, 68, 0); }
      100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
  }

  .error-banner {
      background: rgba(239, 68, 68, 0.1);
      color: var(--danger);
      padding: 0.75rem;
      border-radius: var(--radius-md);
      margin-top: var(--space-md);
      font-size: 0.9rem;
      font-weight: 600;
  }
`;
