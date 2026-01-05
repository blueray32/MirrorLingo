import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime'

const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1'
})

const MODEL_ID = process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-haiku-20240307-v1:0'

export interface ConversationContext {
  messages: Array<{ role: 'user' | 'assistant', content: string }>
  userProfile: {
    tone: string
    formality: string
    patterns: string[]
  }
  topic?: string
  language: 'spanish' | 'english'
}

export interface ConversationResponse {
  message: string
  feedback?: {
    grammarCorrections?: Array<{
      original: string
      corrected: string
      explanation: string
      severity: 'minor' | 'moderate' | 'major'
    }>
    pronunciationTips?: string[]
    vocabularySuggestions?: string[]
    culturalNotes?: string[]
  }
  confidence: number
}

export class ConversationService {
  
  static async generateResponse(
    userMessage: string, 
    context: ConversationContext
  ): Promise<ConversationResponse> {
    
    const prompt = this.buildConversationPrompt(userMessage, context)
    
    try {
      const response = await this.invokeModel(prompt)
      return this.parseConversationResponse(response)
    } catch (error) {
      console.error('Error generating conversation response:', error)
      throw new Error('Failed to generate AI response')
    }
  }

  private static buildConversationPrompt(
    userMessage: string, 
    context: ConversationContext
  ): string {
    const { userProfile, topic, messages } = context
    
    const conversationHistory = messages
      .slice(-6) // Keep last 6 messages for context
      .map(msg => `${msg.role === 'user' ? 'Usuario' : 'Asistente'}: ${msg.content}`)
      .join('\n')

    return `Eres un tutor de español conversacional que se adapta al estilo personal del usuario.

PERFIL DEL USUARIO:
- Tono: ${userProfile.tone}
- Formalidad: ${userProfile.formality}
- Patrones de habla: ${userProfile.patterns.join(', ')}

TEMA DE CONVERSACIÓN: ${topic || 'conversación libre'}

HISTORIAL RECIENTE:
${conversationHistory}

NUEVO MENSAJE DEL USUARIO: ${userMessage}

Responde en español de manera natural y conversacional. Adapta tu respuesta al estilo del usuario (${userProfile.tone}, ${userProfile.formality}). 

Proporciona tu respuesta en este formato JSON:
{
  "message": "Tu respuesta conversacional en español",
  "feedback": {
    "grammarCorrections": [
      {
        "original": "texto con error",
        "corrected": "texto corregido", 
        "explanation": "explicación breve",
        "severity": "minor|moderate|major"
      }
    ],
    "pronunciationTips": ["consejo de pronunciación"],
    "vocabularySuggestions": ["sugerencia de vocabulario"],
    "culturalNotes": ["nota cultural relevante"]
  },
  "confidence": 0.95
}

Mantén la conversación natural y enfócate en ayudar al usuario a practicar español de manera cómoda.`
  }

  private static async invokeModel(prompt: string): Promise<string> {
    const body = JSON.stringify({
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    })

    const command = new InvokeModelCommand({
      modelId: MODEL_ID,
      body,
      contentType: 'application/json',
      accept: 'application/json'
    })

    const response = await bedrockClient.send(command)
    const responseBody = JSON.parse(new TextDecoder().decode(response.body))
    
    return responseBody.content[0].text
  }

  private static parseConversationResponse(response: string): ConversationResponse {
    try {
      // Try to parse JSON response
      const parsed = JSON.parse(response)
      return {
        message: parsed.message || response,
        feedback: parsed.feedback,
        confidence: parsed.confidence || 0.8
      }
    } catch (error) {
      // Fallback to plain text response
      return {
        message: response,
        confidence: 0.7
      }
    }
  }

  static async startConversation(
    topic: string,
    userProfile: any
  ): Promise<ConversationResponse> {
    const greetingPrompt = `Inicia una conversación en español sobre ${topic}. 
    Adapta tu saludo al estilo ${userProfile.tone} y ${userProfile.formality} del usuario.
    Haz una pregunta abierta para comenzar la conversación.`

    try {
      const response = await this.invokeModel(greetingPrompt)
      return this.parseConversationResponse(response)
    } catch (error) {
      console.error('Error starting conversation:', error)
      throw new Error('Failed to start conversation')
    }
  }
}
