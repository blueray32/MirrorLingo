import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1'
});

const MODEL_ID = process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-haiku-20240307-v1:0';

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

export class ConversationService {
  static async generateResponse(
    userMessage: string,
    context: ConversationContext
  ): Promise<ConversationResponse> {
    const systemPrompt = this.buildSystemPrompt(context);
    const messages = this.buildMessages(userMessage, context);

    try {
      const response = await this.invokeModel(systemPrompt, messages);
      return this.parseResponse(response);
    } catch (error) {
      console.error('Conversation error:', error);
      return {
        message: 'Lo siento, no pude procesar tu mensaje. ¿Puedes repetirlo?',
        suggestions: ['Intenta de nuevo', 'Cambia de tema']
      };
    }
  }

  private static buildSystemPrompt(context: ConversationContext): string {
    const idiolectInfo = context.userIdiolect
      ? `The user's speaking style is ${context.userIdiolect.tone} and ${context.userIdiolect.formality}. 
         They tend to use: ${context.userIdiolect.patterns.join(', ')}.
         Match their style in your responses.`
      : '';

    return `You are a friendly Spanish conversation tutor for MirrorLingo. 
Your role is to have natural conversations in Spanish while helping the user practice.

RULES:
1. Respond ONLY in Spanish (unless explaining a grammar point)
2. Keep responses conversational and natural (2-3 sentences max)
3. If the user makes a grammar mistake, gently correct it
4. Adapt your formality to match the user's style
5. Stay on topic: ${context.topic}
6. Be encouraging and supportive

${idiolectInfo}

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
    const messages = context.messageHistory.slice(-6).map(m => ({
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
}
