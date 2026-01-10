import { LettaService } from '../services/lettaService';

describe('LettaService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment variables
    delete process.env.LETTA_ENABLED;
    delete process.env.LETTA_BASE_URL;
    delete process.env.LETTA_API_KEY;
    delete process.env.LETTA_AGENT_NAME;
    // Reset service state
    LettaService.reset();
  });

  describe('initialize', () => {
    it('should return false when disabled', async () => {
      process.env.LETTA_ENABLED = 'false';
      const result = await LettaService.initialize();
      expect(result).toBe(false);
    });

    it('should return false when letta-client not available', async () => {
      process.env.LETTA_ENABLED = 'true';
      // letta-client is not installed in test environment
      const result = await LettaService.initialize();
      expect(result).toBe(false);
    });
  });

  describe('when not enabled', () => {
    it('should return false for syncLearnerProfile', async () => {
      const result = await LettaService.syncLearnerProfile({} as any);
      expect(result).toBe(false);
    });

    it('should return empty string for getMemorySummary', async () => {
      const result = await LettaService.getMemorySummary();
      expect(result).toBe('');
    });

    it('should not throw for syncConversation', async () => {
      await expect(
        LettaService.syncConversation('test', 'response')
      ).resolves.toBeUndefined();
    });

    it('should return false for isEnabled', () => {
      expect(LettaService.isEnabled()).toBe(false);
    });
  });

  describe('graceful fallback', () => {
    it('should handle missing letta-client gracefully', async () => {
      process.env.LETTA_ENABLED = 'true';
      process.env.LETTA_BASE_URL = 'http://localhost:8283';
      
      // letta-client not installed - should return false without throwing
      const result = await LettaService.initialize();
      expect(result).toBe(false);
      expect(LettaService.isEnabled()).toBe(false);
    });
  });
});
