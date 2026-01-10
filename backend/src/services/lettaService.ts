import { LettaConfig, LearnerProfile, MemoryBlock } from '../types/letta';

// Letta client is optional - dynamically imported when available
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LettaClient = any;

const TUTOR_PERSONA = `You are a personalized Spanish tutor for MirrorLingo.
You adapt to each learner's communication style and preserve their personality in translations.
You provide gentle corrections and encouraging feedback during conversations.`;

export class LettaService {
  private static lettaClient: LettaClient = null;
  private static lettaAgent: LettaClient = null;
  private static isAvailable = false;

  static async initialize(): Promise<boolean> {
    const config: LettaConfig = {
      apiKey: process.env.LETTA_API_KEY,
      baseUrl: process.env.LETTA_BASE_URL || 'http://localhost:8283',
      agentName: process.env.LETTA_AGENT_NAME || 'mirrorlingo_tutor',
      enabled: process.env.LETTA_ENABLED === 'true'
    };

    if (!config.enabled) {
      console.log('Letta disabled via config');
      return false;
    }

    try {
      // Dynamic import - @letta-ai/letta-client is optional
      // @ts-ignore - letta-client may not be installed
      const lettaModule = await import('@letta-ai/letta-client').catch(() => null);
      if (!lettaModule) {
        console.log('letta-client not installed, skipping Letta integration');
        return false;
      }
      const { Letta } = lettaModule;
      
      const apiKey = config.apiKey || (this.isLocalUrl(config.baseUrl) ? 'local-dev-token' : undefined);
      if (!apiKey) {
        console.warn('LETTA_API_KEY required for non-local Letta server');
        return false;
      }

      this.lettaClient = new Letta({ apiKey: apiKey, baseURL: config.baseUrl });
      
      // Find or create agent
      const agents = await this.lettaClient.agents.list();
      this.lettaAgent = agents.find((a: any) => a.name === config.agentName);

      if (!this.lettaAgent) {
        this.lettaAgent = await this.lettaClient.agents.create({
          name: config.agentName,
          llm: 'letta/letta-free',
          embedding: 'letta/letta-free',
          memoryBlocks: [
            { label: 'learner_profile', value: '{}' },
            { label: 'tutor_persona', value: TUTOR_PERSONA }
          ]
        });
        console.log(`Created Letta agent: ${config.agentName}`);
      } else {
        console.log(`Found existing Letta agent: ${config.agentName}`);
      }

      this.isAvailable = true;
      return true;
    } catch (error) {
      console.warn('Letta initialization failed, using localStorage fallback:', error);
      this.isAvailable = false;
      return false;
    }
  }

  private static isLocalUrl(baseUrl: string): boolean {
    return ['localhost', '127.0.0.1', '0.0.0.0'].some(h => baseUrl.includes(h));
  }

  static isEnabled(): boolean {
    return this.isAvailable && !!this.lettaClient && !!this.lettaAgent;
  }

  static async syncLearnerProfile(profile: LearnerProfile): Promise<boolean> {
    if (!this.isEnabled()) return false;

    try {
      await this.lettaClient.agents.blocks.update({
        agent_id: this.lettaAgent.id,
        block_label: 'learner_profile',
        value: JSON.stringify(profile)
      });
      return true;
    } catch (error) {
      console.warn('Failed to sync learner profile to Letta:', error);
      return false;
    }
  }

  static async getMemorySummary(): Promise<string> {
    if (!this.isEnabled()) return '';

    try {
      const blocks = await this.lettaClient.agents.blocks.list({ agent_id: this.lettaAgent.id });
      const learnerBlock = blocks.find((b: MemoryBlock) => b.label === 'learner_profile');
      
      if (learnerBlock?.value && learnerBlock.value !== '{}') {
        const profile: LearnerProfile = JSON.parse(learnerBlock.value);
        return `Learner: ${profile.name || 'Unknown'}, Style: ${profile.tone} ${profile.formality}, Patterns: ${profile.patterns.join(', ')}`;
      }
      return '';
    } catch (error) {
      console.warn('Failed to get Letta memory summary:', error);
      return '';
    }
  }

  static async syncConversation(userMsg: string, assistantMsg: string): Promise<void> {
    if (!this.isEnabled()) return;

    try {
      await this.lettaClient.agents.messages.create({
        agent_id: this.lettaAgent.id,
        messages: [{
          role: 'user',
          content: `Conversation sync:\nUser: ${userMsg}\nAssistant: ${assistantMsg}`
        }],
        max_steps: 2
      });
    } catch (error) {
      console.warn('Failed to sync conversation to Letta:', error);
    }
  }

  // Test helper method
  static reset(): void {
    this.lettaClient = null;
    this.lettaAgent = null;
    this.isAvailable = false;
  }
}
