import { PronunciationAnalysisService } from '../services/pronunciationAnalysisService';
import { PronunciationRequest } from '../types/pronunciation';

describe('PronunciationAnalysisService', () => {
  it('should analyze pronunciation successfully', async () => {
    const request: PronunciationRequest = {
      transcription: 'Hola como estas',
      targetPhrase: 'Hola, ¿cómo estás?',
      userId: 'test-user',
      confidence: 0.8
    };

    const result = await PronunciationAnalysisService.analyzePronunciation(request);

    expect(result.overallScore).toBeGreaterThan(0);
    expect(result.overallScore).toBeLessThanOrEqual(100);
    expect(result.accuracy).toBeGreaterThan(0);
    expect(result.fluency).toBeGreaterThan(0);
    expect(result.pronunciation).toBeGreaterThan(0);
    expect(result.transcription).toBe('Hola como estas');
    expect(result.targetPhrase).toBe('Hola, ¿cómo estás?');
    expect(result.detailedFeedback).toBeDefined();
    expect(result.detailedFeedback.strengths).toBeInstanceOf(Array);
    expect(result.detailedFeedback.improvements).toBeInstanceOf(Array);
    expect(result.detailedFeedback.specificTips).toBeInstanceOf(Array);
  });

  it('should handle empty transcription gracefully', async () => {
    const request: PronunciationRequest = {
      transcription: '',
      targetPhrase: 'Hola',
      userId: 'test-user',
      confidence: 0.5
    };

    const result = await PronunciationAnalysisService.analyzePronunciation(request);

    expect(result.overallScore).toBeGreaterThanOrEqual(0);
    expect(result.detailedFeedback.improvements.length).toBeGreaterThan(0);
  });
});
