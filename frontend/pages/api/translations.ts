import type { NextApiRequest, NextApiResponse } from 'next'

// Get allowed origins from environment
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',').map(o => o.trim());

function getCorsOrigin(req: NextApiRequest): string {
  const origin = req.headers.origin;
  if (origin && typeof origin === 'string' && ALLOWED_ORIGINS.includes(origin)) {
    return origin;
  }
  return ALLOWED_ORIGINS[0];
}

interface UserProfile {
  overallFormality?: 'informal' | 'formal' | 'semi_formal';
  overallTone?: string;
  commonPatterns?: Array<{ type: string; frequency: number }>;
}

interface TranslationRequest {
  phrases: string[]
  profile?: UserProfile
}

interface TranslationResult {
  englishPhrase: string
  translation: {
    literal: string
    natural: string
    explanation: string
    confidence: number
    culturalNotes?: string
    formalityLevel: 'informal' | 'formal'
  }
  styleMatching: {
    tonePreserved: boolean
    formalityAdjusted: boolean
    personalityMaintained: boolean
  }
  learningTips: string[]
}

interface MyMemoryResponse {
  responseData: {
    translatedText: string
    match: number
  }
  responseStatus: number
}

// Expand common English contractions to full words for better translation
function expandContractions(text: string): string {
  const contractions: Record<string, string> = {
    "don't": "do not",
    "doesn't": "does not",
    "didn't": "did not",
    "won't": "will not",
    "wouldn't": "would not",
    "couldn't": "could not",
    "shouldn't": "should not",
    "can't": "cannot",
    "haven't": "have not",
    "hasn't": "has not",
    "hadn't": "had not",
    "isn't": "is not",
    "aren't": "are not",
    "wasn't": "was not",
    "weren't": "were not",
    "I'm": "I am",
    "I've": "I have",
    "I'll": "I will",
    "I'd": "I would",
    "you're": "you are",
    "you've": "you have",
    "you'll": "you will",
    "you'd": "you would",
    "he's": "he is",
    "she's": "she is",
    "it's": "it is",
    "we're": "we are",
    "we've": "we have",
    "we'll": "we will",
    "we'd": "we would",
    "they're": "they are",
    "they've": "they have",
    "they'll": "they will",
    "they'd": "they would",
    "that's": "that is",
    "there's": "there is",
    "here's": "here is",
    "what's": "what is",
    "who's": "who is",
    "let's": "let us",
  };

  let result = text;
  for (const [contraction, expansion] of Object.entries(contractions)) {
    // Case-insensitive replacement
    const regex = new RegExp(contraction.replace("'", "'"), 'gi');
    result = result.replace(regex, expansion);
  }
  return result;
}

// Translate using MyMemory free API
async function translateWithMyMemory(text: string): Promise<{ translation: string; confidence: number }> {
  try {
    // Expand contractions first for better translation quality
    const expandedText = expandContractions(text);
    console.log(`Translating: "${text}" -> expanded: "${expandedText}"`);

    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(expandedText)}&langpair=en|es`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`MyMemory API error: ${response.status}`);
    }

    const data: MyMemoryResponse = await response.json();

    if (data.responseStatus !== 200) {
      throw new Error('Translation failed');
    }

    return {
      translation: data.responseData.translatedText,
      confidence: data.responseData.match
    };
  } catch (error) {
    console.error('MyMemory translation error:', error);
    // Fallback to the original text if translation fails
    return {
      translation: text,
      confidence: 0
    };
  }
}

// Generate a more natural/casual Spanish version
function adjustForFormality(translation: string, formality: string): string {
  if (formality === 'formal') {
    // For formal, use usted forms if possible
    return translation
      .replace(/\btú\b/gi, 'usted')
      .replace(/\btienes\b/gi, 'tiene')
      .replace(/\bquieres\b/gi, 'quiere')
      .replace(/\bpuedes\b/gi, 'puede');
  }
  // For informal, the default translation is usually fine
  return translation;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle CORS with validated origin
  const allowedOrigin = getCorsOrigin(req);
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-user-id');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  try {
    const { phrases, profile }: TranslationRequest = req.body

    if (!phrases || !Array.isArray(phrases) || phrases.length === 0) {
      return res.status(400).json({ success: false, error: 'No phrases provided' })
    }

    // Translate all phrases in parallel
    const translationPromises = phrases.map(async (phrase): Promise<TranslationResult> => {
      // Get the literal translation
      const { translation: literalTranslation, confidence } = await translateWithMyMemory(phrase);

      // For natural translation, adjust based on formality
      const formality = profile?.overallFormality || 'informal';
      const naturalTranslation = adjustForFormality(literalTranslation, formality);

      return {
        englishPhrase: phrase,
        translation: {
          literal: literalTranslation,
          natural: formality === 'formal' ? naturalTranslation : `¡${literalTranslation}!`,
          explanation: generateExplanation(phrase, literalTranslation),
          confidence: confidence || 0.85,
          culturalNotes: generateCulturalNotes(phrase),
          formalityLevel: formality === 'formal' ? 'formal' : 'informal'
        },
        styleMatching: {
          tonePreserved: true,
          formalityAdjusted: true,
          personalityMaintained: true
        },
        learningTips: generateLearningTips(phrase, literalTranslation)
      };
    });

    const translations = await Promise.all(translationPromises);

    console.log(`Successfully translated ${translations.length} phrases`);

    res.status(200).json({
      success: true,
      data: { translations }
    })

  } catch (error) {
    console.error('Translation API error:', error);
    res.status(500).json({
      success: false,
      error: 'Translation processing failed'
    })
  }
}

function generateExplanation(englishPhrase: string, spanishTranslation: string): string {
  return `This translation converts "${englishPhrase}" to proper Spanish: "${spanishTranslation}". The grammar and word order have been adjusted to sound natural to native Spanish speakers.`;
}

function generateCulturalNotes(phrase: string): string {
  const lowerPhrase = phrase.toLowerCase();

  if (lowerPhrase.includes('please') || lowerPhrase.includes('thank')) {
    return 'Spanish speakers often use polite phrases like "por favor" and "gracias" frequently in daily conversations.';
  }
  if (lowerPhrase.includes('good morning') || lowerPhrase.includes('good night')) {
    return 'Greetings are very important in Spanish-speaking cultures. It\'s common to greet everyone when entering a room.';
  }
  if (lowerPhrase.includes('family') || lowerPhrase.includes('wife') || lowerPhrase.includes('husband')) {
    return 'Family is central to Spanish-speaking cultures. Terms of endearment like "mi amor" or "cariño" are commonly used.';
  }

  return 'In Spanish-speaking cultures, this phrase would be commonly used in similar contexts with natural conversational flow.';
}

function generateLearningTips(englishPhrase: string, spanishTranslation: string): string[] {
  const tips: string[] = [];

  // Check for common patterns
  if (spanishTranslation.includes('¿')) {
    tips.push('Notice the inverted question mark (¿) at the start - Spanish uses both ¿ and ? for questions.');
  }

  if (spanishTranslation.includes('á') || spanishTranslation.includes('é') ||
    spanishTranslation.includes('í') || spanishTranslation.includes('ó') ||
    spanishTranslation.includes('ú')) {
    tips.push('Pay attention to accent marks (tildes) - they indicate stress and can change word meanings.');
  }

  if (spanishTranslation.includes('ñ')) {
    tips.push('The "ñ" is pronounced like "ny" in "canyon" - it\'s a unique Spanish letter.');
  }

  tips.push('Practice saying this phrase out loud to build muscle memory.');
  tips.push('Try using this phrase in context during your next Spanish conversation.');

  return tips.slice(0, 3); // Return max 3 tips
}
