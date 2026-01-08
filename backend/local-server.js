const express = require('express');
const cors = require('cors');
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Mock database
let userData = {
    phrases: [],
    profile: {
        overallTone: 'casual',
        overallFormality: 'informal',
        commonPatterns: [
            {
                type: 'filler_words',
                description: 'Uses filler words like "um" and "like"',
                examples: ['um', 'like'],
                frequency: 0.8
            },
            {
                type: 'contractions',
                description: 'Prefers contractions over full words',
                examples: ["I'll", "can't"],
                frequency: 0.9
            }
        ],
        preferredIntents: ['work', 'social'],
        analysisCount: 0,
        lastUpdated: new Date().toISOString()
    }
};

app.post('/phrases', (req, res) => {
    const { phrases } = req.body;
    const userId = req.headers['x-user-id'] || 'unknown';

    console.log(`Received ${phrases.length} phrases from user ${userId}`);

    const newPhrases = phrases.map(p => ({
        userId,
        phraseId: `phrase_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        englishText: p,
        intent: 'social',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        analysis: {
            tone: 'casual',
            formality: 'informal',
            patterns: [],
            confidence: 0.9,
            analysisDate: new Date().toISOString()
        }
    }));

    userData.phrases = [...userData.phrases, ...newPhrases];
    userData.profile.analysisCount += 1;
    userData.profile.lastUpdated = new Date().toISOString();

    res.status(201).json({
        success: true,
        data: {
            phrases: newPhrases,
            profile: userData.profile
        },
        message: `Successfully analyzed ${phrases.length} phrases.`
    });
});

app.get('/phrases', (req, res) => {
    const userId = req.headers['x-user-id'];
    console.log(`Retrieving data for user ${userId}`);

    res.json({
        success: true,
        data: userData
    });
});

app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'MirrorLingo Local API is healthy',
        timestamp: new Date().toISOString()
    });
});

app.listen(port, () => {
    console.log(`MirrorLingo Local API listening at http://localhost:${port}`);
});
