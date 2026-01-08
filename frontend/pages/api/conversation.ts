import type { NextApiRequest, NextApiResponse } from 'next';

// Get Ollama URL from environment, with no default - must be explicitly configured
const OLLAMA_API_URL = process.env.OLLAMA_API_URL;
const MODEL_NAME = process.env.OLLAMA_MODEL || 'llama3.1:8b';

// Get allowed origins from environment
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',').map(o => o.trim());

function getCorsOrigin(req: NextApiRequest): string {
    const origin = req.headers.origin;
    if (origin && typeof origin === 'string' && ALLOWED_ORIGINS.includes(origin)) {
        return origin;
    }
    return ALLOWED_ORIGINS[0];
}

type ConversationTopic = 'daily_life' | 'work' | 'travel' | 'food' | 'hobbies' | 'family' | 'shopping' | 'weather' | 'free_conversation';

interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

interface ConversationRequest {
    message: string;
    topic: ConversationTopic;
    messageHistory: Message[];
    userIdiolect?: Record<string, unknown>;
}

interface ConversationResponse {
    response: string;
    correction?: {
        original: string;
        corrected: string;
        explanation: string;
    };
    suggestions?: string[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Handle CORS
    const allowedOrigin = getCorsOrigin(req);
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-user-id');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const { message, topic, messageHistory }: ConversationRequest = req.body;

        if (!message) {
            return res.status(400).json({ success: false, error: 'Message is required' });
        }

        // Construct the system prompt
        const systemPrompt = `You are a helpful and encouraging Spanish language tutor.
Refuse to speak English except for corrections.
Your goal is to help the user practice Spanish conversation on the topic: "${topic}".
The user's proficiency is intermediate.

Guidelines:
1. Respond naturally to the user's message in Spanish.
2. If the user makes a significant grammar mistake, add a correction in English at the VERY END of your response (labeled "Correction:").
3. Keep your response concise (1-2 sentences).
4. Ask a relevant follow-up question.`;

        // Only try Ollama if URL is configured
        if (OLLAMA_API_URL) {
            try {
                const response = await fetch(OLLAMA_API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        model: MODEL_NAME,
                        messages: [
                            { role: 'system', content: systemPrompt },
                            ...messageHistory.map((m) => ({ role: m.role, content: m.content })),
                            { role: 'user', content: message }
                        ],
                        stream: false
                    })
                });

                if (!response.ok) {
                    throw new Error(`Ollama API error: ${response.status}`);
                }

                const data = await response.json();
                const fullResponse = data.message?.content || "";

                // Basic parsing of the response to extract correction if present
                const parts = fullResponse.split(/Correction:|Correction/i);
                const mainResponse = parts[0].trim();
                const correctionText = parts.length > 1 ? parts[1].trim() : undefined;

                let correction = undefined;
                if (correctionText) {
                    correction = {
                        original: "mistake",
                        corrected: correctionText,
                        explanation: "Grammar correction"
                    };
                }

                return res.status(200).json({
                    success: true,
                    data: {
                        response: mainResponse,
                        correction,
                        suggestions: ['¿Quieres cambiar de tema?']
                    }
                });

            } catch (ollamaError) {
                console.warn('Ollama API unavailable/failed, falling back to mock logic');
                // Fall through to mock response
            }
        }

        // Use mock response when Ollama is not configured or unavailable
        const mockResponse = generateMockResponse(message, topic, messageHistory || []);
        return res.status(200).json({
            success: true,
            data: mockResponse,
            warning: OLLAMA_API_URL ? 'Ollama unavailable, using demo mode' : 'OLLAMA_API_URL not configured, using demo mode'
        });

    } catch (error) {
        console.error('Conversation API error:', error);
        res.status(500).json({
            success: false,
            error: 'Conversation processing failed'
        });
    }
}

function generateMockResponse(
    userMessage: string,
    topic: ConversationTopic,
    history: Message[]
): ConversationResponse {
    const lowerMessage = userMessage.toLowerCase();

    // Keyword matching for better flow
    if (lowerMessage.includes('hola') || lowerMessage.includes('buenos')) {
        return { response: '¡Hola! Es un gusto saludarte. ¿Cómo te sientes hoy?' };
    }
    if (lowerMessage.includes('gracias')) {
        return { response: '¡De nada! Aquí estoy para practicar contigo. ¿Seguimos?' };
    }
    if (lowerMessage.includes('adiós') || lowerMessage.includes('chao')) {
        return { response: '¡Hasta luego! Espero verte pronto para más español.' };
    }

    // Detect common mistakes
    let correction: ConversationResponse['correction'];
    if (lowerMessage.includes('yo soy bueno')) {
        correction = {
            original: 'yo soy bueno',
            corrected: 'estoy bien',
            explanation: 'Use "estar" for temporary states like how you feel'
        };
    } else if (lowerMessage.includes('me llamo es')) {
        correction = {
            original: 'me llamo es',
            corrected: 'me llamo',
            explanation: '"Me llamo" already includes "is called"'
        };
    }

    // Expanded mock responses
    const responses: Record<ConversationTopic, string[]> = {
        daily_life: [
            '¡Qué interesante! ¿Y qué más hiciste hoy?',
            'Me alegra escuchar eso. ¿Cómo te hace sentir?',
            '¡Suena muy ocupado! ¿Pudiste descansar un poco?',
            'Entiendo. A veces la rutina es difícil. ¿Qué te gustaría cambiar?'
        ],
        work: [
            '¡Entiendo! El trabajo puede ser demandante. ¿Te gusta tu rol actual?',
            'Eso suena importante. ¿Trabajas en equipo o solo?',
            '¡Qué bien! ¿Cuánto tiempo llevas en ese puesto?',
            '¿Qué es lo más difícil de tu trabajo?'
        ],
        travel: [
            '¡Qué emocionante! ¿Cuál es el mejor lugar que has visitado?',
            'Me encantaría ir allí. ¿Qué comida recomiendas de ese lugar?',
            '¡Increíble! ¿Prefieres playa o montaña?',
            'Viajar abre la mente. ¿Cuál es tu próximo destino?'
        ],
        food: [
            '¡Qué rico! ¿Sabes cocinar ese plato?',
            'A mí también me encanta eso. ¿Es picante?',
            'La comida es cultura. ¿Has probado la paella?',
            '¡Mmm! Me dio hambre. ¿Cuál es tu postre favorito?'
        ],
        hobbies: [
            '¡Genial! ¿Cuánto tiempo dedicas a eso?',
            'Es un gran pasatiempo. ¿Lo haces los fines de semana?',
            '¡Qué divertido! ¿Cómo aprendiste a hacerlo?',
            'Tener hobbies es saludable. ¿Tienes algún otro interés?'
        ],
        family: [
            'La familia es importante. ¿Tienes hermanos?',
            'Entiendo. ¿Vives cerca de tus padres?',
            '¡Qué bonito! ¿Tienen reuniones familiares seguido?',
            'Cuéntame más sobre ellos. ¿A quién te pareces más?'
        ],
        shopping: [
            '¡De compras! ¿Prefieres ropa o tecnología?',
            'Entiendo. ¿Te gusta buscar ofertas?',
            'Es divertido vitrinear. ¿Compraste algo interesante?',
            '¿Prefieres ir al centro comercial o comprar online?'
        ],
        weather: [
            'El clima afecta todo. ¿Te gusta la lluvia?',
            'Aquí hace calor. ¿Prefieres el invierno?',
            '¡Qué buen día! Perfecto para salir, ¿no?',
            '¿Cuál es tu estación favorita del año?'
        ],
        free_conversation: [
            '¡Qué interesante! Cuéntame más detalles.',
            'Entiendo tu punto. ¿Por qué piensas eso?',
            '¡Vaya! Nunca lo había visto así. ¿Qué más?',
            'Sigue, te escucho. Es fascinante.',
            'Cambiando de tema un poco, ¿qué opinas de la música latina?',
            'Tu español está mejorando. ¿Qué es lo más difícil para ti?'
        ]
    };

    const topicResponses = responses[topic] || responses.free_conversation;
    const randomResponse = topicResponses[Math.floor(Math.random() * topicResponses.length)];

    return {
        response: randomResponse,
        correction,
        suggestions: history.length > 3 ? ['¿Quieres cambiar de tema?'] : undefined
    };
}
