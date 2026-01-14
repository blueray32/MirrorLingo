import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { LettaService } from './lettaService';
import { ConversationMemoryService } from './conversationMemoryService';
import { MistakePatternService } from './mistakePatternService';

const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1'
});

const MODEL_ID = process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-haiku-20240307-v1:0';

// Initialize Letta on module load (non-blocking)
LettaService.initialize().catch(() => {
  console.log('Letta initialization failed, using localStorage fallback');
});

export interface ConversationContext {
  userId: string;
  topic: string;
  userIdiolect?: {
    tone: string;
    formality: string;
    patterns: string[];
  };
  messageHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export interface ConversationResponse {
  message: string;
  correction?: {
    original: string;
    corrected: string;
    explanation: string;
  };
  suggestions?: string[];
}

const MAX_HISTORY_MESSAGES = parseInt(process.env.BEDROCK_MAX_HISTORY || '10', 10);

export class ConversationService {
  static async generateResponse(
    userMessage: string,
    context: ConversationContext
  ): Promise<ConversationResponse> {
    // Get enhanced conversation memory
    const conversationMemory = await ConversationMemoryService.getConversationMemory(context.userId);
    const relationshipStatus = await ConversationMemoryService.getRelationshipStatus(context.userId);
    
    // Get Letta memory summary if available
    const lettaMemory = await LettaService.getMemorySummary();
    const systemPrompt = this.buildSystemPrompt(context, lettaMemory, conversationMemory, relationshipStatus);
    const messages = this.buildMessages(userMessage, context);

    try {
      const response = await this.invokeModel(systemPrompt, messages);
      const parsed = this.parseResponse(response);
      
      // Analyze conversation for memory updates (non-blocking)
      this.updateConversationMemory(context.userId, userMessage, parsed.message, context.topic).catch(() => {});
      
      // Analyze mistakes for pattern learning (non-blocking)
      this.analyzeMistakePatterns(context.userId, userMessage, parsed.correction).catch(() => {});
      
      // Sync conversation to Letta (non-blocking)
      LettaService.syncConversation(userMessage, parsed.message).catch(() => {});
      
      return parsed;
    } catch (error) {
      console.error('Conversation error:', error);
      return {
        message: 'Lo siento, no pude procesar tu mensaje. ¿Puedes repetirlo?',
        suggestions: ['Intenta de nuevo', 'Cambia de tema']
      };
    }
  }

  private static buildSystemPrompt(
    context: ConversationContext, 
    lettaMemory?: string,
    conversationMemory?: any,
    relationshipStatus?: any
  ): string {
    const idiolectInfo = context.userIdiolect
      ? `The user's speaking style is ${context.userIdiolect.tone} and ${context.userIdiolect.formality}. 
         They tend to use: ${context.userIdiolect.patterns.join(', ')}.
         Match their style in your responses.`
      : '';

    const memoryContext = lettaMemory ? `\nPersistent Memory: ${lettaMemory}` : '';
    
    const relationshipContext = relationshipStatus ? 
      `\nRelationship Context: You are at ${relationshipStatus.level} level with this user. 
       You've had ${relationshipStatus.totalConversations} conversations together.
       Recent memories: ${relationshipStatus.recentMemories.slice(0, 3).join(', ')}.
       Favorite topics: ${relationshipStatus.favoriteTopics.join(', ')}.
       Adjust your familiarity and references accordingly.` : '';

    const tutorPersonality = conversationMemory?.tutorPersonality ? 
      `\nTutor Personality: You are ${conversationMemory.tutorPersonality.name}, 
       characterized as ${conversationMemory.tutorPersonality.characteristics.join(', ')}.
       Maintain consistency with your established personality.` : '';

    return `You are a friendly Spanish conversation tutor for MirrorLingo. 
Your role is to have natural conversations in Spanish while helping the user practice.

RULES:
1. Respond ONLY in Spanish (unless explaining a grammar point)
2. Keep responses conversational and natural (2-3 sentences max)
3. If the user makes a grammar mistake, gently correct it
4. Adapt your formality to match the user's style
5. Stay on topic: ${context.topic}
6. Be encouraging and supportive
7. Reference past conversations and personal details when appropriate
8. Build on the relationship naturally over time

${idiolectInfo}${memoryContext}${relationshipContext}${tutorPersonality}

RESPONSE FORMAT (JSON):
{
  "message": "Your Spanish response here",
  "correction": { "original": "user's mistake", "corrected": "correct form", "explanation": "brief explanation" } or null,
  "suggestions": ["optional follow-up phrase 1", "optional phrase 2"] or null
}`;
  }

  private static buildMessages(
    userMessage: string,
    context: ConversationContext
  ): Array<{ role: string; content: string }> {
    const messages = context.messageHistory.slice(-MAX_HISTORY_MESSAGES).map(m => ({
      role: m.role,
      content: m.content
    }));
    messages.push({ role: 'user', content: userMessage });
    return messages;
  }

  private static async invokeModel(
    systemPrompt: string,
    messages: Array<{ role: string; content: string }>
  ): Promise<string> {
    const payload = {
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 500,
      system: systemPrompt,
      messages
    };

    const command = new InvokeModelCommand({
      modelId: MODEL_ID,
      contentType: 'application/json',
      body: JSON.stringify(payload)
    });

    const response = await bedrockClient.send(command);
    if (!response.body) throw new Error('No response body');

    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    return responseBody.content?.[0]?.text || '';
  }

  private static parseResponse(response: string): ConversationResponse {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          message: parsed.message || response,
          correction: parsed.correction || undefined,
          suggestions: parsed.suggestions || undefined
        };
      }
    } catch {
      // If JSON parsing fails, use raw response
    }
    return { message: response };
  }

  private static async updateConversationMemory(
    userId: string,
    userMessage: string,
    assistantMessage: string,
    topic: string
  ): Promise<void> {
    try {
      const memoryUpdate = await ConversationMemoryService.analyzeConversationForMemory(
        userId,
        userMessage,
        assistantMessage,
        topic
      );

      await ConversationMemoryService.updateConversationMemory(userId, memoryUpdate);
    } catch (error) {
      console.error('Error updating conversation memory:', error);
    }
  }

  private static async analyzeMistakePatterns(
    userId: string,
    userMessage: string,
    correction?: { original: string; corrected: string; explanation: string }
  ): Promise<void> {
    try {
      if (correction) {
        await MistakePatternService.analyzeMistakesFromConversation(
          userId,
          userMessage,
          correction
        );
      }
    } catch (error) {
      console.error('Error analyzing mistake patterns:', error);
    }
  }
}
