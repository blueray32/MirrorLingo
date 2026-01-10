import { ToneLevel, FormalityLevel, IntentCategory } from '../models/phrase';

// Mock the AWS SDK before importing BedrockService
const mockSend = jest.fn();
jest.mock('@aws-sdk/client-bedrock-runtime', () => ({
  BedrockRuntimeClient: jest.fn().mockImplementation(() => ({ send: mockSend })),
  InvokeModelCommand: jest.fn().mockImplementation((params) => params)
}));

import { BedrockService } from '../services/bedrockService';

const mockBedrockResponse = (content: string) => ({
  body: new TextEncoder().encode(JSON.stringify({
    content: [{ text: content }]
  }))
});

describe('BedrockService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('analyzeIdiolect', () => {
    it('parses valid analysis response', async () => {
      mockSend.mockResolvedValue(mockBedrockResponse(JSON.stringify({
        tone: 'polite',
        formality: 'semi_formal',
        patterns: [{ type: 'politeness_markers', description: 'Uses please', examples: ['please'], frequency: 0.8 }],
        confidence: 0.85
      })));

      const result = await BedrockService.analyzeIdiolect(['Could you help me?']);

      expect(result.tone).toBe(ToneLevel.POLITE);
      expect(result.formality).toBe(FormalityLevel.SEMI_FORMAL);
      expect(result.patterns).toHaveLength(1);
      expect(result.confidence).toBe(0.85);
    });

    it('returns fallback on invalid response', async () => {
      mockSend.mockResolvedValue(mockBedrockResponse('invalid json'));

      const result = await BedrockService.analyzeIdiolect(['test']);

      expect(result.tone).toBe(ToneLevel.NEUTRAL);
      expect(result.confidence).toBe(0.3);
    });

    it('throws on API error', async () => {
      mockSend.mockRejectedValue(new Error('API unavailable'));

      await expect(BedrockService.analyzeIdiolect(['test'])).rejects.toThrow('Failed to analyze speaking patterns');
    });
  });

  describe('classifyIntent', () => {
    it('classifies work intent', async () => {
      mockSend.mockResolvedValue(mockBedrockResponse('work'));

      const result = await BedrockService.classifyIntent('Can we schedule a meeting?');
      expect(result).toBe(IntentCategory.WORK);
    });

    it('returns OTHER for invalid intent', async () => {
      mockSend.mockResolvedValue(mockBedrockResponse('unknown_category'));

      const result = await BedrockService.classifyIntent('test');
      expect(result).toBe(IntentCategory.OTHER);
    });
  });
});
