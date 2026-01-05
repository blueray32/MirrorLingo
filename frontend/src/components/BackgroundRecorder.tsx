import React, { useState, useRef, useCallback, useEffect } from 'react';

interface BackgroundRecorderProps {
  onPhraseDetected: (phrase: string, confidence: number) => void;
  isActive: boolean;
}

export const BackgroundRecorder: React.FC<BackgroundRecorderProps> = ({
  onPhraseDetected,
  isActive
}) => {
  const [isListening, setIsListening] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [detectedPhrases, setDetectedPhrases] = useState<string[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const recordingChunksRef = useRef<Blob[]>([]);

  // Voice Activity Detection parameters
  const SILENCE_THRESHOLD = 0.01; // Audio level threshold for silence
  const SILENCE_DURATION = 2000; // 2 seconds of silence to trigger phrase end
  const MIN_PHRASE_DURATION = 1000; // Minimum 1 second for a valid phrase

  const startListening = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });

      // Set up audio context for voice activity detection
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;

      // Set up media recorder for continuous recording
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      recordingChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordingChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        if (recordingChunksRef.current.length > 0) {
          const audioBlob = new Blob(recordingChunksRef.current, { type: 'audio/webm' });
          processAudioChunk(audioBlob);
          recordingChunksRef.current = [];
        }
      };

      // Start recording in chunks
      mediaRecorderRef.current.start(1000); // 1-second chunks
      setIsListening(true);

      // Start voice activity detection
      const detectVoiceActivity = () => {
        if (analyserRef.current && isActive) {
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          const level = average / 255;
          
          setAudioLevel(level);

          // Voice activity detection
          if (level > SILENCE_THRESHOLD) {
            // Voice detected - clear silence timeout
            if (silenceTimeoutRef.current) {
              clearTimeout(silenceTimeoutRef.current);
              silenceTimeoutRef.current = null;
            }
          } else {
            // Silence detected - start timeout if not already started
            if (!silenceTimeoutRef.current) {
              silenceTimeoutRef.current = setTimeout(() => {
                // End of phrase detected
                if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                  mediaRecorderRef.current.stop();
                  // Restart recording for next phrase
                  setTimeout(() => {
                    if (mediaRecorderRef.current && isActive) {
                      mediaRecorderRef.current.start(1000);
                    }
                  }, 100);
                }
                silenceTimeoutRef.current = null;
              }, SILENCE_DURATION);
            }
          }
        }
        
        if (isActive) {
          animationRef.current = requestAnimationFrame(detectVoiceActivity);
        }
      };

      detectVoiceActivity();

    } catch (error) {
      console.error('Error starting background recording:', error);
    }
  }, [isActive]);

  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
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

  // Process audio chunk (mock transcription for demo)
  const processAudioChunk = useCallback(async (audioBlob: Blob) => {
    // In a real implementation, this would send to transcription service
    // For demo, we'll simulate phrase detection
    if (audioBlob.size > 1000) { // Only process chunks with actual audio
      const mockPhrases = [
        "I need to finish this project by tomorrow",
        "Can you help me with this task?",
        "Let me think about that for a moment",
        "That sounds like a great idea",
        "I'm not sure about this approach"
      ];
      
      const randomPhrase = mockPhrases[Math.floor(Math.random() * mockPhrases.length)];
      const confidence = 0.7 + Math.random() * 0.3; // Random confidence 0.7-1.0
      
      setDetectedPhrases(prev => [...prev.slice(-4), randomPhrase]); // Keep last 5
      onPhraseDetected(randomPhrase, confidence);
    }
  }, [onPhraseDetected]);

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
          <h4>Recently Detected:</h4>
          <div className="phrase-list">
            {detectedPhrases.slice(-3).map((phrase, index) => (
              <div key={index} className="detected-phrase">
                "{phrase}"
              </div>
            ))}
          </div>
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

        .detected-phrases h4 {
          font-size: 0.75rem;
          font-weight: 600;
          color: #718096;
          margin-bottom: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .phrase-list {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .detected-phrase {
          font-size: 0.75rem;
          color: #4a5568;
          padding: 0.25rem 0.5rem;
          background: #f8fafc;
          border-radius: 6px;
          border-left: 2px solid #4299e1;
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
