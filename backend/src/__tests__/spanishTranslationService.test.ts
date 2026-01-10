import { SpanishTranslationService } from '../services/spanishTranslationService';
import { BedrockService } from '../services/bedrockService';
import { IdiolectProfile, ToneLevel, FormalityLevel, IntentCategory } from '../models/phrase';

jest.mock('../services/bedrockService');

const mockProfile: IdiolectProfile = {
  userId: 'test-user',
  overallTone: ToneLevel.POLITE,
  overallFormality: FormalityLevel.SEMI_FORMAL,
  commonPatterns: [{ type: 'politeness_markers' as any, description: 'Uses please/thank you', examples: ['please'], frequency: 0.8 }],
  preferredIntents: [IntentCategory.WORK],
  analysisCount: 1,
  lastUpdated: new Date().toISOString()
};

describe('SpanishTranslationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('translates phrase with dual translations', async () => {
    (BedrockService.invokeModelPublic as jest.Mock).mockResolvedValue(JSON.stringify({
      literal: '¿Podrías echar un vistazo a esto?',
      natural: '¿Me podrías revisar esto?',
      explanation: 'Natural version is more commonly used',
      confidence: 0.9,
      formalityLevel: 'formal'
    }));

    const result = await SpanishTranslationService.translatePhrase('Could you take a look at this?', mockProfile);

    expect(result.englishPhrase).toBe('Could you take a look at this?');
    expect(result.translation.literal).toBeDefined();
    expect(result.translation.natural).toBeDefined();
    expect(result.styleMatching).toBeDefined();
  });

  it('handles translation errors gracefully', async () => {
    (BedrockService.invokeModelPublic as jest.Mock).mockRejectedValue(new Error('API error'));

    await expect(
      SpanishTranslationService.translatePhrase('Hello', mockProfile)
    ).rejects.toThrow('Failed to translate phrase');
  });

  it('batch translates multiple phrases', async () => {
    (BedrockService.invokeModelPublic as jest.Mock).mockResolvedValue(JSON.stringify({
      literal: 'Hola',
      natural: 'Hola',
      explanation: 'Simple greeting',
      confidence: 0.95,
      formalityLevel: 'informal'
    }));

    const phrases = [
      { phraseId: '1', userId: 'test', englishText: 'Hello', intent: IntentCategory.SOCIAL, createdAt: '', updatedAt: '' },
      { phraseId: '2', userId: 'test', englishText: 'Goodbye', intent: IntentCategory.SOCIAL, createdAt: '', updatedAt: '' }
    ];

    const results = await SpanishTranslationService.translatePhrases(phrases, mockProfile);

    expect(results).toHaveLength(2);
    expect(BedrockService.invokeModelPublic).toHaveBeenCalledTimes(2);
  });
});
