import { useState, useCallback, useRef } from 'react';
import { ConversationMessage, ConversationTopic, ConversationResponse, TOPIC_STARTERS } from '../types/conversation';

interface UseConversationApiReturn {
  messages: ConversationMessage[];
  isLoading: boolean;
  error: string | null;
  currentTopic: ConversationTopic;
  sendMessage: (content: string) => Promise<void>;
  startConversation: (topic: ConversationTopic) => void;
  clearConversation: () => void;
}

export const useConversationApi = (userId: string): UseConversationApiReturn => {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTopic, setCurrentTopic] = useState<ConversationTopic>('free_conversation');
  const messagesRef = useRef<ConversationMessage[]>([]);
  const idCounter = useRef(0);

  const generateId = () => `msg-${Date.now()}-${++idCounter.current}`;

  const startConversation = useCallback((topic: ConversationTopic) => {
    setCurrentTopic(topic);
    const initialMessages = [{
      id: generateId(),
      role: 'assistant' as const,
      content: TOPIC_STARTERS[topic],
      timestamp: new Date()
    }];
    setMessages(initialMessages);
    messagesRef.current = initialMessages;
    setError(null);
  }, []);

  const clearConversation = useCallback(() => {
    setMessages([]);
    messagesRef.current = [];
    setError(null);
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage: ConversationMessage = {
      id: generateId(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages(prev => {
      const updated = [...prev, userMessage];
      messagesRef.current = updated;
      return updated;
    });
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({
          message: content,
          topic: currentTopic,
          messageHistory: messagesRef.current.slice(-10), // Last 10 messages for context
          userIdiolect: null
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to get response');
      }

      const assistantMessage: ConversationMessage = {
        id: generateId(),
        role: 'assistant',
        content: result.data.response,
        timestamp: new Date()
      };

      setMessages(prev => {
        const updated = [...prev, assistantMessage];
        messagesRef.current = updated;
        return updated;
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  }, [currentTopic]);

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
