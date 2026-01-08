import type { NextApiRequest, NextApiResponse } from 'next';

interface AudioRequestBody {
    audioData: string;
    contentType: string;
}

interface SpeechMetrics {
    wordsPerMinute: number;
    fillerWordCount: number;
    fillerWordRate: number;
    averagePauseLength: number;
    longPauseCount: number;
    repetitionCount: number;
    totalDuration: number;
    wordCount: number;
    averageConfidence: number;
}

interface TranscriptionResult {
    transcript: string;
    confidence: number;
    speechMetrics: SpeechMetrics;
    alternatives: Array<{
        transcript: string;
        confidence: number;
    }>;
}

// Mock transcription for demo purposes
// In production, this would call AWS Transcribe or similar service
const mockTranscribe = async (audioData: string): Promise<TranscriptionResult> => {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Sample phrases that might be recognized
    const samplePhrases = [
        "Hey, could you send me that report when you get a chance?",
        "I was thinking we could grab coffee later if you're free.",
        "No worries, take your time with it.",
        "Just wanted to follow up on our conversation yesterday.",
        "Let me know if you need anything else from my end."
    ];

    // Return a random combination of sample phrases
    const numPhrases = Math.floor(Math.random() * 3) + 2;
    const selectedPhrases = samplePhrases
        .sort(() => Math.random() - 0.5)
        .slice(0, numPhrases);

    const transcript = selectedPhrases.join(' ');
    const wordCount = transcript.split(' ').length;

    return {
        transcript,
        confidence: 0.85 + Math.random() * 0.1,
        speechMetrics: {
            wordsPerMinute: Math.floor(120 + Math.random() * 60),
            fillerWordCount: Math.floor(Math.random() * 5),
            fillerWordRate: Math.random() * 0.1,
            averagePauseLength: 0.3 + Math.random() * 0.3,
            longPauseCount: Math.floor(Math.random() * 3),
            repetitionCount: Math.floor(Math.random() * 2),
            totalDuration: 15 + Math.random() * 30,
            wordCount,
            averageConfidence: 0.85 + Math.random() * 0.1
        },
        alternatives: [
            {
                transcript: transcript.toLowerCase(),
                confidence: 0.75 + Math.random() * 0.1
            }
        ]
    };
};

// Get allowed origins from environment
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',').map(o => o.trim());

function getCorsOrigin(req: NextApiRequest): string {
    const origin = req.headers.origin;
    if (origin && typeof origin === 'string' && ALLOWED_ORIGINS.includes(origin)) {
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
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-user-id');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            error: 'Method not allowed'
        });
    }

    try {
        const { audioData, contentType } = req.body as AudioRequestBody;
        const userId = req.headers['x-user-id'] as string;

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'User authentication required. Provide x-user-id header.',
                warning: 'This is a demo API. In production, use proper authentication.'
            });
        }

        if (!audioData) {
            return res.status(400).json({
                success: false,
                error: 'No audio data provided'
            });
        }

        // Process the audio (mock transcription for demo)
        const transcriptionResult = await mockTranscribe(audioData);

        return res.status(200).json({
            success: true,
            data: transcriptionResult,
            message: 'Audio processed successfully',
            warning: 'Demo API: Using mock transcription. In production, use AWS Transcribe.'
        });

    } catch (error) {
        console.error('Audio processing error:', error);
        return res.status(500).json({
            success: false,
            error: 'Audio processing failed'
        });
    }
}
