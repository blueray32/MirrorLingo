import { NextApiRequest, NextApiResponse } from 'next';

interface PronunciationRequest {
  transcription?: string;
  audioData?: string;
  targetPhrase: string;
  userId: string;
  confidence?: number;
}

interface PronunciationAnalysis {
  overallScore: number;
  accuracy: number;
  fluency: number;
  pronunciation: number;
  transcription: string;
  confidence: number;
  feedback: {
    strengths: string[];
    improvements: string[];
    specificTips: string[];
  };
}

// Scoring algorithm constants
const SCORING_WEIGHTS = {
  ACCURACY: 0.4,
  FLUENCY: 0.3,
  PRONUNCIATION: 0.3
} as const;

const SCORING_FACTORS = {
  BASE_SIMILARITY: 70,
  CONFIDENCE_FACTOR: 30,
  MAX_INPUT_LENGTH: 500
} as const;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { transcription, targetPhrase, userId, confidence = 0.8 }: PronunciationRequest = req.body;

    // Input validation
    if (!transcription || !targetPhrase || !userId) {
      return res.status(400).json({ 
        error: 'Missing required fields: transcription, targetPhrase, userId' 
      });
    }

    // Validate input lengths
    if (transcription.length > SCORING_FACTORS.MAX_INPUT_LENGTH || 
        targetPhrase.length > SCORING_FACTORS.MAX_INPUT_LENGTH) {
      return res.status(400).json({
        error: 'Input text too long. Maximum length is 500 characters.'
      });
    }

    // Sanitize inputs
    const sanitizedTranscription = sanitizeInput(transcription);
    const sanitizedTargetPhrase = sanitizeInput(targetPhrase);

    // Mock pronunciation analysis for demo
    const analysis: PronunciationAnalysis = generateMockAnalysis(
      sanitizedTranscription, 
      sanitizedTargetPhrase, 
      confidence
    );

    res.status(200).json({
      success: true,
      analysis,
      processingTime: Math.random() * 1000 + 500 // 500-1500ms
    });

  } catch (error) {
    console.error('Pronunciation analysis error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to analyze pronunciation' 
    });
  }
}

function sanitizeInput(input: string): string {
  // Remove potentially harmful characters and normalize whitespace
  return input
    .replace(/[<>\"'&]/g, '') // Remove HTML/script injection characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
    .substring(0, SCORING_FACTORS.MAX_INPUT_LENGTH); // Ensure length limit
}

function generateMockAnalysis(transcription: string, targetPhrase: string, confidence: number): PronunciationAnalysis {
  // Calculate similarity-based scores using constants
  const similarity = calculateSimilarity(transcription.toLowerCase(), targetPhrase.toLowerCase());
  const baseScore = Math.round(similarity * SCORING_FACTORS.BASE_SIMILARITY + confidence * SCORING_FACTORS.CONFIDENCE_FACTOR);
  
  // Generate realistic score variations
  const accuracy = Math.max(0, Math.min(100, baseScore + Math.random() * 20 - 10));
  const fluency = Math.max(0, Math.min(100, confidence * 100 + Math.random() * 15 - 7));
  const pronunciation = Math.max(0, Math.min(100, baseScore + Math.random() * 25 - 12));
  const overall = Math.round((accuracy * SCORING_WEIGHTS.ACCURACY + fluency * SCORING_WEIGHTS.FLUENCY + pronunciation * SCORING_WEIGHTS.PRONUNCIATION));

  // Generate contextual feedback
  const feedback = generateContextualFeedback(transcription, targetPhrase, { accuracy, fluency, pronunciation });

  return {
    overallScore: overall,
    accuracy: Math.round(accuracy),
    fluency: Math.round(fluency),
    pronunciation: Math.round(pronunciation),
    transcription,
    confidence,
    feedback
  };
}

function calculateSimilarity(text1: string, text2: string): number {
  const normalize = (str: string) => str.replace(/[^\w\s]/g, '').trim();
  const norm1 = normalize(text1);
  const norm2 = normalize(text2);
  
  if (norm1 === norm2) return 1.0;
  
  const maxLength = Math.max(norm1.length, norm2.length);
  if (maxLength === 0) return 1.0;
  
  // Simple character-based similarity
  let matches = 0;
  const minLength = Math.min(norm1.length, norm2.length);
  for (let i = 0; i < minLength; i++) {
    if (norm1[i] === norm2[i]) matches++;
  }
  
  return matches / maxLength;
}

function generateContextualFeedback(transcription: string, targetPhrase: string, scores: any) {
  const strengths: string[] = [];
  const improvements: string[] = [];
  const specificTips: string[] = [];

  // Generate feedback based on scores
  if (scores.accuracy > 80) {
    strengths.push('Excellent word recognition');
  } else if (scores.accuracy < 60) {
    improvements.push('Focus on clearer articulation');
    specificTips.push('Speak more slowly and emphasize each syllable');
  }

  if (scores.fluency > 80) {
    strengths.push('Good speaking confidence');
  } else {
    improvements.push('Practice for more natural flow');
    specificTips.push('Record yourself multiple times to build confidence');
  }

  // Spanish-specific feedback
  if (targetPhrase.includes('rr') || targetPhrase.includes('r')) {
    if (!transcription.includes('r')) {
      improvements.push('Work on rolling your Rs');
      specificTips.push('Practice saying "perro" - vibrate your tongue tip against the roof of your mouth');
    } else {
      strengths.push('Good R pronunciation detected');
    }
  }

  if (targetPhrase.includes('ñ')) {
    improvements.push('Master the ñ sound');
    specificTips.push('Say "ny" as in "canyon" but make it one smooth sound');
  }

  // Ensure we always have some feedback
  if (strengths.length === 0) {
    strengths.push('Keep practicing - you\'re making progress!');
  }
  if (improvements.length === 0) {
    improvements.push('Continue practicing pronunciation');
  }
  if (specificTips.length === 0) {
    specificTips.push('Try recording multiple times to improve accuracy');
  }

  return { strengths, improvements, specificTips };
}
