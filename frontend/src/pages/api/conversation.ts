import type { NextApiRequest, NextApiResponse } from 'next';

// Get Ollama URL from environment, with no default - must be explicitly configured
const OLLAMA_API_URL = process.env.OLLAMA_API_URL;
const MODEL_NAME = process.env.OLLAMA_MODEL || 'llama3.1:8b';

// Get allowed origins from environment
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:3001').split(',').map(o => o.trim());

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

// Topic-specific expert personas
const TOPIC_PERSONAS: Record<ConversationTopic, { name: string; personality: string; expertise: string[] }> = {
    daily_life: {
        name: 'María',
        personality: 'Una amiga cercana y cálida que le encanta hablar de la vida cotidiana',
        expertise: ['rutinas', 'familia', 'hogar', 'vecindario', 'mascotas']
    },
    work: {
        name: 'Carlos',
        personality: 'Un profesional amigable con experiencia en negocios internacionales',
        expertise: ['oficina', 'reuniones', 'proyectos', 'colegas', 'carrera profesional']
    },
    travel: {
        name: 'Sofía',
        personality: 'Una viajera apasionada que ha visitado toda Latinoamérica y España',
        expertise: ['destinos', 'cultura local', 'comida típica', 'transporte', 'alojamiento']
    },
    food: {
        name: 'Chef Diego',
        personality: 'Un chef entusiasta que ama compartir recetas y tradiciones culinarias',
        expertise: ['cocina española', 'cocina mexicana', 'ingredientes', 'restaurantes', 'recetas']
    },
    hobbies: {
        name: 'Andrés',
        personality: 'Un entusiasta de muchos pasatiempos, siempre curioso por aprender',
        expertise: ['deportes', 'música', 'arte', 'lectura', 'juegos', 'actividades al aire libre']
    },
    family: {
        name: 'Abuela Rosa',
        personality: 'Una abuela cariñosa con historias familiares y sabiduría tradicional',
        expertise: ['tradiciones familiares', 'crianza', 'celebraciones', 'relaciones', 'consejos']
    },
    shopping: {
        name: 'Lucía',
        personality: 'Una experta en compras que conoce las mejores tiendas y ofertas',
        expertise: ['ropa', 'tecnología', 'mercados', 'regateo', 'tendencias']
    },
    weather: {
        name: 'Meteorólogo Pablo',
        personality: 'Un apasionado del clima con conocimiento de diferentes regiones',
        expertise: ['estaciones', 'clima regional', 'actividades según el tiempo', 'pronósticos']
    },
    free_conversation: {
        name: 'Profesor Miguel',
        personality: 'Un profesor de español paciente y versátil que se adapta a cualquier tema',
        expertise: ['gramática', 'vocabulario', 'cultura hispana', 'expresiones idiomáticas']
    }
};

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
        const systemPrompt = `Eres un tutor de español amigable. SOLO responde en español, nunca en inglés.
Tema de conversación: "${topic}".

Reglas:
1. Responde SOLO en español (1-2 oraciones).
2. Haz una pregunta de seguimiento.
3. Si hay un error gramatical, añade al final: "Corrección: [explicación breve en español]"`;

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
    const persona = TOPIC_PERSONAS[topic];
    
    // Extract context from conversation history (for future use in more sophisticated responses)
    const _recentUserMessages = history
        .filter(m => m.role === 'user')
        .slice(-3)
        .map(m => m.content.toLowerCase());
    
    // Detect common mistakes
    let correction: ConversationResponse['correction'];
    if (lowerMessage.includes('yo soy bueno') || lowerMessage.includes('soy bueno')) {
        correction = {
            original: 'soy bueno/buena',
            corrected: 'estoy bien',
            explanation: 'Usa "estar" para estados temporales como cómo te sientes'
        };
    } else if (lowerMessage.includes('mucho bueno')) {
        correction = {
            original: 'mucho bueno',
            corrected: 'muy bueno',
            explanation: '"Muy" se usa con adjetivos, "mucho" con sustantivos'
        };
    }

    // Contextual response based on user message content
    const response = generateContextualResponse(lowerMessage, topic, persona, history);

    return {
        response,
        correction,
        suggestions: history.length > 6 ? ['¿Quieres hablar de otro tema?'] : undefined
    };
}

function generateContextualResponse(
    message: string,
    topic: ConversationTopic,
    persona: { name: string; personality: string; expertise: string[] },
    history: Message[]
): string {
    // "How are you" - user asking about the tutor
    if (message.includes('como estas') || message.includes('cómo estás') || message.includes('que tal') || message.includes('qué tal')) {
        return `¡Muy bien, gracias por preguntar! Me alegra mucho hablar contigo. ¿Y tú, cómo estás?`;
    }

    // Greetings
    if (message.includes('hola') || message.includes('buenos') || message.includes('buenas')) {
        return `¡Hola! Soy ${persona.name}. ¡Qué gusto conocerte! ¿Cómo estás hoy?`;
    }
    
    // Farewells
    if (message.includes('adios') || message.includes('adiós') || message.includes('chao') || message.includes('hasta luego') || message.includes('hasta pronto')) {
        return `¡Hasta pronto! Fue un placer hablar contigo. ¡Sigue practicando tu español!`;
    }
    
    // Thanks
    if (message.includes('gracias')) {
        return `¡De nada! Me encanta ayudarte a practicar. ¿Hay algo más que quieras saber?`;
    }

    // User says they're doing well
    if (message.includes('bien') || message.includes('genial') || message.includes('excelente') || message.includes('muy bien') || message.includes('todo bien')) {
        const followUps: Record<ConversationTopic, string[]> = {
            daily_life: ['¡Me alegra mucho! ¿Qué hiciste hoy?', '¡Qué bueno! ¿Tienes planes para más tarde?', '¡Perfecto! Cuéntame, ¿cómo es un día típico para ti?'],
            work: ['¡Excelente! ¿Cómo va el trabajo últimamente?', '¡Qué bien! ¿Tienes algún proyecto interesante?'],
            travel: ['¡Fantástico! ¿Has viajado recientemente?', '¡Genial! ¿Cuál es tu próximo destino soñado?'],
            food: ['¡Perfecto! ¿Ya comiste hoy? ¿Qué preparaste?', '¡Qué bueno! ¿Cuál es tu comida favorita?'],
            hobbies: ['¡Excelente! ¿Qué te gusta hacer en tu tiempo libre?', '¡Genial! ¿Tienes algún hobby nuevo?'],
            family: ['¡Qué lindo! ¿Cómo está tu familia?', '¡Me alegra! ¿Viste a tu familia recientemente?'],
            shopping: ['¡Perfecto! ¿Compraste algo interesante últimamente?', '¡Qué bien! ¿Necesitas comprar algo?'],
            weather: ['¡Genial! ¿Cómo está el clima donde vives?', '¡Qué bueno! ¿Te gusta el clima de hoy?'],
            free_conversation: ['¡Me alegra escucharlo! ¿De qué te gustaría hablar hoy?', '¡Excelente! Cuéntame, ¿qué hay de nuevo?']
        };
        return followUps[topic][Math.floor(Math.random() * followUps[topic].length)];
    }

    // Negative feelings
    if (message.includes('mal') || message.includes('cansado') || message.includes('triste') || message.includes('regular') || message.includes('mas o menos')) {
        return `Lo siento escuchar eso. A veces los días son difíciles. ¿Quieres contarme qué pasó?`;
    }

    // Questions from user (check without accents too)
    if (message.includes('?') || message.includes('que ') || message.includes('qué') || message.includes('como ') || message.includes('cómo') || message.includes('donde') || message.includes('dónde') || message.includes('cual') || message.includes('cuál') || message.includes('por que') || message.includes('por qué')) {
        return generateQuestionResponse(message, topic, persona);
    }

    // Topic-specific contextual responses
    return generateTopicResponse(message, topic, persona, history);
}

function generateQuestionResponse(message: string, topic: ConversationTopic, _persona: { name: string }): string {
    const responses: Record<ConversationTopic, string[]> = {
        daily_life: [
            'Buena pregunta. En mi día típico, me levanto temprano y tomo café. ¿Y tú?',
            'Pues, depende del día. Los fines de semana me gusta descansar. ¿Qué haces tú normalmente?'
        ],
        work: [
            'En mi experiencia, lo más importante es la comunicación con el equipo. ¿Trabajas en equipo?',
            'Interesante pregunta. Yo trabajo en una oficina, pero muchos trabajan desde casa ahora. ¿Y tú?'
        ],
        travel: [
            '¡Qué buena pregunta! Mi lugar favorito es Barcelona, tiene playa y cultura. ¿Has visitado España?',
            'Te recomiendo viajar en temporada baja, es más barato y tranquilo. ¿Cuándo planeas viajar?'
        ],
        food: [
            '¡Me encanta esa pregunta! La paella es mi plato favorito. ¿Te gusta la comida española?',
            'El secreto está en los ingredientes frescos. ¿Te gusta cocinar?'
        ],
        hobbies: [
            'Yo disfruto mucho la lectura y el senderismo. ¿Cuáles son tus pasatiempos?',
            'Depende de mi humor. A veces prefiero actividades tranquilas. ¿Y tú qué prefieres?'
        ],
        family: [
            'La familia es lo más importante. Nos reunimos cada domingo. ¿Tu familia se reúne seguido?',
            'Tengo dos hermanos y muchos primos. Las reuniones son muy divertidas. ¿Tienes hermanos?'
        ],
        shopping: [
            'Prefiero las tiendas pequeñas, tienen cosas más únicas. ¿Dónde te gusta comprar?',
            'Siempre busco ofertas primero. ¿Eres de los que compara precios?'
        ],
        weather: [
            'Aquí en España tenemos mucho sol. ¿Cómo es el clima donde vives?',
            'Prefiero la primavera, ni muy caliente ni muy frío. ¿Cuál es tu estación favorita?'
        ],
        free_conversation: [
            '¡Excelente pregunta! Me gusta pensar en eso. ¿Qué opinas tú?',
            'Eso es muy interesante. Cuéntame más sobre tu perspectiva.'
        ]
    };
    return responses[topic][Math.floor(Math.random() * responses[topic].length)];
}

function generateTopicResponse(
    message: string, 
    topic: ConversationTopic, 
    persona: { name: string; expertise: string[] },
    history: Message[]
): string {
    // Check for topic-specific keywords and respond contextually
    const topicKeywords: Record<ConversationTopic, { keywords: string[]; responses: string[] }> = {
        daily_life: {
            keywords: ['mañana', 'noche', 'día', 'casa', 'dormir', 'despertar', 'rutina'],
            responses: [
                '¡Qué interesante! Mi rutina es similar. ¿A qué hora te despiertas normalmente?',
                'Entiendo perfectamente. La vida diaria puede ser muy ocupada. ¿Tienes tiempo para relajarte?',
                '¡Así es la vida! Cada día trae algo nuevo. ¿Qué es lo mejor de tu día típico?'
            ]
        },
        work: {
            keywords: ['oficina', 'jefe', 'proyecto', 'reunión', 'equipo', 'trabajo', 'empresa'],
            responses: [
                '¡El trabajo es importante! ¿Te gusta lo que haces?',
                'Entiendo, el ambiente laboral afecta mucho. ¿Cómo es tu relación con tus colegas?',
                '¡Interesante! ¿Cuánto tiempo llevas en ese puesto?'
            ]
        },
        travel: {
            keywords: ['viaje', 'avión', 'hotel', 'playa', 'montaña', 'país', 'ciudad', 'vacaciones'],
            responses: [
                '¡Me encanta viajar! Ese lugar suena increíble. ¿Qué fue lo que más te gustó?',
                '¡Qué aventura! Viajar abre la mente. ¿Probaste la comida local?',
                '¡Suena maravilloso! ¿Viajaste solo o con alguien?'
            ]
        },
        food: {
            keywords: ['comer', 'cocinar', 'restaurante', 'receta', 'delicioso', 'plato', 'comida'],
            responses: [
                '¡Mmm, suena delicioso! ¿Sabes preparar ese plato?',
                '¡Qué rico! La comida es una parte importante de la cultura. ¿Cuál es tu ingrediente favorito?',
                '¡Me diste hambre! ¿Prefieres cocinar en casa o comer afuera?'
            ]
        },
        hobbies: {
            keywords: ['jugar', 'leer', 'música', 'deporte', 'película', 'serie', 'arte', 'bailar'],
            responses: [
                '¡Qué hobby tan interesante! ¿Cuánto tiempo le dedicas?',
                '¡Me gusta eso también! Es importante tener pasatiempos. ¿Cómo empezaste?',
                '¡Genial! Los hobbies nos ayudan a relajarnos. ¿Lo haces solo o con amigos?'
            ]
        },
        family: {
            keywords: ['mamá', 'papá', 'hermano', 'hermana', 'hijo', 'hija', 'abuelo', 'primo'],
            responses: [
                '¡La familia es todo! ¿Viven cerca de ti?',
                '¡Qué bonito! Las relaciones familiares son muy especiales. ¿Se ven seguido?',
                'Entiendo, la familia siempre está ahí. ¿Tienen alguna tradición especial?'
            ]
        },
        shopping: {
            keywords: ['comprar', 'tienda', 'precio', 'oferta', 'ropa', 'zapatos', 'centro comercial'],
            responses: [
                '¡De compras! ¿Encontraste algo bueno?',
                '¡Qué bien! Comprar puede ser divertido. ¿Prefieres tiendas físicas o en línea?',
                'Entiendo, hay que buscar las mejores ofertas. ¿Cuál es tu tienda favorita?'
            ]
        },
        weather: {
            keywords: ['sol', 'lluvia', 'frío', 'calor', 'nieve', 'viento', 'nublado', 'temperatura'],
            responses: [
                '¡El clima afecta todo! ¿Te gusta ese tipo de clima?',
                'Interesante, aquí el clima es diferente. ¿Qué actividades haces con ese clima?',
                '¡Así es la naturaleza! ¿Prefieres el calor o el frío?'
            ]
        },
        free_conversation: {
            keywords: [],
            responses: [
                '¡Qué interesante lo que dices! Cuéntame más sobre eso.',
                'Entiendo tu punto de vista. ¿Por qué piensas así?',
                '¡Fascinante! Me gusta aprender cosas nuevas. ¿Qué más puedes contarme?',
                'Tu español está mejorando mucho. ¿Hay algo específico que quieras practicar?'
            ]
        }
    };

    const topicData = topicKeywords[topic];
    
    // Check if message contains topic keywords
    const hasKeyword = topicData.keywords.some(kw => message.includes(kw));
    
    if (hasKeyword) {
        return topicData.responses[Math.floor(Math.random() * topicData.responses.length)];
    }

    // Handle very short messages (1-2 words) that didn't match anything
    if (message.split(' ').length <= 2) {
        const shortResponses = [
            '¿Puedes contarme un poco más? Me interesa lo que dices.',
            'Interesante. ¿Qué quieres decir con eso?',
            '¡Sigue! Me gustaría escuchar más detalles.',
            '¿Sí? Cuéntame más, por favor.'
        ];
        return shortResponses[Math.floor(Math.random() * shortResponses.length)];
    }

    // Default contextual responses based on conversation length
    if (history.length < 4) {
        const earlyResponses = [
            `¡Qué interesante! Cuéntame más sobre eso.`,
            `Entiendo. ¿Y qué más puedes contarme?`,
            `¡Ah, sí! Me gusta lo que dices. ¿Puedes explicar más?`
        ];
        return earlyResponses[Math.floor(Math.random() * earlyResponses.length)];
    } else if (history.length < 8) {
        return `¡Qué buena conversación estamos teniendo! ¿Hay algo más que quieras compartir?`;
    } else {
        return `Me encanta hablar contigo. Tu español está muy bien. ¿Quieres seguir o cambiar de tema?`;
    }
}
