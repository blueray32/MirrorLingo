import type { NextApiRequest, NextApiResponse } from 'next';
import {
    ToneLevel,
    FormalityLevel,
    PatternType,
    IntentCategory,
    LanguagePattern,
    Phrase,
    IdiolectProfile,
    IdiolectAnalysis
} from '../../types/phrases';

interface PhrasesRequestBody {
    phrases: string[];
}

// Enhanced phrase analysis - returns proper Phrase structure
const analyzePhrase = (text: string, index: number, userId: string): Phrase => {
    const lowerText = text.toLowerCase();
    const now = new Date().toISOString();

    // Detect tone
    const tone = lowerText.includes('please') || lowerText.includes('thank')
        ? ToneLevel.POLITE
        : lowerText.includes('!')
            ? ToneLevel.CASUAL
            : ToneLevel.NEUTRAL;

    // Detect formality
    const hasContractions = /\b(don't|won't|can't|i'm|you're|it's)\b/i.test(text);
    const formality = hasContractions ? FormalityLevel.INFORMAL : FormalityLevel.SEMI_FORMAL;

    // Detect intent
    let intent: IntentCategory = IntentCategory.CASUAL;
    if (lowerText.includes('work') || lowerText.includes('meeting') || lowerText.includes('project')) {
        intent = IntentCategory.WORK;
    } else if (lowerText.includes('family') || lowerText.includes('home') || lowerText.includes('dinner')) {
        intent = IntentCategory.FAMILY;
    } else if (lowerText.includes('could you') || lowerText.includes('please')) {
        intent = IntentCategory.FORMAL;
    } else if (lowerText.includes('friend') || lowerText.includes('party') || lowerText.includes('fun')) {
        intent = IntentCategory.SOCIAL;
    }

    // Detect patterns for analysis
    const patterns: LanguagePattern[] = [];
    if (hasContractions) {
        patterns.push({
            type: PatternType.CONTRACTIONS,
            description: 'Uses contractions for casual tone',
            examples: ["don't", "won't", "can't"],
            frequency: 0.7
        });
    }
    if (/\b(um|uh|like|you know)\b/i.test(text)) {
        patterns.push({
            type: PatternType.FILLER_WORDS,
            description: 'Natural speech patterns with filler words',
            examples: ['um', 'like', 'you know'],
            frequency: 0.5
        });
    }
    if (/please|thank you|sorry/i.test(text)) {
        patterns.push({
            type: PatternType.POLITENESS_MARKERS,
            description: 'Polite communication style',
            examples: ['please', 'thank you', 'sorry'],
            frequency: 0.6
        });
    }
    if (text.includes('?')) {
        patterns.push({
            type: PatternType.QUESTION_STYLE,
            description: 'Asks questions to engage',
            examples: ['could you...?', 'would you mind...?'],
            frequency: 0.4
        });
    }

    // Create proper IdiolectAnalysis object
    const analysis: IdiolectAnalysis = {
        tone,
        formality,
        patterns,
        confidence: 0.85 + Math.random() * 0.1,
        analysisDate: now
    };

    return {
        userId,
        phraseId: `phrase-${Date.now()}-${index}`,
        englishText: text,
        intent,
        createdAt: now,
        updatedAt: now,
        analysis
    };
};

// Generate user profile from analyzed phrases
const generateProfile = (phrases: Phrase[], userId: string): IdiolectProfile => {
    const allPatterns = phrases.flatMap(p => p.analysis?.patterns || []);
    const tones = phrases.map(p => p.analysis?.tone || ToneLevel.NEUTRAL);
    const formalities = phrases.map(p => p.analysis?.formality || FormalityLevel.SEMI_FORMAL);
    const intents = phrases.map(p => p.intent);

    // Calculate most common tone
    const toneCount: Record<string, number> = {};
    tones.forEach(t => { toneCount[t] = (toneCount[t] || 0) + 1; });
    const overallTone = Object.entries(toneCount)
        .sort((a, b) => b[1] - a[1])[0]?.[0] as ToneLevel || ToneLevel.NEUTRAL;

    // Calculate most common formality
    const formalityCount: Record<string, number> = {};
    formalities.forEach(f => { formalityCount[f] = (formalityCount[f] || 0) + 1; });
    const overallFormality = Object.entries(formalityCount)
        .sort((a, b) => b[1] - a[1])[0]?.[0] as FormalityLevel || FormalityLevel.SEMI_FORMAL;

    // Get preferred intents
    const intentCount: Record<string, number> = {};
    intents.forEach(i => { intentCount[i] = (intentCount[i] || 0) + 1; });
    const preferredIntents = Object.entries(intentCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([intent]) => intent as IntentCategory);

    // Build common patterns with aggregated frequencies
    const patternFrequency: Record<string, { pattern: LanguagePattern; count: number }> = {};
    allPatterns.forEach(p => {
        if (!patternFrequency[p.type]) {
            patternFrequency[p.type] = { pattern: p, count: 0 };
        }
        patternFrequency[p.type].count += 1;
    });

    const commonPatterns: LanguagePattern[] = Object.values(patternFrequency)
        .map(({ pattern, count }) => ({
            ...pattern,
            frequency: count / phrases.length
        }))
        .filter(p => p.frequency > 0.2)
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 5);

    return {
        userId,
        overallTone,
        overallFormality,
        commonPatterns,
        preferredIntents,
        analysisCount: phrases.length,
        lastUpdated: new Date().toISOString()
    };
};

// WARNING: In-memory storage - data is lost on server restart
// This is for demo/development purposes only
// In production, use the backend API which connects to DynamoDB
const demoStorage: Map<string, { phrases: Phrase[]; profile: IdiolectProfile | null }> = new Map();

// Get allowed origins from environment or default to localhost
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',').map(o => o.trim());

function getCorsOrigin(req: NextApiRequest): string {
    const origin = req.headers.origin;
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
        return origin;
    }
    return ALLOWED_ORIGINS[0];
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // Handle CORS with validated origin
    const allowedOrigin = getCorsOrigin(req);
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-user-id');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
        return res.status(401).json({
            success: false,
            error: 'User authentication required. Provide x-user-id header.',
            warning: 'This is a demo API. In production, use proper authentication.'
        });
    }

    // Get user's data from demo storage
    const userData = demoStorage.get(userId) || { phrases: [], profile: null };

    if (req.method === 'GET') {
        // Return stored phrases and profile for this user
        return res.status(200).json({
            success: true,
            data: {
                phrases: userData.phrases,
                profile: userData.profile
            },
            warning: 'Demo API: Data stored in memory only'
        });
    }

    if (req.method === 'POST') {
        try {
            const { phrases: inputPhrases } = req.body as PhrasesRequestBody;

            if (!inputPhrases || !Array.isArray(inputPhrases) || inputPhrases.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'No phrases provided'
                });
            }

            // Filter out empty phrases
            const cleanPhrases = inputPhrases.filter(p => p.trim().length > 0);

            if (cleanPhrases.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'All phrases are empty'
                });
            }

            // Simulate processing time
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Analyze each phrase
            const analyzedPhrases = cleanPhrases.map((text, index) =>
                analyzePhrase(text, index, userId)
            );

            // Generate profile
            const profile = generateProfile(analyzedPhrases, userId);

            // Store for this user in demo storage
            demoStorage.set(userId, { phrases: analyzedPhrases, profile });

            return res.status(200).json({
                success: true,
                data: {
                    phrases: analyzedPhrases,
                    profile
                },
                message: 'Phrases analyzed successfully',
                warning: 'Demo API: Data stored in memory only'
            });

        } catch (error) {
            console.error('Phrase analysis error:', error);
            return res.status(500).json({
                success: false,
                error: 'Phrase analysis failed'
            });
        }
    }

    return res.status(405).json({
        success: false,
        error: 'Method not allowed'
    });
}
