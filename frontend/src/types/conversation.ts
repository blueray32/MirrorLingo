// Conversation Practice Types

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  audioUrl?: string;
}

export interface ConversationContext {
  userId: string;
  topic: ConversationTopic;
  userIdiolect?: {
    tone: string;
    formality: string;
    patterns: string[];
  };
  messageHistory: ConversationMessage[];
}

export type ConversationTopic = 
  | 'daily_life'
  | 'work'
  | 'travel'
  | 'food'
  | 'hobbies'
  | 'family'
  | 'shopping'
  | 'weather'
  | 'free_conversation';

export interface ConversationResponse {
  message: string;
  correction?: {
    original: string;
    corrected: string;
    explanation: string;
  };
  suggestions?: string[];
}

export const TOPIC_LABELS: Record<ConversationTopic, string> = {
  daily_life: '🏠 Daily Life',
  work: '💼 Work',
  travel: '✈️ Travel',
  food: '🍽️ Food & Dining',
  hobbies: '🎨 Hobbies',
  family: '👨‍👩‍👧 Family',
  shopping: '🛒 Shopping',
  weather: '🌤️ Weather',
  free_conversation: '💬 Free Conversation'
};

export const TOPIC_STARTERS: Record<ConversationTopic, string> = {
  daily_life: '¡Hola! Soy María, tu amiga para practicar español. Me encanta hablar de la vida cotidiana. ¿Cómo ha sido tu día hoy?',
  work: '¡Hola! Soy Carlos, tengo experiencia en negocios internacionales. ¿Cómo va el trabajo últimamente?',
  travel: '¡Hola! Soy Sofía, he viajado por toda Latinoamérica y España. ¿Has viajado a algún lugar interesante recientemente?',
  food: '¡Hola! Soy el Chef Diego, me apasiona la cocina hispana. ¿Qué te gusta comer? ¿Tienes un plato favorito?',
  hobbies: '¡Hola! Soy Andrés, me encantan los pasatiempos de todo tipo. ¿Qué te gusta hacer en tu tiempo libre?',
  family: '¡Hola, mi amor! Soy la Abuela Rosa. La familia es lo más importante. Cuéntame sobre tu familia.',
  shopping: '¡Hola! Soy Lucía, experta en encontrar las mejores ofertas. ¿Necesitas comprar algo hoy?',
  weather: '¡Hola! Soy Pablo, el meteorólogo. Me fascina el clima. ¿Qué tiempo hace donde estás?',
  free_conversation: '¡Hola! Soy el Profesor Miguel, tu tutor de español. Podemos hablar de cualquier tema. ¿De qué te gustaría hablar hoy?'
};
