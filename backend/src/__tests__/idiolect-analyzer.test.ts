import { IdiolectAnalyzer } from '../../src/services/idiolectAnalyzer';

// Mock dependencies
jest.mock('../../src/services/bedrockService');
jest.mock('../../src/utils/dynamodb');

describe('IdiolectAnalyzer', () => {
  const mockPhrases = [
    "Could you take a look at this?",
    "No worries, take your time"
  ];

  it('analyzes user phrases', async () => {
    // Mock the static method
    const mockAnalyze = jest.spyOn(IdiolectAnalyzer, 'analyzeUserPhrases')
      .mockResolvedValue({
        phrases: [],
        profile: {
          userId: 'test-user',
          overallTone: 'polite' as any,
          overallFormality: 'casual' as any,
          commonPatterns: [],
          preferredIntents: [],
          analysisCount: 0,
          lastUpdated: new Date().toISOString()
        }
      });

    const result = await IdiolectAnalyzer.analyzeUserPhrases('test-user', mockPhrases);
    
    expect(result).toHaveProperty('phrases');
    expect(result).toHaveProperty('profile');
    expect(mockAnalyze).toHaveBeenCalledWith('test-user', mockPhrases);
    
    mockAnalyze.mockRestore();
  });
});
