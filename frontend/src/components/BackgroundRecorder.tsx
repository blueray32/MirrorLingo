import React, { useState, useRef, useCallback, useEffect } from 'react';
import { usePhrasesApi } from '../hooks/usePhrasesApi';

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message?: string;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

interface BackgroundRecorderProps {
  userId: string;
  onPhraseDetected: (phrase: string, confidence: number) => void;
  onAnalysisComplete?: (data: { phrases: import('../types/phrases').Phrase[], profile: import('../types/phrases').IdiolectProfile }) => void;
  isActive: boolean;
}

export const BackgroundRecorder: React.FC<BackgroundRecorderProps> = ({
  userId,
  onPhraseDetected,
  onAnalysisComplete,
  isActive
}) => {
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState<'ready' | 'initializing' | 'listening' | 'error' | 'reconnecting'>('ready');
  const [error, setError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [detectedPhrases, setDetectedPhrases] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { submitPhrases, isLoading } = usePhrasesApi(userId);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const speechRecognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingPhrasesRef = useRef<string[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const isListeningRef = useRef(false);
  const isActiveRef = useRef(isActive);
  const retryCountRef = useRef(0);
  const MAX_RETRIES = 3;

  // Keep ref in sync with prop
  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  const SILENCE_THRESHOLD = 0.01;
  const AUTO_SAVE_DELAY = 5000; // Auto-save 5 seconds after last phrase

  // Auto-save function - doesn't call onAnalysisComplete to keep recording
  const autoSavePhrases = useCallback(async (phrases: string[], triggerComplete = false) => {
    if (phrases.length === 0 || isLoading) return;
    setIsAnalyzing(true);
    try {
      const result = await submitPhrases(phrases);
      if (result && triggerComplete && onAnalysisComplete) {
        onAnalysisComplete(result);
      }
      pendingPhrasesRef.current = []; // Clear pending after successful save
    } finally {
      setIsAnalyzing(false);
    }
  }, [submitPhrases, onAnalysisComplete, isLoading]);

  // Schedule auto-save when new phrase detected
  const scheduleAutoSave = useCallback((newPhrase: string) => {
    // Add to pending
    if (!pendingPhrasesRef.current.includes(newPhrase)) {
      pendingPhrasesRef.current.push(newPhrase);
    }
    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    // Schedule new auto-save
    autoSaveTimerRef.current = setTimeout(() => {
      autoSavePhrases(pendingPhrasesRef.current);
    }, AUTO_SAVE_DELAY);
  }, [autoSavePhrases]);

  const initSpeechRecognition = useCallback((): SpeechRecognitionInstance | null => {
    const SpeechRecognitionConstructor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionConstructor) {
      console.error('[BackgroundRecorder] SpeechRecognition not supported in this browser');
      return null;
    }

    console.log('[BackgroundRecorder] Initializing SpeechRecognition...');
    const recognition: SpeechRecognitionInstance = new SpeechRecognitionConstructor();
    recognition.continuous = true;
    recognition.interimResults = true; // Enabled interim results for debugging
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      console.log('[BackgroundRecorder] Speech recognition service has started');
      setStatus('listening');
      retryCountRef.current = 0; // Reset retries on successful start
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          const transcript = event.results[i][0].transcript.trim();
          const confidence = event.results[i][0].confidence;

          console.log('[BackgroundRecorder] Final transcript:', transcript, 'Confidence:', confidence);

          // Relaxed criteria for detection to be more responsive
          if (transcript.split(' ').length >= 2 && transcript.length > 5) {
            console.log('[BackgroundRecorder] Valid phrase detected:', transcript);
            setDetectedPhrases(prev => {
              if (prev.includes(transcript)) return prev;
              return [...prev, transcript].slice(-20);
            });
            onPhraseDetected(transcript, confidence);
            scheduleAutoSave(transcript);
          } else if (transcript.length > 0) {
            console.log('[BackgroundRecorder] Ignored short/invalid phrase:', transcript);
          }
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (interimTranscript) {
        // Log interim transcript to see it's working
        console.log('[BackgroundRecorder] Interim:', interimTranscript);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('[BackgroundRecorder] Speech recognition error:', event.error, event.message);

      if (event.error === 'not-allowed') {
        setError('Browser blocked microphone access. Check your address bar permissions.');
        setStatus('error');
        isListeningRef.current = false;
        setIsListening(false);
      } else if (event.error === 'no-speech') {
        console.log('[BackgroundRecorder] No speech detected - keeping session alive');
      } else if (event.error === 'audio-capture') {
        setError('Microphone hardware not accessible. Is it plugged in?');
        setStatus('error');
      } else {
        setError(`Speech error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      console.log('[BackgroundRecorder] Speech recognition service disconnected');

      if (isActiveRef.current && isListeningRef.current) {
        if (retryCountRef.current < MAX_RETRIES) {
          setStatus('reconnecting');
          console.log(`[BackgroundRecorder] Attempting to reconnect (${retryCountRef.current + 1}/${MAX_RETRIES})...`);
          retryCountRef.current++;

          setTimeout(() => {
            if (isActiveRef.current && isListeningRef.current) {
              try {
                recognition.start();
                console.log('[BackgroundRecorder] Re-connected successfully');
              } catch (e) {
                console.error('[BackgroundRecorder] Failed to re-connect:', e);
                // If it fails to restart, it will likely trigger onend again or we'll stay in reconnecting
              }
            }
          }, 1000);
        } else {
          setError('Speech service lost connection repeatedly. Please try stopping and starting again.');
          setStatus('error');
          isListeningRef.current = false;
          setIsListening(false);
        }
      } else {
        console.log('[BackgroundRecorder] Not restarting - session inactive');
        setStatus('ready');
      }
    };

    return recognition;
  }, [onPhraseDetected, scheduleAutoSave]);

  const startListening = useCallback(async () => {
    console.log('[BackgroundRecorder] startListening called');
    setError(null);
    setStatus('initializing');

    try {
      // 1. Initialize Speech Recognition first (preserves user gesture better in some browsers)
      isListeningRef.current = true;
      setIsListening(true);
      retryCountRef.current = 0;

      speechRecognitionRef.current = initSpeechRecognition();
      if (!speechRecognitionRef.current) {
        throw new Error('Speech recognition not supported');
      }

      try {
        speechRecognitionRef.current.start();
        console.log('[BackgroundRecorder] Speech engine start command sent');
      } catch (e: any) {
        if (e.name === 'InvalidStateError') {
          console.log('[BackgroundRecorder] Speech already started');
        } else {
          console.error('[BackgroundRecorder] Speech engine start failed:', e);
          throw e;
        }
      }

      // 2. Then set up Audio visualizer (optional, can fail without stopping speech)
      try {
        console.log('[BackgroundRecorder] Requesting microphone for visualizer...');
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true }
        });
        streamRef.current = stream;

        if (audioContextRef.current) {
          await audioContextRef.current.close().catch(() => { });
        }

        audioContextRef.current = new AudioContext();
        analyserRef.current = audioContextRef.current.createAnalyser();
        const source = audioContextRef.current.createMediaStreamSource(stream);
        source.connect(analyserRef.current);
        analyserRef.current.fftSize = 256;

        const detectVoiceActivity = () => {
          if (analyserRef.current) {
            const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
            analyserRef.current.getByteFrequencyData(dataArray);
            const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
            setAudioLevel(average / 255);
          }
          animationRef.current = requestAnimationFrame(detectVoiceActivity);
        };
        detectVoiceActivity();
      } catch (audioErr) {
        console.warn('[BackgroundRecorder] Visualizer failed to start:', audioErr);
        // We don't throw here so that SpeechRecognition can still work even if visualizer fails
      }

      console.log('[BackgroundRecorder] Initialization sequence complete');
    } catch (error: any) {
      console.error('[BackgroundRecorder] Critical failure:', error);
      setError(error.message || 'Failed to start background listening');
      setStatus('error');
      isListeningRef.current = false;
      setIsListening(false);

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    }
  }, [initSpeechRecognition]);

  const stopListening = useCallback(() => {
    console.log('[BackgroundRecorder] stopListening called');

    // Clear auto-save timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }

    // Save any pending phrases on stop
    if (pendingPhrasesRef.current.length > 0) {
      autoSavePhrases(pendingPhrasesRef.current, true);
    }

    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.onend = null; // Remove listener to prevent restart
        speechRecognitionRef.current.stop();
        console.log('[BackgroundRecorder] Speech recognition stopped');
      } catch (e) {
        console.log('[BackgroundRecorder] Speech stop error:', e);
      }
      speechRecognitionRef.current = null;
    }

    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    if (audioContextRef.current) {
      try {
        const ctx = audioContextRef.current;
        ctx.close().catch(e => console.log('Context close err:', e));
      } catch (e) { }
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    isListeningRef.current = false;
    setIsListening(false);
    setStatus('ready');
    setAudioLevel(0);
  }, [autoSavePhrases]);

  const handleAnalyzeNow = useCallback(async () => {
    if (detectedPhrases.length === 0) return;
    // Clear any pending auto-save
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }
    setIsAnalyzing(true);
    try {
      const result = await submitPhrases(detectedPhrases);
      if (result && onAnalysisComplete) onAnalysisComplete(result);
      pendingPhrasesRef.current = [];
      setDetectedPhrases([]); // Clear after manual analyze
    } finally {
      setIsAnalyzing(false);
    }
  }, [detectedPhrases, submitPhrases, onAnalysisComplete]);

  useEffect(() => {
    console.log('BackgroundRecorder effect:', { isActive, isListeningRef: isListeningRef.current });
    if (isActive) {
      // Reset ref in case of stale state
      if (!isListeningRef.current) {
        startListening();
      }
    } else {
      stopListening();
    }
  }, [isActive, startListening, stopListening]);

  useEffect(() => {
    return () => {
      console.log('BackgroundRecorder unmounting');
      stopListening();
    };
  }, [stopListening]);

  if (!isActive) return null;

  const getStatusDisplay = () => {
    switch (status) {
      case 'listening': return 'Listening Live';
      case 'initializing': return 'Finding Mic...';
      case 'reconnecting': return 'Reconnecting...';
      case 'error': return 'Service Failed';
      default: return 'Ready to Listen';
    }
  };

  return (
    <div className="background-recorder-widget glass-card fade-in">
      <div className="widget-header">
        <div className="status-meta">
          <div className={`status-orb ${status === 'listening' ? 'active' : status === 'error' ? 'error' : status === 'initializing' || status === 'reconnecting' ? 'pending' : ''}`} />
          <span className="status-text">{getStatusDisplay()}</span>
        </div>
        <div className="level-monitor">
          <div className="level-fill" style={{ width: `${Math.max(5, audioLevel * 100)}%`, backgroundColor: audioLevel > SILENCE_THRESHOLD ? 'var(--primary)' : 'rgba(255,255,255,0.1)' }}></div>
        </div>
      </div>

      {error && (
        <div className="error-panel">
          <p className="error-msg">⚠️ {error}</p>
          {(error.includes('permission') || error.includes('denied')) && (
            <div className="permission-guide">
              <p>To enable Background Mode, please:</p>
              <ol>
                <li>Click the <b>lock icon</b> 🔒 in your address bar</li>
                <li>Ensure <b>Microphone</b> is set to <b>Allow</b></li>
                <li>Select <b>"Reset permission"</b> if it's already allowed but not working</li>
                <li>Refresh this page</li>
              </ol>
            </div>
          )}
          <button onClick={() => { setError(null); startListening(); }} className="retry-btn">Reset & Try Again</button>
        </div>
      )}

      {detectedPhrases.length > 0 && !error && (
        <div className="widget-discovery fade-in">
          <header className="discovery-header">
            <h6>Phrases Detected ({detectedPhrases.length})</h6>
            <div className="discovery-actions">
              <button onClick={handleAnalyzeNow} className="discovery-push-btn" disabled={isAnalyzing || isLoading}>
                {isAnalyzing ? 'Saving...' : 'Force Save'}
              </button>
              <button onClick={() => { setDetectedPhrases([]); pendingPhrasesRef.current = []; }} className="clear-link-btn">Reset</button>
            </div>
          </header>

          <div className="discovery-stack">
            {detectedPhrases.slice(-3).map((phrase, index) => (
              <div key={index} className="discovery-bubble">
                <span className="quote">"</span>{phrase}<span className="quote">"</span>
              </div>
            ))}
          </div>

          <div className="action-area">
            {isAnalyzing || isLoading ? (
              <span className="hint-val auto-save-indicator">✓ Auto-saving phrases...</span>
            ) : pendingPhrasesRef.current.length > 0 ? (
              <span className="hint-val auto-save-indicator">Auto-saves in 5s after speaking</span>
            ) : (
              <span className="hint-val">✓ Phrases saved to your profile</span>
            )}
          </div>
        </div>
      )}

      <style jsx>{styles}</style>
    </div>
  );
};

const styles = `
    .background-recorder-widget {
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 280px;
        padding: var(--space-md) !important;
        z-index: 1000;
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
        border: 1px solid var(--border-glass) !important;
    }

    .widget-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 0.75rem; }
    .status-meta { display: flex; align-items: center; gap: 0.5rem; min-width: 80px; }
    .status-orb { width: 8px; height: 8px; border-radius: 50%; background: var(--text-secondary); opacity: 0.3; }
    .status-orb.active { background: var(--primary); opacity: 1; box-shadow: 0 0 10px var(--primary); animation: widget-pulse 2s infinite; }
    .status-orb.error { background: #ef4444; opacity: 1; box-shadow: 0 0 10px #ef4444; }
    .status-orb.pending { background: var(--warning); opacity: 1; animation: widget-pulse 1s infinite; }
    .status-text { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: var(--text-secondary); }

    .error-panel { background: rgba(239, 68, 68, 0.1); border-radius: 8px; padding: 1rem; margin-top: 0.5rem; border: 1px solid rgba(239, 68, 68, 0.2); text-align: left; }
    .error-msg { font-size: 0.8rem; font-weight: 700; color: #fca5a5; margin: 0 0 0.5rem 0; line-height: 1.4; display: flex; align-items: center; gap: 0.5rem; }
    .permission-guide { font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 1rem; line-height: 1.5; background: rgba(0,0,0,0.2); padding: 0.75rem; border-radius: 6px; }
    .permission-guide ol { margin: 0.5rem 0; padding-left: 1.25rem; }
    .permission-guide b { color: var(--primary); }
    
    .retry-btn { background: #ef4444; color: white; border: none; padding: 8px 12px; border-radius: 4px; font-size: 0.75rem; font-weight: 700; cursor: pointer; width: 100%; transition: all 0.2s; }
    .retry-btn:hover { background: #dc2626; transform: translateY(-1px); }

    .level-monitor { flex: 1; height: 4px; background: rgba(255, 255, 255, 0.05); border-radius: 2px; overflow: hidden; }
    .level-fill { height: 100%; border-radius: 2px; transition: width 0.1s ease, background-color 0.2s ease; }

    .widget-discovery { border-top: 1px solid var(--border-glass); padding-top: 0.75rem; }
    .discovery-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
    .discovery-header h6 { margin: 0; font-size: 0.75rem; font-weight: 700; color: var(--text-primary); text-transform: uppercase; letter-spacing: 0.5px; }
    .discovery-actions { display: flex; gap: 0.5rem; align-items: center; }
    
    .discovery-push-btn {
        background: var(--primary);
        color: white;
        border: none;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 0.65rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s;
        text-transform: uppercase;
    }
    .discovery-push-btn:hover:not(:disabled) { background: var(--primary-dark); transform: translateY(-1px); }
    .discovery-push-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .clear-link-btn { background: none; border: none; padding: 0; color: var(--text-secondary); font-size: 0.65rem; cursor: pointer; text-decoration: underline; white-space: nowrap; }
    .clear-link-btn:hover { color: var(--text-primary); }

    .discovery-stack { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 0.75rem; }
    .discovery-bubble { font-size: 0.75rem; color: var(--text-primary); padding: 0.6rem; background: rgba(255, 255, 255, 0.03); border-radius: var(--radius-sm); border-left: 2px solid var(--primary); line-height: 1.4; }
    .quote { opacity: 0.4; color: var(--primary); }

    .action-area { text-align: center; }
    .mini-btn { padding: 0.5rem 1rem; font-size: 0.75rem; width: 100%; }
    .hint-val { font-size: 0.65rem; font-style: italic; color: var(--text-secondary); opacity: 0.4; }

    @keyframes widget-pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.4); opacity: 0.6; } 100% { transform: scale(1); opacity: 1; } }

    @media (max-width: 768px) {
        .background-recorder-widget { right: 12px; bottom: 12px; width: calc(100% - 24px); }
    }
`;
