// AWS Service Mocks for Testing
import { IdiolectAnalysis, IntentCategory, ToneLevel, FormalityLevel, PatternType } from '../../backend/src/models/phrase';

// Mock BedrockService
jest.mock('../../backend/src/services/bedrockService', () => ({
  BedrockService: {
    analyzeIdiolect: jest.fn().mockResolvedValue({
      tone: ToneLevel.CASUAL,
      formality: FormalityLevel.SEMI_FORMAL,
      patterns: [
        {
          type: PatternType.CONTRACTIONS,
          description: 'Uses contractions frequently',
          examples: ["could you", "no worries"],
          frequency: 0.8
        }
      ]
    } as IdiolectAnalysis),
    
    classifyIntent: jest.fn().mockImplementation((phrase: string) => {
      if (phrase.includes('look at')) return Promise.resolve(IntentCategory.WORK);
      if (phrase.includes('no worries')) return Promise.resolve(IntentCategory.SOCIAL);
      return Promise.resolve(IntentCategory.OTHER);
    })
  }
}));

// Mock DynamoDBService
jest.mock('../../backend/src/utils/dynamodb', () => ({
  DynamoDBService: {
    batchPutItems: jest.fn().mockResolvedValue(undefined),
    putItem: jest.fn().mockResolvedValue(undefined),
    getItem: jest.fn().mockResolvedValue(null),
    queryUserItems: jest.fn().mockResolvedValue([])
  },
  generatePhraseId: jest.fn().mockReturnValue('test-phrase-id'),
  getCurrentTimestamp: jest.fn().mockReturnValue('2024-01-01T00:00:00.000Z')
}));

// Mock TranscriptionService
jest.mock('../../backend/src/services/transcriptionService', () => ({
  TranscriptionService: {
    waitForTranscription: jest.fn().mockResolvedValue({
      status: 'completed',
      transcript: 'Test transcript',
      speechMetrics: {
        wordsPerMinute: 150,
        fillerWordRate: 0.02,
        averagePauseLength: 0.3
      }
    })
  }
}));
