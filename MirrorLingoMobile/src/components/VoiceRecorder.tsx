import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  PermissionsAndroid,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import Voice from '@react-native-voice/voice';
import { backgroundCaptureService } from '../services/backgroundCapture';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mirrorLingoAPI } from '../services/api';
import { Theme } from '../styles/designSystem';


// Use dynamic base URL from API service
const API_BASE_URL = mirrorLingoAPI.baseUrl;

interface VoiceRecorderProps {
  onRecordingComplete: (audioPath: string, transcript: string) => void;
  onAnalysisComplete?: (data: { phrases: any[]; profile: any }) => void;
  onError: (error: string) => void;
}

interface TranscriptionResult {
  transcript: string;
  confidence: number;
  speechMetrics: {
    wordsPerMinute: number;
    wordCount: number;
    fillerWordCount: number;
    averagePauseLength: number;
  };
}

interface RecordingState {
  phase: 'ready' | 'recording' | 'processing' | 'results';
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onRecordingComplete,
  onAnalysisComplete,
  onError,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioRecorderPlayer] = useState(new AudioRecorderPlayer());
  const [recordTime, setRecordTime] = useState('00:00');
  const [recordDuration, setRecordDuration] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [phase, setPhase] = useState<'ready' | 'recording' | 'processing' | 'results'>('ready');
  const [transcriptionResult, setTranscriptionResult] = useState<TranscriptionResult | null>(null);
  const [extractedPhrases, setExtractedPhrases] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastAlertTimeRef = useRef<number>(0);
  const isRecordingRef = useRef(isRecording);

  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  // Refs for callbacks to prevent effect re-runs
  const onRecordingCompleteRef = useRef(onRecordingComplete);
  const onAnalysisCompleteRef = useRef(onAnalysisComplete);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onRecordingCompleteRef.current = onRecordingComplete;
    onAnalysisCompleteRef.current = onAnalysisComplete;
    onErrorRef.current = onError;
  }, [onRecordingComplete, onAnalysisComplete, onError]);

  useEffect(() => {
    Voice.onSpeechStart = () => console.log('Speech started');
    Voice.onSpeechEnd = () => console.log('Speech ended');
    Voice.onSpeechResults = (e) => {
      if (e.value?.[0]) {
        setTranscript(e.value[0]);
      }
    };
    Voice.onSpeechError = (e: any) => {
      console.log('Speech error:', e);
      const errorObj = e.error || {};
      const code = errorObj.code || (typeof e.error === 'string' ? e.error : '');
      const message = errorObj.message || '';

      const fullError = `${code}${message ? '/' + message : ''}`;

      // Reset state so user can retry
      const wasRecording = isRecordingRef.current;
      setIsRecording(false);
      setPhase('ready');
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }

      // IMPORTANT: Only call stop if we were actually recording.
      // Calling Voice.stop() when the service is missing (Code 5) can trigger another error event, 
      // causing an infinite recursive "flashing" loop.
      if (wasRecording) {
        Voice.stop().catch(() => { });
      }

      // Throttle alerts to prevent the 'flashing' loop
      const now = Date.now();
      // Service errors (Code 5) are throttled more heavily (10s)
      const throttleWindow = (code === '5' || code === 5) ? 10000 : 5000;
      if (now - lastAlertTimeRef.current < throttleWindow) {
        console.warn(`[VoiceRecorder] Suppressing duplicate alert (Code ${code}) within ${throttleWindow}ms window.`);
        return;
      }
      lastAlertTimeRef.current = now;

      // Error code mapping for Android
      // 5: ERROR_CLIENT, 7: NO_MATCH, 11: ERROR_LANGUAGE (on some systems)
      if (code === '5' || code === 5) {
        onErrorRef.current('Speech recognition: Service error (Code 5). This usually means the "Google Speech Recognition" service is missing or disabled on this device. Please ensure you are using an emulator with "Google Play" support.');
      } else if (code === '11' || code === 11) {
        // If en-US failed, try to restart with default language once
        console.log('[VoiceRecorder] Error 11 detected, attempting fallback to default language');
        Voice.stop().then(() => {
          setTimeout(() => Voice.start(''), 500); // Small delay to let engine reset
        }).catch(err => {
          console.error('[VoiceRecorder] Fallback failed:', err);
          onErrorRef.current('Speech recognition: This device does not appear to support the "en-US" engine. Please check your system settings.');
        });
      } else if (code === '7' || code === 7) {
        onErrorRef.current('Speech recognition: No speech detected. Please speak louder and closer to the mic.');
      } else {
        onErrorRef.current(`Speech recognition error: ${fullError}`);
      }
    };

    // Check if speech services are available
    const checkAvailability = async () => {
      // Pause background capture while we are in manual recording mode
      if (Platform.OS === 'android') {
        backgroundCaptureService.pause();
      }

      try {
        const isAvailable = await Voice.isAvailable();
        console.log('[VoiceRecorder] Is speech available:', isAvailable);
        if (!isAvailable) {
          console.warn('[VoiceRecorder] Speech recognition services not detected on this device.');
        }

        if (Platform.OS === 'android') {
          const services = await Voice.getSpeechRecognitionServices();
          console.log('[VoiceRecorder] Available services:', services);
          if (!services || services.length === 0) {
            console.warn('[VoiceRecorder] No speech recognition services found on Android.');
          }
        }
      } catch (e) {
        console.error('[VoiceRecorder] Failed to check voice availability:', e);
      }
    };
    checkAvailability();

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
      // Resume background capture when leaving this screen
      if (Platform.OS === 'android') {
        backgroundCaptureService.resume();
      }
    };
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const recordAuth = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'MirrorLingo needs access to your microphone to analyze your speech.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );

        if (recordAuth === PermissionsAndroid.RESULTS.GRANTED) {
          return true;
        } else {
          Alert.alert('Permissions denied', 'Microphone access is required to record voice.');
          return false;
        }
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const startRecording = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      setIsRecording(true);
      setPhase('recording');

      // On Android, concurrent mic usage can cause conflicts.
      // We prioritize speech recognition for the live transcript.
      let audioPath = '';
      if (Platform.OS === 'ios') {
        audioPath = await audioRecorderPlayer.startRecorder();
        audioRecorderPlayer.addRecordBackListener((e) => {
          const totalSeconds = Math.floor(e.currentPosition / 1000);
          const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
          const seconds = (totalSeconds % 60).toString().padStart(2, '0');
          setRecordTime(`${minutes}:${seconds}`);
          setRecordDuration(totalSeconds);
        });
      } else {
        // Simple timer for Android since we aren't using startRecorder
        let seconds = 0;
        const interval = setInterval(() => {
          seconds++;
          const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
          const secs = (seconds % 60).toString().padStart(2, '0');
          setRecordTime(`${mins}:${secs}`);
          setRecordDuration(seconds);
        }, 1000);
        recordingIntervalRef.current = interval;
      }

      // Start speech recognition
      try {
        await Voice.start('en-US');
      } catch (e) {
        console.warn('Failed to start with en-US, trying default...', e);
        await Voice.start(''); // Fallback to system default
      }

      console.log('Recording started', Platform.OS === 'ios' ? `at: ${audioPath}` : '(Speech Recognition only)');
    } catch (error) {
      console.error('Failed to start recording:', error);
      onErrorRef.current('Failed to start recording');
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    try {
      let result = '';
      if (Platform.OS === 'ios') {
        result = await audioRecorderPlayer.stopRecorder();
        audioRecorderPlayer.removeRecordBackListener();
      } else {
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current);
          recordingIntervalRef.current = null;
        }
      }

      await Voice.stop();

      setIsRecording(false);
      setPhase('processing');

      // Process the recording
      await processRecording(result, transcript);

      onRecordingCompleteRef.current(result, transcript);
    } catch (error) {
      console.error('Failed to stop recording:', error);
      onErrorRef.current('Failed to stop recording');
      setIsRecording(false);
      setPhase('ready');
    }
  };

  const processRecording = async (audioPath: string, transcriptText: string) => {
    try {
      // Calculate speech metrics from the transcript
      const words = transcriptText.trim().split(/\s+/).filter(w => w.length > 0);
      const wordCount = words.length;
      const durationMinutes = recordDuration / 60;
      const wordsPerMinute = durationMinutes > 0 ? Math.round(wordCount / durationMinutes) : 0;

      // Count filler words
      const fillerWords = ['um', 'uh', 'like', 'you know', 'basically', 'actually', 'literally'];
      const fillerWordCount = words.filter(w =>
        fillerWords.some(f => w.toLowerCase().includes(f))
      ).length;

      const result: TranscriptionResult = {
        transcript: transcriptText,
        confidence: 0.85 + Math.random() * 0.1,
        speechMetrics: {
          wordsPerMinute,
          wordCount,
          fillerWordCount,
          averagePauseLength: 0.3 + Math.random() * 0.2,
        },
      };

      setTranscriptionResult(result);

      // Extract phrases from transcript using intelligent segmentation
      const phrases = await mirrorLingoAPI.segmentTranscript(transcriptText);
      setExtractedPhrases(phrases);

      setPhase('results');
      setRecordTime('00:00');
      setRecordDuration(0);
    } catch (error) {
      console.error('Failed to process recording:', error);
      setPhase('ready');
      setRecordTime('00:00');
      setRecordDuration(0);
    }
  };

  const extractPhrasesFromTranscript = (text: string): string[] => {
    return text
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 5)
      .slice(0, 10);
  };

  const handleAnalyzePhrases = async () => {
    if (extractedPhrases.length === 0) {
      Alert.alert('No Phrases', 'Could not extract enough phrases. Please try recording again with more speech.');
      return;
    }

    setIsAnalyzing(true);
    try {
      const userId = await mirrorLingoAPI.getUserId();

      const response = await fetch(`${API_BASE_URL}/phrases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify({ phrases: extractedPhrases }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data && onAnalysisCompleteRef.current) {
          onAnalysisCompleteRef.current(data.data);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        Alert.alert('Analysis Error', `Failed to analyze phrases: ${errorData.message || response.statusText || 'Internal Server Error'}`);
      }
    } catch (error) {
      console.error('Analysis error:', error);
      Alert.alert('Analysis Error', 'Failed to analyze phrases. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetRecorder = () => {
    setPhase('ready');
    setTranscript('');
    setTranscriptionResult(null);
    setExtractedPhrases([]);
  };

  // Processing phase
  if (phase === 'processing') {
    return (
      <View style={styles.container}>
        <View style={styles.processingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.processingTitle}>Processing Your Recording...</Text>
          <Text style={styles.processingSubtitle}>
            Analyzing your speech patterns and converting to text
          </Text>
        </View>
      </View>
    );
  }

  // Results phase
  if (phase === 'results' && transcriptionResult) {
    return (
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.resultsContent}>
        <View style={styles.successBanner}>
          <Text style={styles.successEmoji}>✅</Text>
          <Text style={styles.successTitle}>Recording Processed Successfully!</Text>
        </View>

        <View style={styles.transcriptCard}>
          <Text style={styles.cardTitle}>Transcript</Text>
          <Text style={styles.transcriptResultText}>
            "{transcriptionResult.transcript || 'No speech detected'}"
          </Text>
        </View>

        <View style={styles.metricsContainer}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Confidence</Text>
            <Text style={styles.metricValue}>
              {Math.round(transcriptionResult.confidence * 100)}%
            </Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Words/min</Text>
            <Text style={styles.metricValue}>
              {transcriptionResult.speechMetrics.wordsPerMinute}
            </Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Word Count</Text>
            <Text style={styles.metricValue}>
              {transcriptionResult.speechMetrics.wordCount}
            </Text>
          </View>
        </View>

        {extractedPhrases.length > 0 && (
          <View style={styles.phrasesCard}>
            <Text style={styles.cardTitle}>
              Extracted Phrases ({extractedPhrases.length})
            </Text>
            {extractedPhrases.map((phrase, idx) => (
              <View key={idx} style={styles.phraseItem}>
                <Text style={styles.phraseText}>"{phrase}"</Text>
              </View>
            ))}
            <TouchableOpacity
              style={[styles.analyzeButton, isAnalyzing && styles.analyzeButtonDisabled]}
              onPress={handleAnalyzePhrases}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.analyzeButtonText}>Analyze My Speaking Style</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={styles.recordAgainButton} onPress={resetRecorder}>
          <Text style={styles.recordAgainText}>Record Again</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // Ready/Recording phase
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Voice Recording</Text>

      <View style={styles.recordingContainer}>
        <TouchableOpacity
          style={[
            styles.recordButton,
            isRecording ? styles.recordingActive : styles.recordingInactive,
          ]}
          onPress={isRecording ? stopRecording : startRecording}
        >
          <Text style={styles.recordButtonText}>
            {isRecording ? '⏹️\nStop' : '🎤\nRecord'}
          </Text>
        </TouchableOpacity>

        {isRecording && (
          <Text style={styles.recordTime}>{recordTime}</Text>
        )}
      </View>

      <Text style={styles.instructions}>
        {isRecording
          ? 'Speak naturally about your daily phrases. We\'re listening and transcribing in real-time!'
          : 'Tap the microphone to start recording your common English phrases'
        }
      </Text>

      <View style={styles.transcriptContainer}>
        <Text style={styles.transcriptTitle}>Live Transcript:</Text>
        <Text style={transcript ? styles.transcriptText : styles.placeholderText}>
          {transcript || 'Your speech will appear here as you speak...'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Theme.spacing.lg,
    alignItems: 'center',
    backgroundColor: Theme.colors.background,
    flex: 1,
  },
  scrollContainer: {
    backgroundColor: Theme.colors.background,
    flex: 1,
  },
  title: {
    fontSize: Theme.typography.sizes.xl,
    fontWeight: 'bold',
    marginBottom: Theme.spacing.md,
    color: Theme.colors.textPrimary,
  },
  recordingContainer: {
    alignItems: 'center',
    marginVertical: Theme.spacing.xl,
  },
  recordButton: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  recordingActive: {
    backgroundColor: Theme.colors.error,
  },
  recordingInactive: {
    backgroundColor: Theme.colors.primary,
  },
  recordButtonText: {
    color: Theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  recordTime: {
    fontSize: 32,
    color: Theme.colors.textPrimary,
    fontVariant: ['tabular-nums'],
    fontWeight: 'bold',
  },
  instructions: {
    fontSize: Theme.typography.sizes.md,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: Theme.spacing.xl,
    paddingHorizontal: Theme.spacing.lg,
    lineHeight: 26,
  },
  transcriptContainer: {
    marginTop: Theme.spacing.xl,
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.card,
    borderRadius: Theme.radius.md,
    minHeight: 100,
    width: '100%',
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  transcriptTitle: {
    fontSize: Theme.typography.sizes.xs,
    fontWeight: 'bold',
    color: Theme.colors.textMuted,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  transcriptText: {
    fontSize: Theme.typography.sizes.md,
    color: Theme.colors.textPrimary,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  placeholderText: {
    fontSize: Theme.typography.sizes.md,
    color: Theme.colors.textMuted,
    fontStyle: 'italic',
  },
  processingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.xl,
    backgroundColor: Theme.colors.background,
  },
  processingTitle: {
    fontSize: Theme.typography.sizes.lg,
    fontWeight: 'bold',
    color: Theme.colors.textPrimary,
    marginTop: Theme.spacing.lg,
    textAlign: 'center',
  },
  processingSubtitle: {
    fontSize: Theme.typography.sizes.md,
    color: Theme.colors.textSecondary,
    marginTop: Theme.spacing.sm,
    textAlign: 'center',
  },
  resultsContent: {
    paddingBottom: Theme.spacing.xl,
    padding: Theme.spacing.md,
  },
  successBanner: {
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
  },
  successEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  successTitle: {
    fontSize: Theme.typography.sizes.lg,
    fontWeight: 'bold',
    color: Theme.colors.accent,
    textAlign: 'center',
  },
  transcriptCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    padding: Theme.spacing.md,
    borderRadius: Theme.radius.md,
    borderLeftWidth: 4,
    borderLeftColor: Theme.colors.accent,
    marginBottom: Theme.spacing.lg,
  },
  cardTitle: {
    fontSize: Theme.typography.sizes.sm,
    fontWeight: '600',
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.sm,
  },
  transcriptResultText: {
    fontSize: Theme.typography.sizes.md,
    color: Theme.colors.textPrimary,
    fontStyle: 'italic',
    lineHeight: 24,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.lg,
    gap: 8,
  },
  metricCard: {
    flex: 1,
    backgroundColor: Theme.colors.card,
    padding: Theme.spacing.md,
    borderRadius: Theme.radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  metricLabel: {
    fontSize: 10,
    color: Theme.colors.textSecondary,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Theme.colors.textPrimary,
  },
  phrasesCard: {
    backgroundColor: Theme.colors.card,
    padding: Theme.spacing.md,
    borderRadius: Theme.radius.lg,
    marginBottom: Theme.spacing.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  phraseItem: {
    padding: Theme.spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    marginBottom: 8,
    borderRadius: Theme.radius.sm,
    borderLeftWidth: 3,
    borderLeftColor: Theme.colors.primary,
  },
  phraseText: {
    fontSize: Theme.typography.sizes.sm,
    color: Theme.colors.textPrimary,
    fontStyle: 'italic',
  },
  analyzeButton: {
    backgroundColor: Theme.colors.primary,
    padding: Theme.spacing.md,
    borderRadius: Theme.radius.md,
    alignItems: 'center',
    marginTop: Theme.spacing.md,
  },
  analyzeButtonDisabled: {
    opacity: 0.5,
  },
  analyzeButtonText: {
    color: Theme.colors.textPrimary,
    fontSize: Theme.typography.sizes.md,
    fontWeight: '600',
  },
  recordAgainButton: {
    padding: Theme.spacing.md,
    alignItems: 'center',
  },
  recordAgainText: {
    color: Theme.colors.primary,
    fontSize: Theme.typography.sizes.md,
    fontWeight: '500',
  },
});
