import { renderHook } from '@testing-library/react';
import { usePronunciationAnalysis } from '../usePronunciationAnalysis';

// Mock the speech recognition utilities
jest.mock('../../utils/speechRecognitionUtils', () => ({
  isSpeechRecognitionSupported: jest.fn(() => true),
  requestMicrophonePermission: jest.fn(() => Promise.resolve(true))
}));

describe('usePronunciationAnalysis', () => {
  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => usePronunciationAnalysis('test-user'));

    expect(result.current.isRecording).toBe(false);
    expect(result.current.isAnalyzing).toBe(false);
    expect(result.current.isSupported).toBe(true);
    expect(result.current.currentTranscript).toBe('');
    expect(result.current.analysisResult).toBe(null);
    expect(result.current.error).toBe(null);
    expect(result.current.audioLevel).toBe(0);
  });

  it('should provide all required methods', () => {
    const { result } = renderHook(() => usePronunciationAnalysis('test-user'));

    expect(typeof result.current.startRecording).toBe('function');
    expect(typeof result.current.stopRecording).toBe('function');
    expect(typeof result.current.clearResults).toBe('function');
    expect(typeof result.current.requestPermission).toBe('function');
  });
});
