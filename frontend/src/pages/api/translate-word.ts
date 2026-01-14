import type { NextApiRequest, NextApiResponse } from 'next';

const OLLAMA_API_URL = process.env.OLLAMA_API_URL || 'http://host.docker.internal:11434/api/chat';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.1:8b';

// In-memory cache for translations (persists during server uptime)
const translationCache: Record<string, string> = {};

interface TranslateWordResponse {
    success: boolean;
    word: string;
    translation: string;
    cached?: boolean;
    error?: string;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<TranslateWordResponse>
) {
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            word: '',
            translation: '',
            error: 'Method not allowed'
        });
    }

    const { word } = req.body;

    if (!word || typeof word !== 'string') {
        return res.status(400).json({
            success: false,
            word: '',
            translation: '',
            error: 'Word is required'
        });
    }

    const cleanWord = word.toLowerCase().trim();

    // Check cache first
    if (translationCache[cleanWord]) {
        return res.status(200).json({
            success: true,
            word: cleanWord,
            translation: translationCache[cleanWord],
            cached: true
        });
    }

    try {
        const systemPrompt = `You are a Spanish-English translator. Translate the given Spanish word or short phrase to English.
Reply with ONLY the English translation, nothing else. Be brief and concise.
If it's a conjugated verb, include the pronoun (e.g., "I am", "you have").
If it's a common expression, give the meaning.`;

        const response = await fetch(OLLAMA_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: OLLAMA_MODEL,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: `Translate: "${cleanWord}"` }
                ],
                stream: false,
                options: {
                    temperature: 0.1,
                    num_predict: 30 // Keep it short
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Ollama API error: ${response.status}`);
        }

        const data = await response.json();
        const translation = data.message?.content?.trim() || 'unknown';

        // Clean up the translation (remove quotes, extra punctuation)
        const cleanTranslation = translation
            .replace(/^["']|["']$/g, '')
            .replace(/^Translation:\s*/i, '')
            .trim();

        // Cache the result
        translationCache[cleanWord] = cleanTranslation;

        return res.status(200).json({
            success: true,
            word: cleanWord,
            translation: cleanTranslation,
            cached: false
        });

    } catch (error) {
        console.error('Translation error:', error);

        // Return a fallback for common patterns
        const fallbackTranslation = getFallbackTranslation(cleanWord);
        if (fallbackTranslation) {
            translationCache[cleanWord] = fallbackTranslation;
            return res.status(200).json({
                success: true,
                word: cleanWord,
                translation: fallbackTranslation,
                cached: false
            });
        }

        return res.status(500).json({
            success: false,
            word: cleanWord,
            translation: '',
            error: 'Translation service unavailable'
        });
    }
}

// Fallback translations for when API is unavailable
function getFallbackTranslation(word: string): string | null {
    const fallbacks: Record<string, string> = {
        // Add any critical fallbacks here
        'experiencia': 'experience',
        'negocios': 'business',
        'internacionales': 'international',
        'últimamente': 'lately',
        'carlos': 'Carlos (name)',
        'interesante': 'interesting',
        'perfecto': 'perfect',
        'excelente': 'excellent',
        'fantástico': 'fantastic',
        'maravilloso': 'wonderful',
        'genial': 'great',
        'increíble': 'incredible',
        'horrible': 'horrible',
        'terrible': 'terrible',
        'pequeña': 'small',
        'grande': 'big/large',
        'primero': 'first',
        'segundo': 'second',
        'tercero': 'third',
        'momento': 'moment',
        'lugar': 'place',
        'forma': 'form/way',
        'parte': 'part',
        'punto': 'point',
        'lado': 'side',
        'ejemplo': 'example',
        'caso': 'case',
        'hecho': 'fact/done',
        'cuenta': 'account/bill',
        'razón': 'reason',
        'idea': 'idea',
        'manera': 'way/manner',
        'gobierno': 'government',
        'empresa': 'company',
        'servicio': 'service',
        'mercado': 'market',
        'cliente': 'client',
        'producto': 'product',
        'precio': 'price',
        'ventas': 'sales',
        'reunión': 'meeting',
        'oficina': 'office',
        'equipo': 'team/equipment',
        'proyecto': 'project',
        'resultado': 'result',
        'proceso': 'process',
        'sistema': 'system',
        'información': 'information',
        'desarrollo': 'development',
        'tecnología': 'technology',
        'comunicación': 'communication'
    };

    return fallbacks[word] || null;
}
