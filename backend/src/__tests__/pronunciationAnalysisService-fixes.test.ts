import { PronunciationAnalysisService } from '../services/pronunciationAnalysisService';
import { SpanishAccent, PronunciationRequest } from '../types/pronunciation';

describe('PronunciationAnalysisService - Code Review Fixes', () => {
  describe('Input Sanitization and Validation', () => {
    it('should handle valid pronunciation analysis request', async () => {
      const request: PronunciationRequest = {
        transcription: 'hola',
        targetPhrase: 'Hola',
        userId: 'test-user',
        confidence: 0.8
      };

      const result = await PronunciationAnalysisService.analyzePronunciation(request, SpanishAccent.NEUTRAL);
      
      expect(result).toBeDefined();
      expect(result.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.overallScore).toBeLessThanOrEqual(100);
      expect(result.targetAccent).toBe(SpanishAccent.NEUTRAL);
    });

    it('should handle different accent profiles', async () => {
      const request: PronunciationRequest = {
        transcription: 'gracias',
        targetPhrase: 'Gracias',
        userId: 'test-user',
        confidence: 0.9
      };

      const neutralResult = await PronunciationAnalysisService.analyzePronunciation(request, SpanishAccent.NEUTRAL);
      const spainResult = await PronunciationAnalysisService.analyzePronunciation(request, SpanishAccent.SPAIN);
      
      expect(neutralResult.targetAccent).toBe(SpanishAccent.NEUTRAL);
      expect(spainResult.targetAccent).toBe(SpanishAccent.SPAIN);
      expect(neutralResult.detailedFeedback.accentFeedback).toBeDefined();
      expect(spainResult.detailedFeedback.accentFeedback).toBeDefined();
    });

    it('should provide phoneme analysis', async () => {
      const request: PronunciationRequest = {
        transcription: 'perro',
        targetPhrase: 'Perro',
        userId: 'test-user',
        confidence: 0.7
      };

      const result = await PronunciationAnalysisService.analyzePronunciation(request, SpanishAccent.MEXICO);
      
      expect(result.detailedFeedback.phonemeAnalysis).toBeDefined();
      expect(Array.isArray(result.detailedFeedback.phonemeAnalysis)).toBe(true);
    });

    it('should handle empty or invalid input gracefully', async () => {
      const request: PronunciationRequest = {
        transcription: '',
        targetPhrase: 'Hola',
        userId: 'test-user',
        confidence: 0.5
      };

      const result = await PronunciationAnalysisService.analyzePronunciation(request, SpanishAccent.NEUTRAL);
      
      expect(result).toBeDefined();
      expect(result.transcription).toBe('Audio processing not available');
    });
  });

  describe('Accent Profile Integration', () => {
    it('should provide accent-specific feedback', async () => {
      const request: PronunciationRequest = {
        transcription: 'lluvia',
        targetPhrase: 'Lluvia',
        userId: 'test-user',
        confidence: 0.8
      };

      const argentinaResult = await PronunciationAnalysisService.analyzePronunciation(request, SpanishAccent.ARGENTINA);
      
      expect(argentinaResult.detailedFeedback.accentFeedback).toContain('Practicing Rioplatense Spanish from Argentina/Uruguay');
      // Verify that accent-specific tips are provided
      expect(argentinaResult.detailedFeedback.specificTips.length).toBeGreaterThan(0);
    });
  });
});
