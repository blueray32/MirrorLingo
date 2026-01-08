import React, { useState, useRef, useCallback, useEffect } from 'react';
import { usePhrasesApi } from '../hooks/usePhrasesApi';

// Web Speech API types
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

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const speechRecognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  // Voice Activity Detection parameters
  const SILENCE_THRESHOLD = 0.01; // Audio level threshold for silence

  // Initialize Web Speech API for real transcription - defined BEFORE startListening
  const initSpeechRecognition = useCallback((): SpeechRecognitionInstance | null => {
    const SpeechRecognitionConstructor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionConstructor) {
      console.warn('Speech Recognition not supported in this browser');
      return null;
    }

    const recognition: SpeechRecognitionInstance = new SpeechRecognitionConstructor();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const lastResult = event.results[event.results.length - 1];
      if (lastResult.isFinal) {
        const transcript = lastResult[0].transcript.trim();
        const confidence = lastResult[0].confidence;

        if (transcript.length > 5) { // Filter out very short utterances
          setDetectedPhrases(prev => {
            const newPhrases = [...prev, transcript];
            return newPhrases.slice(-10); // Keep last 10 phrases
          });
          onPhraseDetected(transcript, confidence);
        }
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      if (event.error !== 'no-speech' && isActive) {
        // Try to restart on errors other than no-speech
        setTimeout(() => {
          if (speechRecognitionRef.current && isActive) {
            try {
              speechRecognitionRef.current.start();
            } catch (e) {
              // Already started
            }
          }
        }, 1000);
      }
    };

    recognition.onend = () => {
      // Restart if still active
      if (isActive && speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.start();
        } catch (e) {
          // Already started
        }
      }
    };

    return recognition;
  }, [isActive, onPhraseDetected]);

  const startListening = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });

      // Set up audio context for voice activity detection (visual feedback)
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;

      // Initialize Web Speech API for transcription
      speechRecognitionRef.current = initSpeechRecognition();
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.start();
        } catch (e) {
          console.error('Failed to start speech recognition:', e);
        }
      }

      setIsListening(true);

      // Visual audio level detection (for UI feedback only)
      const detectVoiceActivity = () => {
        if (analyserRef.current && isActive) {
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          const level = average / 255;

          setAudioLevel(level);
        }

        if (isActive) {
          animationRef.current = requestAnimationFrame(detectVoiceActivity);
        }
      };

      detectVoiceActivity();

    } catch (error) {
      console.error('Error starting background recording:', error);
    }
  }, [isActive, initSpeechRecognition]);

  const stopListening = useCallback(() => {
    // Stop speech recognition
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch (e) {
        // Already stopped
      }
      speechRecognitionRef.current = null;
    }

    if (mediaRecorderRef.current) {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        // Already stopped
      }
    }

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    setIsListening(false);
    setAudioLevel(0);
  }, []);

  // Analyze collected phrases
  const handleAnalyzeNow = useCallback(async () => {
    if (detectedPhrases.length === 0) return;

    setIsAnalyzing(true);
    try {
      const result = await submitPhrases(detectedPhrases);
      if (result && onAnalysisComplete) {
        onAnalysisComplete(result);
      }
    } finally {
      setIsAnalyzing(false);
    }
  }, [detectedPhrases, submitPhrases, onAnalysisComplete]);

  // Clear collected phrases
  const handleClearPhrases = useCallback(() => {
    setDetectedPhrases([]);
  }, []);

  // Effect to start/stop listening based on isActive
  useEffect(() => {
    if (isActive && !isListening) {
      startListening();
    } else if (!isActive && isListening) {
      stopListening();
    }
  }, [isActive, isListening, startListening, stopListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  if (!isActive) {
    return null;
  }

  return (
    <div className="background-recorder">
      <div className="recorder-status">
        <div className="status-indicator">
          <div className={`pulse ${isListening ? 'active' : ''}`} />
          <span>{isListening ? 'Listening...' : 'Initializing...'}</span>
        </div>

        <div className="audio-level-mini">
          <div
            className="level-bar"
            style={{
              width: `${Math.max(5, audioLevel * 100)}%`,
              backgroundColor: audioLevel > SILENCE_THRESHOLD ? '#4299e1' : '#e2e8f0'
            }}
          />
        </div>
      </div>

      {detectedPhrases.length > 0 && (
        <div className="detected-phrases">
          <div className="phrases-header">
            <h4>Detected Phrases ({detectedPhrases.length}):</h4>
            <button
              onClick={handleClearPhrases}
              className="clear-btn"
              title="Clear all phrases"
            >
              Clear
            </button>
          </div>
          <div className="phrase-list">
            {detectedPhrases.slice(-5).map((phrase, index) => (
              <div key={index} className="detected-phrase">
                "{phrase}"
              </div>
            ))}
          </div>
          {detectedPhrases.length >= 3 && (
            <button
              onClick={handleAnalyzeNow}
              className="analyze-btn"
              disabled={isAnalyzing || isLoading}
            >
              {isAnalyzing || isLoading ? 'Analyzing...' : `Analyze ${detectedPhrases.length} Phrases`}
            </button>
          )}
          {detectedPhrases.length < 3 && (
            <p className="hint-text">Keep talking! Need at least 3 phrases to analyze.</p>
          )}
        </div>
      )}

      <style jsx>{`
        .background-recorder {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          padding: 1rem;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
          max-width: 300px;
          z-index: 1000;
        }

        .recorder-status {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: #4a5568;
        }

        .pulse {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #e2e8f0;
        }

        .pulse.active {
          background: #4299e1;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(66, 153, 225, 0.7);
          }
          70% {
            transform: scale(1);
            box-shadow: 0 0 0 6px rgba(66, 153, 225, 0);
          }
          100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(66, 153, 225, 0);
          }
        }

        .audio-level-mini {
          flex: 1;
          height: 4px;
          background: #f1f5f9;
          border-radius: 2px;
          overflow: hidden;
        }

        .level-bar {
          height: 100%;
          border-radius: 2px;
          transition: width 0.1s ease, background-color 0.2s ease;
        }

        .detected-phrases {
          border-top: 1px solid #e2e8f0;
          padding-top: 0.75rem;
        }

        .phrases-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .detected-phrases h4 {
          font-size: 0.75rem;
          font-weight: 600;
          color: #718096;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .clear-btn {
          font-size: 0.65rem;
          padding: 0.2rem 0.5rem;
          background: #e2e8f0;
          color: #718096;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .clear-btn:hover {
          background: #cbd5e0;
          color: #4a5568;
        }

        .phrase-list {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          max-height: 150px;
          overflow-y: auto;
        }

        .detected-phrase {
          font-size: 0.75rem;
          color: #4a5568;
          padding: 0.25rem 0.5rem;
          background: #f8fafc;
          border-radius: 6px;
          border-left: 2px solid #4299e1;
        }

        .analyze-btn {
          width: 100%;
          margin-top: 0.75rem;
          padding: 0.6rem 1rem;
          font-size: 0.85rem;
          font-weight: 600;
          background: linear-gradient(135deg, #48bb78, #38a169);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .analyze-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(72, 187, 120, 0.3);
        }

        .analyze-btn:disabled {
          background: #a0aec0;
          cursor: not-allowed;
        }

        .hint-text {
          font-size: 0.7rem;
          color: #a0aec0;
          text-align: center;
          margin-top: 0.5rem;
          font-style: italic;
        }

        @media (max-width: 768px) {
          .background-recorder {
            bottom: 10px;
            right: 10px;
            left: 10px;
            max-width: none;
          }
        }
      `}</style>
    </div>
  );
};
