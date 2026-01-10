// Web Speech API utilities for real-time pronunciation analysis

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
  alternatives: Array<{
    transcript: string;
    confidence: number;
  }>;
}

interface SpeechRecognitionConfig {
  language: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
}

// Browser compatibility check
export const isSpeechRecognitionSupported = (): boolean => {
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
};

// Get browser-specific SpeechRecognition constructor
export const getSpeechRecognition = (): any => {
  if ('webkitSpeechRecognition' in window) {
    return (window as any).webkitSpeechRecognition;
  }
  if ('SpeechRecognition' in window) {
    return (window as any).SpeechRecognition;
  }
  return null;
};

// Create configured speech recognition instance
export const createSpeechRecognition = (config: SpeechRecognitionConfig): any => {
  const SpeechRecognition = getSpeechRecognition();

  if (!SpeechRecognition) {
    throw new Error('Speech recognition not supported in this browser');
  }

  const recognition = new SpeechRecognition();

  // Configure recognition settings
  recognition.lang = config.language;
  recognition.continuous = config.continuous;
  recognition.interimResults = config.interimResults;
  recognition.maxAlternatives = config.maxAlternatives;

  return recognition;
};

// Process speech recognition results
export const processSpeechResults = (event: SpeechRecognitionEvent): SpeechRecognitionResult[] => {
  const results: SpeechRecognitionResult[] = [];

  for (let i = event.resultIndex; i < event.results.length; i++) {
    const result = event.results[i];
    const alternatives = [];

    // Extract alternatives
    for (let j = 0; j < result.length; j++) {
      alternatives.push({
        transcript: result[j].transcript,
        confidence: result[j].confidence
      });
    }

    results.push({
      transcript: result[0].transcript,
      confidence: result[0].confidence,
      isFinal: result.isFinal,
      alternatives
    });
  }

  return results;
};

// Get best transcript from results
export const getBestTranscript = (results: SpeechRecognitionResult[]): {
  transcript: string;
  confidence: number;
  alternatives: Array<{ transcript: string; confidence: number }>;
} => {
  if (results.length === 0) {
    return {
      transcript: '',
      confidence: 0,
      alternatives: []
    };
  }

  // Find the result with highest confidence
  const bestResult = results.reduce((best, current) =>
    current.confidence > best.confidence ? current : best
  );

  return {
    transcript: bestResult.transcript,
    confidence: bestResult.confidence,
    alternatives: bestResult.alternatives
  };
};

// Handle speech recognition errors
export const handleSpeechError = (error: SpeechRecognitionErrorEvent): string => {
  switch (error.error) {
    case 'no-speech':
      return 'No speech detected. Please try speaking again.';
    case 'audio-capture':
      return 'Microphone not accessible. Please check permissions.';
    case 'not-allowed':
      return 'Microphone permission denied. Please allow microphone access.';
    case 'network':
      return 'Network error. Please check your connection.';
    case 'service-not-allowed':
      return 'Speech recognition service not available.';
    case 'bad-grammar':
      return 'Speech recognition grammar error.';
    case 'language-not-supported':
      return 'Language not supported for speech recognition.';
    default:
      return `Speech recognition error: ${error.error}`;
  }
};

// Request microphone permission
export const requestMicrophonePermission = async (): Promise<boolean> => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Stop the stream immediately as we just needed permission
    stream.getTracks().forEach(track => track.stop());
    return true;
  } catch (error) {
    console.error('Microphone permission denied:', error);
    return false;
  }
};

// Spanish-specific speech recognition configuration
export const getSpanishSpeechConfig = (): SpeechRecognitionConfig => ({
  language: 'es-ES', // Spanish (Spain) - most comprehensive
  continuous: false, // Single phrase recognition
  interimResults: true, // Show partial results
  maxAlternatives: 3 // Get multiple alternatives for better analysis
});

// English-specific speech recognition configuration
export const getEnglishSpeechConfig = (): SpeechRecognitionConfig => ({
  language: 'en-US',
  continuous: true,
  interimResults: true,
  maxAlternatives: 3
});

// Pronunciation-specific speech recognition configuration
export const getPronunciationSpeechConfig = (): SpeechRecognitionConfig => ({
  language: 'es-ES',
  continuous: false,
  interimResults: false, // Only final results for pronunciation analysis
  maxAlternatives: 5 // More alternatives for better pronunciation comparison
});

// Clean transcript for pronunciation analysis
export const cleanTranscriptForAnalysis = (transcript: string): string => {
  return transcript
    .toLowerCase()
    .trim()
    .replace(/[.,!?;:]/g, '') // Remove punctuation
    .replace(/\s+/g, ' '); // Normalize whitespace
};

// Check if transcript is likely Spanish
export const isLikelySpanish = (transcript: string): boolean => {
  const spanishIndicators = ['ñ', 'á', 'é', 'í', 'ó', 'ú', 'ü', 'll', 'rr'];
  const spanishWords = ['el', 'la', 'de', 'que', 'y', 'en', 'un', 'es', 'se', 'no', 'te', 'lo', 'le', 'da', 'su', 'por', 'son', 'con', 'para', 'al', 'del', 'los', 'las'];

  const text = transcript.toLowerCase();

  // Check for Spanish-specific characters
  const hasSpanishChars = spanishIndicators.some(indicator => text.includes(indicator));

  // Check for common Spanish words
  const words = text.split(' ');
  const spanishWordCount = words.filter(word => spanishWords.includes(word)).length;
  const spanishWordRatio = spanishWordCount / words.length;

  return hasSpanishChars || spanishWordRatio > 0.3;
};

// Browser-specific optimizations
export const optimizeForBrowser = (): {
  isChrome: boolean;
  isFirefox: boolean;
  isSafari: boolean;
  recommendations: string[];
} => {
  const userAgent = navigator.userAgent;
  const isChrome = /Chrome/.test(userAgent) && /Google Inc/.test(navigator.vendor);
  const isFirefox = /Firefox/.test(userAgent);
  const isSafari = /Safari/.test(userAgent) && /Apple Computer/.test(navigator.vendor);

  const recommendations: string[] = [];

  if (isChrome) {
    recommendations.push('Chrome provides the best speech recognition support');
  } else if (isFirefox) {
    recommendations.push('Firefox has limited speech recognition support');
    recommendations.push('Consider using Chrome for better pronunciation analysis');
  } else if (isSafari) {
    recommendations.push('Safari has partial speech recognition support');
    recommendations.push('Some features may be limited');
  } else {
    recommendations.push('Speech recognition support may be limited in this browser');
    recommendations.push('For best results, use Chrome or Edge');
  }

  return { isChrome, isFirefox, isSafari, recommendations };
};
