import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useAudioApi } from '../hooks/useAudioApi';
import { usePhrasesApi } from '../hooks/usePhrasesApi';
import { Phrase, IdiolectProfile } from '../types/phrases';

interface VoiceRecorderProps {
  userId: string;
  onRecordingComplete: (audioBlob: Blob, duration: number) => void;
  onAnalysisComplete: (data?: { phrases: Phrase[], profile: IdiolectProfile }) => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  userId,
  onRecordingComplete,
  onAnalysisComplete
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isAnalyzingPhrases, setIsAnalyzingPhrases] = useState(false);

  const { uploadAudio, isUploading, uploadError, transcriptionResult, clearError } = useAudioApi();
  const { submitPhrases } = usePhrasesApi(userId);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = useCallback(async () => {
    try {
      clearError();
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      const chunks: Blob[] = [];
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        onRecordingComplete(audioBlob, recordingTime);

        // Upload and process audio
        const success = await uploadAudio(audioBlob, userId);
        if (success) {
          // Note: audioBlob upload doesn't yet return analysis data
          // Analysis happens separately via handleAnalyzeTranscript
          // This is just for recording completion notification
        }

        stream.getTracks().forEach(track => track.stop());
        setRecordingTime(0);
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch {
      alert('Could not access microphone. Please check permissions.');
    }
  }, [clearError, uploadAudio, onRecordingComplete, onAnalysisComplete, recordingTime]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setAudioLevel(0);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isUploading) {
    return (
      <div className="voice-recorder processing">
        <div className="processing-animation">
          <div className="spinner"></div>
          <h3>Processing Your Recording...</h3>
          <p>Analyzing your speech patterns and converting to text</p>
        </div>

        <style jsx>{`
          .voice-recorder.processing {
            background: white;
            border-radius: 1rem;
            padding: 3rem 2rem;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            text-align: center;
            max-width: 600px;
            margin: 0 auto;
          }

          .processing-animation {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1rem;
          }

          .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #e2e8f0;
            border-top: 4px solid #4299e1;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          .processing-animation h3 {
            color: #2d3748;
            margin: 0;
          }

          .processing-animation p {
            color: #718096;
            margin: 0;
          }
        `}</style>
      </div>
    );
  }

  // Extract phrases from transcript
  const extractPhrasesFromTranscript = (transcript: string): string[] => {
    return transcript
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 5)
      .slice(0, 10);
  };

  // Handle analyzing the transcript
  const handleAnalyzeTranscript = async () => {
    if (!transcriptionResult) return;

    const phrases = extractPhrasesFromTranscript(transcriptionResult.transcript);
    if (phrases.length === 0) {
      alert('Could not extract enough phrases from the transcript. Please try recording again with more speech.');
      return;
    }

    setIsAnalyzingPhrases(true);
    try {
      const result = await submitPhrases(phrases);
      if (result) {
        onAnalysisComplete(result);
      }
    } finally {
      setIsAnalyzingPhrases(false);
    }
  };

  if (transcriptionResult) {
    const extractedPhrases = extractPhrasesFromTranscript(transcriptionResult.transcript);

    return (
      <div className="voice-recorder results">
        <div className="transcription-results">
          <h3>✅ Recording Processed Successfully!</h3>
          <div className="transcript">
            <h4>Transcript:</h4>
            <p>"{transcriptionResult.transcript}"</p>
          </div>
          <div className="metrics">
            <div className="metric">
              <span className="label">Confidence:</span>
              <span className="value">{Math.round(transcriptionResult.confidence * 100)}%</span>
            </div>
            <div className="metric">
              <span className="label">Words per minute:</span>
              <span className="value">{transcriptionResult.speechMetrics.wordsPerMinute}</span>
            </div>
            <div className="metric">
              <span className="label">Word count:</span>
              <span className="value">{transcriptionResult.speechMetrics.wordCount}</span>
            </div>
          </div>

          {extractedPhrases.length > 0 && (
            <div className="extracted-phrases">
              <h4>Extracted Phrases ({extractedPhrases.length}):</h4>
              <ul>
                {extractedPhrases.map((phrase, idx) => (
                  <li key={idx}>"{phrase}"</li>
                ))}
              </ul>
              <button
                onClick={handleAnalyzeTranscript}
                className="analyze-btn"
                disabled={isAnalyzingPhrases}
              >
                {isAnalyzingPhrases ? 'Analyzing...' : 'Analyze My Speaking Style'}
              </button>
            </div>
          )}
        </div>

        <style jsx>{`
          .voice-recorder.results {
            background: white;
            border-radius: 1rem;
            padding: 2rem;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            max-width: 600px;
            margin: 0 auto;
            text-align: center;
          }

          .transcription-results h3 {
            color: #38a169;
            margin-bottom: 1.5rem;
          }

          .transcript {
            background: #f0fff4;
            padding: 1.5rem;
            border-radius: 0.75rem;
            margin-bottom: 1.5rem;
            border-left: 4px solid #38a169;
          }

          .transcript h4 {
            color: #2d3748;
            margin-bottom: 0.5rem;
          }

          .transcript p {
            color: #4a5568;
            font-style: italic;
            font-size: 1.1rem;
            line-height: 1.5;
          }

          .metrics {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 1rem;
          }

          .metric {
            background: #f8fafc;
            padding: 1rem;
            border-radius: 0.5rem;
            display: flex;
            flex-direction: column;
            align-items: center;
          }

          .metric .label {
            color: #718096;
            font-size: 0.875rem;
            margin-bottom: 0.25rem;
          }

          .metric .value {
            color: #2d3748;
            font-weight: 600;
            font-size: 1.25rem;
          }

          .extracted-phrases {
            margin-top: 1.5rem;
            padding-top: 1.5rem;
            border-top: 1px solid #e2e8f0;
            text-align: left;
          }

          .extracted-phrases h4 {
            color: #2d3748;
            margin-bottom: 0.75rem;
          }

          .extracted-phrases ul {
            list-style: none;
            padding: 0;
            margin: 0 0 1rem 0;
          }

          .extracted-phrases li {
            padding: 0.5rem 0.75rem;
            background: #f8fafc;
            margin-bottom: 0.5rem;
            border-radius: 0.5rem;
            border-left: 3px solid #4299e1;
            color: #4a5568;
            font-style: italic;
            font-size: 0.9rem;
          }

          .analyze-btn {
            width: 100%;
            padding: 1rem;
            font-size: 1rem;
            font-weight: 600;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            border: none;
            border-radius: 0.75rem;
            cursor: pointer;
            transition: all 0.2s;
          }

          .analyze-btn:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
          }

          .analyze-btn:disabled {
            background: #a0aec0;
            cursor: not-allowed;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="voice-recorder">
      <div className="recorder-container">
        <div className="recording-status">
          {isRecording ? (
            <div className="recording-active">
              <div className="recording-indicator">
                <div className="pulse-dot"></div>
                <span>Recording...</span>
              </div>
              <div className="recording-time">{formatTime(recordingTime)}</div>
            </div>
          ) : (
            <div className="recording-ready">
              <h3>🎤 Ready to Record</h3>
              <p>Click the button below to start recording your voice</p>
            </div>
          )}
        </div>

        <div className="audio-visualizer">
          <div
            className="audio-level-bar"
            style={{
              height: `${Math.max(audioLevel * 100, 5)}%`,
              backgroundColor: isRecording ? '#48bb78' : '#e2e8f0'
            }}
          ></div>
        </div>

        <div className="recording-controls">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="record-btn start"
            >
              🎤 Start Recording
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="record-btn stop"
            >
              ⏹️ Stop Recording
            </button>
          )}
        </div>

        {uploadError && (
          <div className="error-message">
            <p>❌ {uploadError}</p>
            <button onClick={clearError} className="clear-error">
              Try Again
            </button>
          </div>
        )}

        <div className="recording-tips">
          <h4>💡 Recording Tips</h4>
          <ul>
            <li>Speak naturally as you would in daily conversation</li>
            <li>Include phrases you actually use at work, home, or with friends</li>
            <li>Don't worry about perfect grammar - be authentic!</li>
            <li>Record for 30-60 seconds for best analysis</li>
          </ul>
        </div>
      </div>

      <style jsx>{`
        .voice-recorder {
          background: white;
          border-radius: 1rem;
          padding: 2rem;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          max-width: 600px;
          margin: 0 auto;
        }

        .recorder-container {
          text-align: center;
        }

        .recording-status {
          margin-bottom: 2rem;
        }

        .recording-ready h3 {
          color: #2d3748;
          margin-bottom: 0.5rem;
        }

        .recording-ready p {
          color: #718096;
        }

        .recording-active {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .recording-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #e53e3e;
          font-weight: 600;
        }

        .pulse-dot {
          width: 12px;
          height: 12px;
          background: #e53e3e;
          border-radius: 50%;
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
          100% { opacity: 1; transform: scale(1); }
        }

        .recording-time {
          font-size: 1.5rem;
          font-weight: 600;
          color: #2d3748;
          font-family: 'Courier New', monospace;
        }

        .audio-visualizer {
          height: 100px;
          display: flex;
          align-items: end;
          justify-content: center;
          margin: 2rem 0;
          background: #f8fafc;
          border-radius: 0.5rem;
          padding: 1rem;
        }

        .audio-level-bar {
          width: 20px;
          background: #e2e8f0;
          border-radius: 10px;
          transition: height 0.1s ease-out;
          min-height: 5px;
        }

        .recording-controls {
          margin: 2rem 0;
        }

        .record-btn {
          padding: 1rem 2rem;
          font-size: 1.1rem;
          font-weight: 600;
          border: none;
          border-radius: 0.75rem;
          cursor: pointer;
          transition: all 0.2s;
          min-width: 200px;
        }

        .record-btn.start {
          background: linear-gradient(135deg, #48bb78, #38a169);
          color: white;
        }

        .record-btn.stop {
          background: linear-gradient(135deg, #e53e3e, #c53030);
          color: white;
        }

        .record-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
        }

        .error-message {
          background: #fed7d7;
          color: #c53030;
          padding: 1rem;
          border-radius: 0.5rem;
          margin: 1rem 0;
        }

        .clear-error {
          background: #c53030;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 0.25rem;
          cursor: pointer;
          margin-top: 0.5rem;
        }

        .recording-tips {
          background: #f0f9ff;
          padding: 1.5rem;
          border-radius: 0.75rem;
          margin-top: 2rem;
          text-align: left;
        }

        .recording-tips h4 {
          color: #1e40af;
          margin-bottom: 1rem;
        }

        .recording-tips ul {
          color: #1e3a8a;
          line-height: 1.6;
        }

        .recording-tips li {
          margin-bottom: 0.5rem;
        }

        @media (max-width: 768px) {
          .voice-recorder {
            padding: 1rem;
          }

          .record-btn {
            min-width: 150px;
            font-size: 1rem;
          }

          .metrics {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};
