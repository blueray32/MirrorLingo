const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for audio data

// Environment variables for Ollama
const OLLAMA_API_URL = process.env.OLLAMA_API_URL;
const MODEL_NAME = process.env.OLLAMA_MODEL || 'llama3.1:8b';

// --- Data Types (Shared with Frontend Logic) ---
const ToneLevel = { POLITE: 'polite', CASUAL: 'casual', NEUTRAL: 'neutral' };
const FormalityLevel = { FORMAL: 'formal', INFORMAL: 'informal', SEMI_FORMAL: 'semi_formal' };
const PatternType = { CONTRACTIONS: 'contractions', FILLER_WORDS: 'filler_words', POLITENESS_MARKERS: 'politeness_markers', QUESTION_STYLE: 'question_style', SENTENCE_LENGTH: 'sentence_length' };
const IntentCategory = { WORK: 'work', FAMILY: 'family', SOCIAL: 'social', FORMAL: 'formal', CASUAL: 'casual' };

// --- Storage ---
// WARNING: In-memory storage - data is lost on server restart
const userStorage = new Map();

// --- Helper Functions (Ported from Next.js API Routes) ---

const analyzePhrase = (text, index, userId) => {
    const lowerText = text.toLowerCase();
    const now = new Date().toISOString();

    const tone = lowerText.includes('please') || lowerText.includes('thank') ? ToneLevel.POLITE : lowerText.includes('!') ? ToneLevel.CASUAL : ToneLevel.NEUTRAL;
    const hasContractions = /\b(don't|won't|can't|i'm|you're|it's)\b/i.test(text);
    const formality = hasContractions ? FormalityLevel.INFORMAL : FormalityLevel.SEMI_FORMAL;

    let intent = IntentCategory.CASUAL;
    if (lowerText.includes('work') || lowerText.includes('meeting') || lowerText.includes('project')) intent = IntentCategory.WORK;
    else if (lowerText.includes('family') || lowerText.includes('home') || lowerText.includes('dinner')) intent = IntentCategory.FAMILY;
    else if (lowerText.includes('could you') || lowerText.includes('please')) intent = IntentCategory.FORMAL;
    else if (lowerText.includes('friend') || lowerText.includes('party') || lowerText.includes('fun')) intent = IntentCategory.SOCIAL;

    const patterns = [];
    if (hasContractions) patterns.push({ type: PatternType.CONTRACTIONS, description: 'Uses contractions for casual tone', examples: ["don't", "won't", "can't"], frequency: 0.7 });
    if (/\b(um|uh|like|you know)\b/i.test(text)) patterns.push({ type: PatternType.FILLER_WORDS, description: 'Natural speech patterns with filler words', examples: ['um', 'like', 'you know'], frequency: 0.5 });
    if (/please|thank you|sorry/i.test(text)) patterns.push({ type: PatternType.POLITENESS_MARKERS, description: 'Polite communication style', examples: ['please', 'thank you', 'sorry'], frequency: 0.6 });
    if (text.includes('?')) patterns.push({ type: PatternType.QUESTION_STYLE, description: 'Asks questions to engage', examples: ['could you...?', 'would you mind...?'], frequency: 0.4 });

    return {
        userId,
        phraseId: `phrase-${Date.now()}-${index}`,
        englishText: text,
        intent,
        createdAt: now,
        updatedAt: now,
        analysis: { tone, formality, patterns, confidence: 0.85 + Math.random() * 0.1, analysisDate: now }
    };
};

const generateProfile = (phrases, userId) => {
    const allPatterns = phrases.flatMap(p => p.analysis?.patterns || []);
    const tones = phrases.map(p => p.analysis?.tone || ToneLevel.NEUTRAL);
    const formalities = phrases.map(p => p.analysis?.formality || FormalityLevel.SEMI_FORMAL);
    const intents = phrases.map(p => p.intent);

    const toneCount = {};
    tones.forEach(t => { toneCount[t] = (toneCount[t] || 0) + 1; });
    const overallTone = Object.entries(toneCount).sort((a, b) => b[1] - a[1])[0]?.[0] || ToneLevel.NEUTRAL;

    const formalityCount = {};
    formalities.forEach(f => { formalityCount[f] = (formalityCount[f] || 0) + 1; });
    const overallFormality = Object.entries(formalityCount).sort((a, b) => b[1] - a[1])[0]?.[0] || FormalityLevel.SEMI_FORMAL;

    const intentCount = {};
    intents.forEach(i => { intentCount[i] = (intentCount[i] || 0) + 1; });
    const preferredIntents = Object.entries(intentCount).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([intent]) => intent);

    const patternFrequency = {};
    allPatterns.forEach(p => {
        if (!patternFrequency[p.type]) patternFrequency[p.type] = { pattern: p, count: 0 };
        patternFrequency[p.type].count += 1;
    });

    const commonPatterns = Object.values(patternFrequency)
        .map(({ pattern, count }) => ({ ...pattern, frequency: count / phrases.length }))
        .filter(p => p.frequency > 0.2)
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 5);

    return { userId, overallTone, overallFormality, commonPatterns, preferredIntents, analysisCount: phrases.length, lastUpdated: new Date().toISOString() };
};

// --- Endpoints ---

// 1. Phrasal Analysis & Profile
app.get('/api/phrases', (req, res) => {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json({ success: false, error: 'User ID required' });

    const data = userStorage.get(userId) || { phrases: [], profile: null };
    res.json({ success: true, data });
});

app.post('/api/phrases', async (req, res) => {
    const userId = req.headers['x-user-id'];
    const { phrases: inputPhrases } = req.body;

    if (!userId || !inputPhrases) return res.status(400).json({ success: false, error: 'Missing userId or phrases' });

    const existingData = userStorage.get(userId) || { phrases: [], profile: null };
    const cleanPhrases = inputPhrases.filter(p => {
        const text = p.trim();
        if (text.length === 0) return false;
        // Avoid duplicate phrases for the same user
        return !existingData.phrases.some(ep => ep.englishText.toLowerCase().trim() === text.toLowerCase());
    });

    if (cleanPhrases.length > 0) {
        const newAnalyzed = cleanPhrases.map((text, index) => analyzePhrase(text, existingData.phrases.length + index, userId));
        existingData.phrases = [...existingData.phrases, ...newAnalyzed];
        existingData.profile = generateProfile(existingData.phrases, userId);
        userStorage.set(userId, existingData);
        console.log(`[phrases] Added ${cleanPhrases.length} new phrases for user ${userId}. Total: ${existingData.phrases.length}`);
    }

    res.json({ success: true, data: { phrases: existingData.phrases, profile: existingData.profile } });
});

// 2. AI Conversation
app.post('/api/conversation', async (req, res) => {
    let { message, topic, messageHistory, context } = req.body;

    // Handle mobile format where history is inside context
    if (context && !messageHistory) {
        messageHistory = context.previousMessages;
        topic = context.topic;
    }

    // Ensure messageHistory is an array
    if (!messageHistory) messageHistory = [];

    if (OLLAMA_API_URL) {
        try {
            const systemPrompt = `You are a helpful Spanish tutor. Topic: ${topic}. Speak only Spanish. Correct major mistakes in English at the end (Correction: ...).`;
            const response = await fetch(OLLAMA_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: MODEL_NAME,
                    messages: [{ role: 'system', content: systemPrompt }, ...messageHistory, { role: 'user', content: message }],
                    stream: false
                })
            });
            const data = await response.json();
            const fullText = data.message?.content || "";
            const [resp, corr] = fullText.split(/Correction:/i);

            return res.json({
                success: true,
                data: { response: resp.trim(), correction: corr ? { original: "...", corrected: corr.trim(), explanation: "Grammar" } : undefined }
            });
        } catch (e) {
            console.error('Ollama Error:', e.message);
            console.warn('Ollama failed, fallback');
        }
    }

    // Mock logic
    const responses = { daily_life: ["¡Qué bien!", "¿Y qué más?"], work: ["Entiendo.", "¿Es difícil?"], free_conversation: ["Interesante."] };
    const topicRes = responses[topic] || responses.free_conversation;
    res.json({ success: true, data: { response: topicRes[Math.floor(Math.random() * topicRes.length)] } });
});

// 3. Audio Transcription (Mock + Real ingestion)
app.post('/api/audio', async (req, res) => {
    const { audioData, transcript: clientTranscript } = req.body;
    if (!audioData && !clientTranscript) return res.status(400).json({ success: false, error: 'No audio or transcript' });

    // Use client-side transcript if provided (from Web Speech API)
    const transcript = clientTranscript || "I was thinking we could grab coffee later.";
    const wordCount = transcript.split(/\s+/).filter(w => w.length > 0).length;

    // Simple duration estimate if not provided (assume 140 WPM)
    const totalDuration = Math.max(2, Math.round((wordCount / 140) * 60));

    res.json({
        success: true,
        data: {
            transcript: transcript,
            confidence: clientTranscript ? 0.95 : 0.92, // Higher confidence for real speech API
            speechMetrics: {
                wordsPerMinute: 140,
                wordCount: wordCount,
                totalDuration: totalDuration,
                fillerWordCount: (transcript.match(/\b(um|uh|like|you know)\b/gi) || []).length
            }
        }
    });
});

// 4. Multi-Phrase Translation (using Ollama)
const backendTranslationCache = new Map();

app.post('/api/translations', async (req, res) => {
    const { phrases, profile } = req.body;
    const userId = req.headers['x-user-id'];

    if (!phrases || !Array.isArray(phrases)) {
        return res.status(400).json({ success: false, error: 'Phrases array required' });
    }

    const results = await Promise.all(phrases.map(async p => {
        const cacheKey = p.toLowerCase().trim();

        // Check cache first
        if (backendTranslationCache.has(cacheKey)) {
            console.log(`[translations] Backend cache hit for: "${p}"`);
            return backendTranslationCache.get(cacheKey);
        }

        try {
            if (OLLAMA_API_URL) {
                const systemPrompt = `You are an English-Spanish translator. Translate the given English phrase to Spanish.
Reply with ONLY the Spanish translation, nothing else. Be natural and conversational.
Do not include quotes or explanations.`;

                const response = await fetch(OLLAMA_API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        model: MODEL_NAME,
                        messages: [
                            { role: 'system', content: systemPrompt },
                            { role: 'user', content: `Translate to Spanish: "${p}"` }
                        ],
                        stream: false,
                        options: { temperature: 0.3, num_predict: 100 }
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    const trans = data.message?.content?.trim()
                        .replace(/^["']|["']$/g, '')
                        .replace(/^Translation:\s*/i, '')
                        .trim() || p;

                    console.log(`[translations] Ollama translated: "${p}" -> "${trans}"`);

                    const result = {
                        englishPhrase: p,
                        translation: { literal: trans, natural: trans, explanation: "Natural translation", confidence: 0.9, formalityLevel: profile?.overallFormality || 'informal' },
                        styleMatching: { tonePreserved: true, formalityAdjusted: true, personalityMaintained: true },
                        learningTips: ["Practice this aloud."]
                    };

                    backendTranslationCache.set(cacheKey, result);
                    return result;
                }
            }
            throw new Error('Ollama unavailable');
        } catch (e) {
            console.warn(`[translations] Ollama failed for "${p}":`, e.message);
            return { englishPhrase: p, translation: { literal: p, natural: p, explanation: "Fallback translation" } };
        }
    }));

    // Persist translations if userId is provided and user exists
    if (userId && userStorage.has(userId)) {
        const userData = userStorage.get(userId);
        let updatedCount = 0;

        results.forEach(res => {
            const phrase = userData.phrases.find(ph => ph.englishText.toLowerCase().trim() === res.englishPhrase.toLowerCase().trim());
            if (phrase) {
                phrase.translations = res.translation;
                updatedCount++;
            }
        });

        if (updatedCount > 0) {
            userStorage.set(userId, userData);
            console.log(`[translations] Persisted ${updatedCount} translations for user ${userId}`);
        }
    }

    res.json({ success: true, data: { translations: results } });
});

// 5. Intelligent Transcript Segmentation (using Ollama)
app.post('/api/transcript/segment', async (req, res) => {
    const { transcript } = req.body;

    if (!transcript || transcript.trim().length === 0) {
        return res.json({ success: true, data: { segments: [] } });
    }

    try {
        if (OLLAMA_API_URL) {
            const systemPrompt = `You are a speech processing assistant. 
Given a raw, unpunctuated speech transcript, split it into a list of logical, complete sentences.
Return ONLY a JSON array of strings. No explanations, no markdown blocks. 
Example: ["Hello how are you", "I am doing well"]`;

            const response = await fetch(OLLAMA_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: MODEL_NAME,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: `Segment this transcript: "${transcript}"` }
                    ],
                    stream: false,
                    options: { temperature: 0.1 }
                })
            });

            if (response.ok) {
                const data = await response.json();
                let fullText = data.message?.content?.trim() || "[]";

                // Try to extract JSON array if Ollama included extra text
                const match = fullText.match(/\[.*\]/s);
                if (match) fullText = match[0];

                try {
                    const segments = JSON.parse(fullText);
                    if (Array.isArray(segments)) {
                        console.log(`[segment] Successfully split transcript into ${segments.length} segments`);
                        return res.json({ success: true, data: { segments } });
                    }
                } catch (pe) {
                    console.error('[segment] JSON parse error:', pe.message, fullText);
                }
            }
        }
    } catch (e) {
        console.error('[segment] Ollama Error:', e.message);
    }

    // Fallback: simple split by punctuation or long spaces
    const segments = transcript.split(/[.!?]+|\s{2,}/).map(s => s.trim()).filter(s => s.length > 5);
    res.json({ success: true, data: { segments } });
});

// 5. Single Word Dictionary Lookup (Spanish to English)
app.post('/api/dictionary/lookup', async (req, res) => {
    const { word } = req.body;
    if (!word) return res.status(400).json({ success: false, error: 'Word is required' });

    const cacheKey = `dict_${word.toLowerCase().trim()}`;
    if (backendTranslationCache.has(cacheKey)) {
        return res.json({ success: true, data: { translation: backendTranslationCache.get(cacheKey) } });
    }

    try {
        if (OLLAMA_API_URL) {
            const systemPrompt = `You are a Spanish-English dictionary. 
Translate the given Spanish word to English. 
Reply with ONLY the English translation, no other text.
If there are multiple meanings, give the most common one.
Use lowercase.`;

            const response = await fetch(OLLAMA_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: MODEL_NAME,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: word }
                    ],
                    stream: false,
                    options: { temperature: 0.1, num_predict: 20 }
                })
            });

            if (response.ok) {
                const data = await response.json();
                const trans = data.message?.content?.trim()
                    .replace(/^["']|["']$/g, '')
                    .toLowerCase()
                    .trim();

                console.log(`[dictionary] Ollama looked up: "${word}" -> "${trans}"`);
                backendTranslationCache.set(cacheKey, trans);
                return res.json({ success: true, data: { translation: trans } });
            }
        }
        throw new Error('Ollama unavailable');
    } catch (e) {
        console.warn(`[dictionary] Ollama lookup failed for "${word}":`, e.message);
        res.status(500).json({ success: false, error: 'Translation failed' });
    }
});

// 5. Pronunciation Analysis (Mock)
app.post('/api/pronunciation/analyze', async (req, res) => {
    const { transcription, targetPhrase } = req.body;
    res.json({
        success: true,
        analysis: {
            overallScore: 85, accuracy: 88, fluency: 82, pronunciation: 85,
            transcription, confidence: 0.85,
            detailedFeedback: { strengths: ['Clear speech'], improvements: ['Natural rhythm'], specificTips: ['Keep practicing'] }
        }
    });
});

// 6. Letta Integration (Mock)
app.get('/api/letta/status', (req, res) => {
    res.json({ success: true, enabled: true });
});

app.post('/api/letta/sync-profile', (req, res) => {
    const userId = req.headers['x-user-id'];
    console.log(`Syncing profile for user ${userId} to Letta`);
    res.json({ success: true });
});

// Spaced Repetition Sync Endpoints
app.post('/api/letta/sync-spaced-repetition', (req, res) => {
    const userId = req.headers['x-user-id'];
    const { reviewItems, deviceId } = req.body;

    if (!userId) {
        return res.status(401).json({ error: 'User authentication required' });
    }

    console.log(`Syncing ${reviewItems?.length || 0} review items for user ${userId} from device ${deviceId}`);

    // Mock sync - in real implementation, this would sync to Letta
    const syncResult = {
        success: true,
        syncedItems: reviewItems?.length || 0,
        lastSyncTimestamp: new Date()
    };

    res.json(syncResult);
});

app.get('/api/letta/get-spaced-repetition', (req, res) => {
    const userId = req.headers['x-user-id'];

    if (!userId) {
        return res.status(401).json({ error: 'User authentication required' });
    }

    console.log(`Getting spaced repetition data for user ${userId}`);

    // Mock response - in real implementation, this would fetch from Letta
    const mockData = {
        reviewItems: [],
        syncStatus: {
            isEnabled: true,
            lastSync: new Date(),
            pendingSync: false,
            itemCount: 0,
            conflicts: 0
        }
    };

    res.json(mockData);
});

// Conversation Memory Endpoints
app.get('/api/conversation-memory/relationship-status', (req, res) => {
    const userId = req.headers['x-user-id'];

    if (!userId) {
        return res.status(401).json({ error: 'User authentication required' });
    }

    console.log(`Getting relationship status for user ${userId}`);

    // Mock relationship status - in real implementation, this would fetch from Letta
    const mockRelationshipStatus = {
        level: 'friend',
        progressToNext: 65,
        daysSinceFirstMeeting: 14,
        totalConversations: 12,
        favoriteTopics: ['daily_life', 'hobbies', 'food'],
        recentMemories: [
            'User mentioned loving coffee',
            'User works in technology',
            'User has a cat named Luna'
        ]
    };

    res.json({ relationshipStatus: mockRelationshipStatus });
});

app.get('/api/conversation-memory/conversation-memory', (req, res) => {
    const userId = req.headers['x-user-id'];

    if (!userId) {
        return res.status(401).json({ error: 'User authentication required' });
    }

    console.log(`Getting conversation memory for user ${userId}`);

    // Mock conversation memory - in real implementation, this would fetch from Letta
    const mockConversationMemory = {
        userId,
        personalDetails: [
            {
                id: 'detail_1',
                category: 'work',
                detail: 'User works in technology',
                confidence: 0.9,
                importance: 'medium'
            },
            {
                id: 'detail_2',
                category: 'hobbies',
                detail: 'User loves coffee',
                confidence: 0.8,
                importance: 'low'
            }
        ],
        relationshipLevel: 'friend',
        tutorPersonality: {
            name: 'María',
            characteristics: ['friendly', 'patient', 'encouraging'],
            relationshipStyle: 'friendly'
        },
        totalConversations: 12,
        lastInteraction: new Date()
    };

    res.json({ conversationMemory: mockConversationMemory });
});

// Pronunciation Evolution Endpoints
app.get('/api/pronunciation-evolution/phoneme-progress', (req, res) => {
    const userId = req.headers['x-user-id'];

    if (!userId) {
        return res.status(401).json({ error: 'User authentication required' });
    }

    console.log(`Getting phoneme progress for user ${userId}`);

    // Mock phoneme progress data
    const mockPhonemeProgress = [
        {
            phoneme: 'rr',
            category: 'trill',
            difficulty: 'very_hard',
            currentAccuracy: 65,
            improvementRate: 2.3,
            masteryLevel: 'developing',
            practiceCount: 15,
            targetAccuracy: 85,
            personalizedTips: ['Relax your tongue', 'Start with single R', 'Practice "erre" sound']
        },
        {
            phoneme: 'ñ',
            category: 'consonant',
            difficulty: 'hard',
            currentAccuracy: 78,
            improvementRate: 1.8,
            masteryLevel: 'proficient',
            practiceCount: 12,
            targetAccuracy: 85,
            personalizedTips: ['Touch tongue to roof of mouth', 'Like "ny" in canyon', 'Practice "niño"']
        },
        {
            phoneme: 'll',
            category: 'consonant',
            difficulty: 'medium',
            currentAccuracy: 82,
            improvementRate: 0.5,
            masteryLevel: 'proficient',
            practiceCount: 8,
            targetAccuracy: 85,
            personalizedTips: ['Soft "y" sound in most regions', 'Practice "llamar"']
        }
    ];

    res.json({ phonemeProgress: mockPhonemeProgress });
});

app.get('/api/pronunciation-evolution/coaching', (req, res) => {
    const userId = req.headers['x-user-id'];

    if (!userId) {
        return res.status(401).json({ error: 'User authentication required' });
    }

    console.log(`Getting coaching program for user ${userId}`);

    // Mock coaching program
    const mockCoachingProgram = {
        currentFocus: ['rr', 'ñ'],
        recommendedExercises: [
            {
                id: 'rr_practice_1',
                type: 'repetition',
                targetPhonemes: ['rr'],
                difficulty: 3,
                estimatedDuration: 5,
                description: 'Practice rolling R with "perro", "carro", "ferrocarril"',
                examples: ['perro', 'carro', 'ferrocarril']
            },
            {
                id: 'n_practice_1',
                type: 'minimal_pairs',
                targetPhonemes: ['ñ'],
                difficulty: 2,
                estimatedDuration: 3,
                description: 'Distinguish ñ from n: "año/ano", "niño/nino"',
                examples: ['año - ano', 'niño - nino', 'señor - senor']
            }
        ],
        nextMilestone: {
            id: 'first_rr',
            title: 'First Rolling R',
            description: 'Successfully pronounce "rr" with 70% accuracy',
            requiredAccuracy: 70,
            achieved: false
        }
    };

    res.json({ coachingProgram: mockCoachingProgram });
});

app.post('/api/pronunciation-evolution/track-progress', (req, res) => {
    const userId = req.headers['x-user-id'];
    const { phonemeScores, context } = req.body;

    if (!userId) {
        return res.status(401).json({ error: 'User authentication required' });
    }

    console.log(`Tracking pronunciation progress for user ${userId}:`, phonemeScores);

    // Mock analysis result
    const mockAnalysisResult = {
        improvementDetected: Math.random() > 0.5,
        regressionDetected: false,
        newMilestones: [],
        evolutionSummary: Math.random() > 0.7 ?
            '🎉 Great improvement in rolling R pronunciation!' :
            Math.random() > 0.5 ?
                '📈 Steady progress in Spanish pronunciation!' :
                '🔄 Keep practicing - consistency is key!'
    };

    res.json({ analysisResult: mockAnalysisResult });
});

// Mistake Pattern Learning Endpoints
app.get('/api/mistake-patterns/categories', (req, res) => {
    const userId = req.headers['x-user-id'];

    if (!userId) {
        return res.status(401).json({ error: 'User authentication required' });
    }

    console.log(`Getting mistake categories for user ${userId}`);

    // Mock mistake categories
    const mockMistakeCategories = [
        {
            type: 'ser_vs_estar',
            totalOccurrences: 8,
            improvementRate: 1.2,
            masteryLevel: 'developing',
            focusLevel: 'high',
            lastPracticed: new Date(),
            targetAccuracy: 80,
            currentAccuracy: 65
        },
        {
            type: 'gender_agreement',
            totalOccurrences: 5,
            improvementRate: 0.8,
            masteryLevel: 'improving',
            focusLevel: 'medium',
            lastPracticed: new Date(),
            targetAccuracy: 80,
            currentAccuracy: 72
        },
        {
            type: 'verb_conjugation',
            totalOccurrences: 3,
            improvementRate: -0.2,
            masteryLevel: 'struggling',
            focusLevel: 'high',
            lastPracticed: new Date(),
            targetAccuracy: 80,
            currentAccuracy: 58
        }
    ];

    res.json({ mistakeCategories: mockMistakeCategories });
});

app.get('/api/mistake-patterns/lessons', (req, res) => {
    const userId = req.headers['x-user-id'];

    if (!userId) {
        return res.status(401).json({ error: 'User authentication required' });
    }

    console.log(`Getting personalized lessons for user ${userId}`);

    // Mock personalized lessons
    const mockPersonalizedLessons = [
        {
            id: 'ser_vs_estar_basics',
            title: 'Master Ser vs Estar',
            targetMistakes: ['ser_vs_estar'],
            difficulty: 3,
            estimatedDuration: 5,
            content: {
                explanation: 'The key difference: SER for permanent characteristics, ESTAR for temporary states and locations.',
                rule: 'Use SER for identity, characteristics, time, origin. Use ESTAR for location, emotions, ongoing actions.',
                commonErrors: ['Soy en casa', 'Estoy médico', 'Es en el parque'],
                tips: ['Remember: SER = permanent, ESTAR = temporary', 'Location always uses ESTAR', 'Emotions use ESTAR']
            },
            examples: [
                {
                    incorrect: 'Soy en casa',
                    correct: 'Estoy en casa',
                    explanation: 'Location requires ESTAR',
                    context: 'Talking about where you are'
                }
            ],
            completionStatus: 'not_started'
        },
        {
            id: 'gender_agreement_basics',
            title: 'Gender Agreement Mastery',
            targetMistakes: ['gender_agreement'],
            difficulty: 2,
            estimatedDuration: 4,
            content: {
                explanation: 'Spanish nouns have gender (masculine/feminine) and adjectives must agree.',
                rule: 'Masculine nouns typically end in -o, feminine in -a. Adjectives change to match.',
                commonErrors: ['La problema', 'Un casa grande', 'El agua fría'],
                tips: ['Learn noun gender with the article', 'Some words are exceptions (el problema, la mano)']
            },
            examples: [
                {
                    incorrect: 'La problema',
                    correct: 'El problema',
                    explanation: 'Problema is masculine despite ending in -a',
                    context: 'Common exception to gender rules'
                }
            ],
            completionStatus: 'in_progress'
        }
    ];

    res.json({ personalizedLessons: mockPersonalizedLessons });
});

app.get('/api/mistake-patterns/trends', (req, res) => {
    const userId = req.headers['x-user-id'];

    if (!userId) {
        return res.status(401).json({ error: 'User authentication required' });
    }

    console.log(`Getting improvement trends for user ${userId}`);

    // Mock improvement trends
    const mockImprovementTrends = [
        {
            mistakeType: 'ser_vs_estar',
            overallTrend: 'improving',
            recentImprovement: true,
            plateauDetected: false
        },
        {
            mistakeType: 'gender_agreement',
            overallTrend: 'stable',
            recentImprovement: false,
            plateauDetected: true
        },
        {
            mistakeType: 'verb_conjugation',
            overallTrend: 'declining',
            recentImprovement: false,
            plateauDetected: false
        }
    ];

    res.json({ improvementTrends: mockImprovementTrends });
});

app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.listen(port, () => console.log(`MirrorLingo Standalone API at http://localhost:${port}`));
