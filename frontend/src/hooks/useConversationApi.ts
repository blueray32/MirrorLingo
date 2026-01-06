import { useState, useCallback } from 'react';
import { ConversationMessage, ConversationTopic, ConversationResponse, TOPIC_STARTERS } from '../types/conversation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface UseConversationApiReturn {
  messages: ConversationMessage[];
  isLoading: boolean;
  error: string | null;
  currentTopic: ConversationTopic;
  sendMessage: (content: string) => Promise<void>;
  startConversation: (topic: ConversationTopic) => void;
  clearConversation: () => void;
}

export const useConversationApi = (): UseConversationApiReturn => {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTopic, setCurrentTopic] = useState<ConversationTopic>('free_conversation');

  const startConversation = useCallback((topic: ConversationTopic) => {
    setCurrentTopic(topic);
    setMessages([{
      id: Date.now().toString(),
      role: 'assistant',
      content: TOPIC_STARTERS[topic],
      timestamp: new Date()
    }]);
    setError(null);
  }, []);

  const clearConversation = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage: ConversationMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      // For demo: use enhanced mock response
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockResponse = generateMockResponse(content, currentTopic, messages);
      
      const assistantMessage: ConversationMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: mockResponse.message,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // If there's a correction, add it as a system note
      if (mockResponse.correction) {
        const correctionMessage: ConversationMessage = {
          id: (Date.now() + 2).toString(),
          role: 'assistant',
          content: `💡 *Pequeña corrección*: "${mockResponse.correction.original}" → "${mockResponse.correction.corrected}" (${mockResponse.correction.explanation})`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, correctionMessage]);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  }, [currentTopic, messages]);

  return {
    messages,
    isLoading,
    error,
    currentTopic,
    sendMessage,
    startConversation,
    clearConversation
  };
};

// Enhanced mock responses for demo
function generateMockResponse(
  userMessage: string,
  topic: ConversationTopic,
  history: ConversationMessage[]
): ConversationResponse {
  const lowerMessage = userMessage.toLowerCase();
  
  // Detect common mistakes and provide corrections
  let correction: ConversationResponse['correction'];
  
  if (lowerMessage.includes('yo soy bueno')) {
    correction = {
      original: 'yo soy bueno',
      corrected: 'estoy bien',
      explanation: 'Use "estar" for temporary states like how you feel'
    };
  } else if (lowerMessage.includes('mucho bueno')) {
    correction = {
      original: 'mucho bueno',
      corrected: 'muy bueno',
      explanation: '"Muy" is used with adjectives, "mucho" with nouns'
    };
  }

  // Topic-specific responses
  const responses: Record<ConversationTopic, string[]> = {
    daily_life: [
      '¡Qué interesante! ¿Y qué más hiciste hoy?',
      'Me alegra escuchar eso. ¿Cómo te sientes?',
      '¡Suena como un día ocupado! ¿Tienes planes para esta noche?'
    ],
    work: [
      '¡Entiendo! El trabajo puede ser muy demandante. ¿Te gusta lo que haces?',
      'Eso suena importante. ¿Trabajas con un equipo grande?',
      '¡Qué bien! ¿Cuánto tiempo llevas en ese trabajo?'
    ],
    travel: [
      '¡Qué emocionante! ¿Cuál fue tu lugar favorito?',
      'Me encantaría visitar ese lugar. ¿Qué me recomiendas ver?',
      '¡Suena increíble! ¿Probaste la comida local?'
    ],
    food: [
      '¡Mmm, suena delicioso! ¿Sabes cocinar ese plato?',
      '¡Qué rico! A mí también me gusta eso. ¿Lo comes frecuentemente?',
      'Interesante elección. ¿Has probado la versión española?'
    ],
    hobbies: [
      '¡Qué hobby tan interesante! ¿Cuánto tiempo llevas haciéndolo?',
      'Me parece genial. ¿Lo haces solo o con amigos?',
      '¡Suena divertido! ¿Cómo empezaste con eso?'
    ],
    family: [
      '¡Qué bonito! Las familias son muy importantes. ¿Viven cerca?',
      'Entiendo. ¿Se reúnen frecuentemente?',
      '¡Qué bien! ¿Tienen alguna tradición familiar especial?'
    ],
    shopping: [
      '¡Buena idea! ¿Prefieres comprar en tiendas o por internet?',
      'Entiendo. ¿Hay alguna tienda que te guste especialmente?',
      '¡Suena como un buen plan! ¿Necesitas ayuda para encontrar algo?'
    ],
    weather: [
      '¡Interesante! Aquí el clima es bastante diferente. ¿Te gusta ese clima?',
      'Entiendo. ¿Prefieres el calor o el frío?',
      '¡Qué bien! El buen tiempo siempre mejora el ánimo, ¿verdad?'
    ],
    free_conversation: [
      '¡Qué interesante! Cuéntame más sobre eso.',
      'Entiendo lo que dices. ¿Y qué piensas hacer al respecto?',
      '¡Me gusta tu perspectiva! ¿Hay algo más que quieras compartir?'
    ]
  };

  const topicResponses = responses[topic] || responses.free_conversation;
  const randomResponse = topicResponses[Math.floor(Math.random() * topicResponses.length)];

  return {
    message: randomResponse,
    correction,
    suggestions: history.length > 4 ? ['¿Quieres cambiar de tema?', '¿Tienes alguna pregunta?'] : undefined
  };
}
