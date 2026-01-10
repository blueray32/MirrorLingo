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

    const cleanPhrases = inputPhrases.filter(p => p.trim().length > 0);
    const analyzedPhrases = cleanPhrases.map((text, index) => analyzePhrase(text, index, userId));
    const profile = generateProfile(analyzedPhrases, userId);

    userStorage.set(userId, { phrases: analyzedPhrases, profile });
    res.json({ success: true, data: { phrases: analyzedPhrases, profile } });
});

// 2. AI Conversation
app.post('/api/conversation', async (req, res) => {
    const { message, topic, messageHistory } = req.body;

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
        } catch (e) { console.warn('Ollama failed, fallback'); }
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

// 4. Multi-Phrase Translation
app.post('/api/translations', async (req, res) => {
    const { phrases, profile } = req.body;
    const results = await Promise.all(phrases.map(async p => {
        try {
            const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(p)}&langpair=en|es`);
            const data = await response.json();
            const trans = data.responseData.translatedText;
            return {
                englishPhrase: p,
                translation: { literal: trans, natural: trans, explanation: "Natural translation", confidence: 0.9, formalityLevel: profile?.overallFormality || 'informal' },
                styleMatching: { tonePreserved: true, formalityAdjusted: true, personalityMaintained: true },
                learningTips: ["Practice this aloud."]
            };
        } catch (e) { return { englishPhrase: p, translation: { literal: p, natural: p } }; }
    }));
    res.json({ success: true, data: { translations: results } });
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

app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.listen(port, () => console.log(`MirrorLingo Standalone API at http://localhost:${port}`));
