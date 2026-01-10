import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useAudioApi } from '../hooks/useAudioApi';
import { usePhrasesApi } from '../hooks/usePhrasesApi';
import { Phrase, IdiolectProfile } from '../types/phrases';
import {
  getEnglishSpeechConfig,
  createSpeechRecognition,
  processSpeechResults,
  getBestTranscript
} from '../utils/speechRecognitionUtils';

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
  const [liveTranscript, setLiveTranscript] = useState('');
  const [speechStatus, setSpeechStatus] = useState('Ready');

  const { uploadAudio, isUploading, uploadError, transcriptionResult, clearError } = useAudioApi();
  const { submitPhrases } = usePhrasesApi(userId);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef<string>('');
  const phrasesRef = useRef<string[]>([]); // Store individual phrases
  const interimTranscriptRef = useRef<string>('');
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isRecordingRef = useRef<boolean>(false);

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

      // Setup Speech Recognition
      transcriptRef.current = '';
      phrasesRef.current = [];
      setLiveTranscript('');
      const config = getEnglishSpeechConfig();
      recognitionRef.current = createSpeechRecognition(config);
      setSpeechStatus('Listening...');

      recognitionRef.current.onresult = (event: any) => {
        let interimText = '';

        // Process results - each final result is a natural phrase/sentence
        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            const phrase = result[0].transcript.trim();
            // Only add if it's a meaningful phrase (3+ words)
            if (phrase.split(' ').length >= 3 && !phrasesRef.current.includes(phrase)) {
              phrasesRef.current.push(phrase);
              console.log('[VoiceRecorder] Captured phrase:', phrase);
              setSpeechStatus(`Captured ${phrasesRef.current.length} phrase(s)`);
            }
          } else {
            interimText += result[0].transcript + ' ';
          }
        }

        // Update full transcript from collected phrases
        transcriptRef.current = phrasesRef.current.join('. ');
        
        // Show phrases + interim for live display
        interimTranscriptRef.current = interimText.trim();
        const displayText = phrasesRef.current.length > 0 
          ? phrasesRef.current.map((p, i) => `${i + 1}. ${p}`).join('\n') + (interimText ? `\n... ${interimText}` : '')
          : interimText;
        setLiveTranscript(displayText);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('[VoiceRecorder] Speech recognition error:', event.error);
        if (event.error === 'no-speech') {
          setSpeechStatus('No speech detected - try speaking louder');
        } else {
          setSpeechStatus(`Error: ${event.error}`);
        }
      };

      recognitionRef.current.onend = () => {
        console.log('[VoiceRecorder] Speech recognition ended. Transcript:', transcriptRef.current);
        // Restart recognition if we're still recording (continuous mode workaround)
        // Use ref instead of state to avoid closure stale state issue
        if (isRecordingRef.current && recognitionRef.current) {
          try {
            recognitionRef.current.start();
            setSpeechStatus('Listening... (restarted)');
            console.log('[VoiceRecorder] Restarted speech recognition');
          } catch (e) {
            console.warn('[VoiceRecorder] Could not restart recognition:', e);
          }
        }
      };

      const chunks: Blob[] = [];
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        onRecordingComplete(audioBlob, recordingTime);

        // Stop recognition if still running
        if (recognitionRef.current) {
          try { recognitionRef.current.stop(); } catch (e) { }
        }

        const finalTranscript = transcriptRef.current.trim();
        console.log('[VoiceRecorder] Final transcript to upload:', finalTranscript);
        await uploadAudio(audioBlob, userId, finalTranscript);
        stream.getTracks().forEach(track => track.stop());
        setRecordingTime(0);
        setLiveTranscript('');
        if (timerRef.current) clearInterval(timerRef.current);
      };

      mediaRecorderRef.current.start();
      if (recognitionRef.current) recognitionRef.current.start();
      isRecordingRef.current = true;
      setIsRecording(true);
      timerRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);

    } catch {
      alert('Acoustic sensor access denied. Please check hardware permissions.');
    }
  }, [clearError, uploadAudio, onRecordingComplete, recordingTime, userId]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      isRecordingRef.current = false;
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setAudioLevel(0);
    }
  }, []);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isUploading) {
    return (
      <div className="voice-recorder processing glass-card fade-in">
        <div className="processing-hero">
          <div className="themed-spinner big"></div>
          <h3>Neural Extraction in Progress</h3>
          <p>Processing your acoustic profile through our linguistic engine...</p>
        </div>
        <style jsx>{styles}</style>
      </div>
    );
  }

  const extractPhrasesFromTranscript = (transcript: string): string[] => {
    // Split by sentence-ending punctuation and common phrase boundaries
    const sentences = transcript
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 3);
    
    const phrases: string[] = [];
    
    for (const sentence of sentences) {
      // If sentence is short enough, keep as-is
      if (sentence.split(' ').length <= 12) {
        if (sentence.length > 5) phrases.push(sentence);
        continue;
      }
      
      // Split longer sentences by commas, "and", "but", "so", "because"
      const parts = sentence
        .split(/,\s*|\s+and\s+|\s+but\s+|\s+so\s+|\s+because\s+/i)
        .map(p => p.trim())
        .filter(p => p.split(' ').length >= 3 && p.length > 5);
      
      if (parts.length > 1) {
        phrases.push(...parts);
      } else if (sentence.length > 5) {
        phrases.push(sentence);
      }
    }
    
    // Remove duplicates and limit to 10 phrases
    const unique = Array.from(new Set(phrases));
    return unique.slice(0, 10);
  };

  if (transcriptionResult) {
    // Use the phrases we captured during recording, or extract from transcript
    const extractedPhrases = phrasesRef.current.length > 0 
      ? phrasesRef.current 
      : extractPhrasesFromTranscript(transcriptionResult.transcript);

    return (
      <div className="voice-recorder results glass-card fade-in">
        <header className="results-header">
          <span className="badge-pill success">Acquisition Successful</span>
          <h3>Phrases Captured</h3>
        </header>

        {extractedPhrases.length > 0 ? (
          <div className="extraction-pane fade-in">
            <div className="pane-header">
              <h5>Your Phrases ({extractedPhrases.length})</h5>
              <p className="hint-text">These are the natural phrases we detected from your speech</p>
            </div>
            <ul className="phrase-stack">
              {extractedPhrases.map((phrase, idx) => (
                <li key={idx}>"{phrase}"</li>
              ))}
            </ul>
            <button
              onClick={async () => {
                setIsAnalyzingPhrases(true);
                const result = await submitPhrases(extractedPhrases);
                if (result) onAnalysisComplete(result);
                setIsAnalyzingPhrases(false);
              }}
              className="primary-btn wide-btn"
              disabled={isAnalyzingPhrases}
            >
              {isAnalyzingPhrases ? 'Analyzing Your Style...' : 'Analyze My Speaking Style'}
            </button>
          </div>
        ) : (
          <div className="no-phrases">
            <p>No clear phrases detected. Try speaking in complete sentences.</p>
            <button onClick={() => window.location.reload()} className="secondary-btn">
              Try Again
            </button>
          </div>
        )}

        <div className="meta-grid">
          <div className="meta-card glass-card">
            <span className="m-label">Confidence</span>
            <span className="m-val">{Math.round(transcriptionResult.confidence * 100)}%</span>
          </div>
          <div className="meta-card glass-card">
            <span className="m-label">Speaking Pace</span>
            <span className="m-val">{transcriptionResult.speechMetrics.wordsPerMinute} WPM</span>
          </div>
          <div className="meta-card glass-card">
            <span className="m-label">Total Words</span>
            <span className="m-val">{transcriptionResult.speechMetrics.wordCount}</span>
          </div>
        </div>
        <style jsx>{styles}</style>
      </div>
    );
  }

  return (
    <div className="voice-recorder idle glass-card fade-in">
      <div className="recorder-hero">
        <header className="hero-header">
          <span className="badge-pill">Acoustic Input</span>
          {isRecording ? (
            <div className="live-status">
              <div className="pulse-dot"></div>
              <h3 className="danger">Recording Session</h3>
              <span className="timer-val">{formatTime(recordingTime)}</span>
              <span className="speech-status">{speechStatus}</span>
            </div>
          ) : (
            <div className="ready-status">
              <h3>Voice Acquisition</h3>
              <p>Initialize the stream to capture your unique linguistic profile.</p>
            </div>
          )}
        </header>

        <div className="visualizer-stage glass-card">
          {liveTranscript ? (
            <div className="live-transcript-view fade-in">
              <p>{liveTranscript}</p>
            </div>
          ) : (
            <div className="v-bars">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="v-bar"
                  style={{
                    height: isRecording ? `${Math.max(10, Math.random() * 80)}%` : '5%',
                    backgroundColor: isRecording ? 'var(--danger)' : 'var(--border-glass)'
                  }}
                ></div>
              ))}
            </div>
          )}
        </div>

        <div className="recorder-actions">
          {!isRecording ? (
            <button onClick={startRecording} className="record-trigger start">
              <span className="icon">🎤</span> Initialize Capture
            </button>
          ) : (
            <button onClick={stopRecording} className="record-trigger stop">
              <span className="icon">⏹️</span> Finalize Feed
            </button>
          )}
        </div>

        {uploadError && (
          <div className="status-error fade-in">
            <span>⚠️ {uploadError}</span>
            <button onClick={clearError} className="text-link">Retry</button>
          </div>
        )}

        <footer className="recorder-guidance glass-card">
          <h6>Acquisition Protocol</h6>
          <ul>
            <li>Maintain a natural, unscripted conversational pace.</li>
            <li>Utilize authentic idioms and common vocational syntax.</li>
            <li>Aim for 30-60 seconds of continuous acoustic stream.</li>
          </ul>
        </footer>
      </div>
      <style jsx>{styles}</style>
    </div>
  );
};

const styles = `
    .voice-recorder { max-width: 650px; margin: 0 auto; padding: var(--space-xl) !important; }

    .badge-pill { display: inline-block; background: rgba(99, 102, 241, 0.1); color: var(--primary); padding: 0.2rem 0.8rem; border-radius: var(--radius-full); font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; border: 1px solid rgba(99, 102, 241, 0.2); margin-bottom: 1rem; }
    .badge-pill.success { background: rgba(16, 185, 129, 0.1); color: var(--accent); border-color: rgba(16, 185, 129, 0.2); }

    .processing-hero { text-align: center; padding: var(--space-xl) 0; }
    .processing-hero h3 { font-size: 1.8rem; margin: var(--space-md) 0; color: var(--text-primary); }
    .processing-hero p { color: var(--text-secondary); opacity: 0.7; }

    .hero-header { text-align: center; margin-bottom: var(--space-xl); }
    .hero-header h3 { font-size: 2rem; margin: 0.5rem 0; color: var(--text-primary); }
    .hero-header h3.danger { color: var(--danger); text-shadow: 0 0 15px rgba(239, 68, 68, 0.3); }
    .hero-header p { color: var(--text-secondary); opacity: 0.7; }

    .live-status { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
    .timer-val { font-size: 2.5rem; font-weight: 800; font-family: 'Courier New', monospace; color: var(--text-primary); }
    .pulse-dot { width: 10px; height: 10px; background: var(--danger); border-radius: 50%; box-shadow: 0 0 10px var(--danger); animation: recorder-pulse 1.5s infinite; }
    .speech-status { font-size: 0.85rem; color: var(--text-secondary); font-weight: 600; background: rgba(99, 102, 241, 0.1); padding: 0.3rem 1rem; border-radius: var(--radius-full); margin-top: 0.5rem; }

    .live-transcript-view { padding: var(--space-md); text-align: center; max-height: 100px; overflow-y: auto; width: 100%; }
    .live-transcript-view p { font-size: 0.95rem; color: var(--text-primary); font-style: italic; margin: 0; line-height: 1.4; }

    .visualizer-stage { height: 120px; background: rgba(0,0,0,0.3) !important; margin: var(--space-xl) 0; display: flex; align-items: center; justify-content: center; }
    .v-bars { display: flex; align-items: flex-end; gap: 6px; height: 60px; width: 100%; justify-content: center; }
    .v-bar { width: 4px; border-radius: 2px; transition: height 0.15s ease-out; }

    .record-trigger { padding: 1rem 3.5rem; border-radius: var(--radius-full); border: none; font-size: 1.2rem; font-weight: 800; color: white; cursor: pointer; display: flex; align-items: center; gap: 1rem; margin: 0 auto; transition: all 0.2s; }
    .record-trigger.start { background: var(--primary); box-shadow: 0 10px 30px rgba(99, 102, 241, 0.3); }
    .record-trigger.stop { background: var(--danger); box-shadow: 0 10px 30px rgba(239, 68, 68, 0.3); }
    .record-trigger:hover { transform: translateY(-4px); }

    .status-error { margin-top: var(--space-xl); padding: var(--space-md); background: rgba(239, 68, 68, 0.1); color: var(--danger); border-radius: var(--radius-md); border-left: 3px solid var(--danger); display: flex; justify-content: center; align-items: center; gap: 1rem; }
    .text-link { background: none; border: none; color: var(--danger); text-decoration: underline; font-weight: 800; cursor: pointer; }

    .recorder-guidance { margin-top: var(--space-xl); background: rgba(255,255,255,0.02) !important; text-align: left; padding: var(--space-lg) !important; }
    .recorder-guidance h6 { font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: var(--primary); margin-bottom: 0.8rem; }
    .recorder-guidance ul { padding-left: 1.2rem; color: var(--text-secondary); font-size: 0.85rem; line-height: 1.6; }

    /* Results */
    .results-header { text-align: center; margin-bottom: var(--space-xl); }
    .transcript-box { background: rgba(0,0,0,0.2) !important; margin-bottom: var(--space-xl); text-align: left; }
    .box-label { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; color: var(--accent); opacity: 0.8; }
    .transcript-text { font-size: 1.1rem; color: var(--text-primary); font-style: italic; margin-top: 0.5rem; line-height: 1.6; }

    .meta-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-md); margin-bottom: var(--space-xl); }
    .meta-card { text-align: center; padding: var(--space-md) !important; }
    .m-label { font-size: 0.6rem; font-weight: 800; text-transform: uppercase; color: var(--text-secondary); opacity: 0.6; display: block; }
    .m-val { font-size: 1.4rem; font-weight: 800; color: var(--text-primary); }

    .extraction-pane { border-top: 1px solid var(--border-glass); padding-top: var(--space-xl); text-align: left; }
    .pane-header h5 { font-size: 0.8rem; font-weight: 800; text-transform: uppercase; color: var(--text-primary); margin-bottom: 1rem; }
    .phrase-stack { list-style: none; padding: 0; margin-bottom: var(--space-xl); }
    .phrase-stack li { padding: 0.8rem 1rem; background: rgba(255,255,255,0.03); border-radius: var(--radius-md); border-left: 3px solid var(--primary); color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem; font-style: italic; }

    .wide-btn { width: 100%; padding: 1.2rem; }

    @keyframes recorder-pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.5); opacity: 0.5; } 100% { transform: scale(1); opacity: 1; } }

    @media (max-width: 600px) { .meta-grid { grid-template-columns: 1fr; } }
`;
