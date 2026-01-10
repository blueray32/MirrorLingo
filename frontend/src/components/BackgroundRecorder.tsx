import React, { useState, useRef, useCallback, useEffect } from 'react';
import { usePhrasesApi } from '../hooks/usePhrasesApi';

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
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
    if (!SpeechRecognitionConstructor) return null;

    const recognition: SpeechRecognitionInstance = new SpeechRecognitionConstructor();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const lastResult = event.results[event.results.length - 1];
      if (lastResult.isFinal) {
        const transcript = lastResult[0].transcript.trim();
        const confidence = lastResult[0].confidence;
        // Only save phrases with 3+ words that are meaningful
        if (transcript.split(' ').length >= 3 && transcript.length > 10) {
          setDetectedPhrases(prev => {
            // Avoid duplicates
            if (prev.includes(transcript)) return prev;
            return [...prev, transcript].slice(-20); // Keep last 20
          });
          onPhraseDetected(transcript, confidence);
          scheduleAutoSave(transcript); // Auto-save after delay
        }
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error !== 'no-speech' && isActiveRef.current) {
        setTimeout(() => {
          if (speechRecognitionRef.current && isActiveRef.current) {
            try { speechRecognitionRef.current.start(); } catch (e) { }
          }
        }, 1000);
      }
    };

    recognition.onend = () => {
      if (isActiveRef.current && speechRecognitionRef.current) {
        try { speechRecognitionRef.current.start(); } catch (e) { }
      }
    };

    return recognition;
  }, [onPhraseDetected, scheduleAutoSave]);

  const startListening = useCallback(async () => {
    console.log('startListening called, current state:', { isListeningRef: isListeningRef.current });

    // Set listening state immediately for UI feedback
    isListeningRef.current = true;
    setIsListening(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 44100 }
      });
      console.log('Got media stream');
      streamRef.current = stream;

      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;

      speechRecognitionRef.current = initSpeechRecognition();
      if (speechRecognitionRef.current) {
        try { speechRecognitionRef.current.start(); } catch (e) { console.log('Speech start error:', e); }
      }

      console.log('Now listening - state updated');

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
    } catch (error) {
      console.error('Core sensor initialization failure:', error);
      // Reset state on error
      isListeningRef.current = false;
      setIsListening(false);
    }
  }, [initSpeechRecognition]);

  const stopListening = useCallback(() => {
    if (!isListeningRef.current) return; // Not listening
    console.log('stopListening called');
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
      try { speechRecognitionRef.current.stop(); } catch (e) { }
      speechRecognitionRef.current = null;
    }
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    isListeningRef.current = false;
    setIsListening(false);
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

  return (
    <div className="background-recorder-widget glass-card fade-in">
      <div className="widget-header">
        <div className="status-meta">
          <div className={`status-orb ${isListening ? 'active' : ''}`} />
          <span className="status-text">{isListening ? 'Listening' : 'Ready'}</span>
        </div>
        <div className="level-monitor">
          <div className="level-fill" style={{ width: `${Math.max(5, audioLevel * 100)}%`, backgroundColor: audioLevel > SILENCE_THRESHOLD ? 'var(--primary)' : 'rgba(255,255,255,0.1)' }}></div>
        </div>
      </div>

      {detectedPhrases.length > 0 && (
        <div className="widget-discovery fade-in">
          <header className="discovery-header">
            <h6>Phrases Detected ({detectedPhrases.length})</h6>
            <button onClick={() => { setDetectedPhrases([]); pendingPhrasesRef.current = []; }} className="clear-link-btn">Reset</button>
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
    .status-text { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: var(--text-secondary); }

    .level-monitor { flex: 1; height: 4px; background: rgba(255, 255, 255, 0.05); border-radius: 2px; overflow: hidden; }
    .level-fill { height: 100%; border-radius: 2px; transition: width 0.1s ease, background-color 0.2s ease; }

    .widget-discovery { border-top: 1px solid var(--border-glass); padding-top: 0.75rem; }
    .discovery-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
    .discovery-header h6 { margin: 0; font-size: 0.65rem; font-weight: 800; text-transform: uppercase; color: var(--text-secondary); opacity: 0.6; }
    .clear-link-btn { background: none; border: none; font-size: 0.65rem; font-weight: 800; color: var(--text-secondary); cursor: pointer; text-decoration: underline; opacity: 0.5; }
    .clear-link-btn:hover { opacity: 1; }

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
