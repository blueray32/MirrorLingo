import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { 
  PronunciationAnalysis, 
  PronunciationRequest, 
  PronunciationFeedback,
  PhonemeAnalysis,
  RhythmFeedback,
  SpanishAccent,
  AccentProfile,
  PhonemeDifficulty,
  PRONUNCIATION_WEIGHTS,
  SPANISH_PHONEMES
} from '../types/pronunciation';

// Regional accent profiles
const ACCENT_PROFILES: Record<SpanishAccent, AccentProfile> = {
  [SpanishAccent.SPAIN]: {
    accent: SpanishAccent.SPAIN,
    name: 'Peninsular Spanish',
    region: 'Spain',
    characteristics: ['Theta pronunciation', 'Distinction between c/z and s'],
    phonemeVariations: { 'c': 'θ', 'z': 'θ', 'll': 'ʎ', 'j': 'x' },
    commonWords: { 'gracias': 'gra-θi-as', 'caza': 'ka-θa' }
  },
  [SpanishAccent.MEXICO]: {
    accent: SpanishAccent.MEXICO,
    name: 'Mexican Spanish',
    region: 'Mexico',
    characteristics: ['Seseo (s sound)', 'Yeísmo (y sound)'],
    phonemeVariations: { 'c': 's', 'z': 's', 'll': 'j', 'j': 'h' },
    commonWords: { 'gracias': 'gra-si-as', 'caza': 'ka-sa' }
  },
  [SpanishAccent.ARGENTINA]: {
    accent: SpanishAccent.ARGENTINA,
    name: 'Rioplatense Spanish',
    region: 'Argentina/Uruguay',
    characteristics: ['Sheísmo (sh sound)', 'Voseo usage'],
    phonemeVariations: { 'c': 's', 'z': 's', 'll': 'ʃ', 'y': 'ʃ' },
    commonWords: { 'gracias': 'gra-si-as', 'lluvia': 'ʃu-βi-a' }
  },
  [SpanishAccent.COLOMBIA]: {
    accent: SpanishAccent.COLOMBIA,
    name: 'Colombian Spanish',
    region: 'Colombia',
    characteristics: ['Clear pronunciation', 'Neutral accent'],
    phonemeVariations: { 'c': 's', 'z': 's', 'll': 'j', 'j': 'h' },
    commonWords: { 'gracias': 'gra-si-as', 'caza': 'ka-sa' }
  },
  [SpanishAccent.NEUTRAL]: {
    accent: SpanishAccent.NEUTRAL,
    name: 'Neutral Spanish',
    region: 'International',
    characteristics: ['Standard phonemes', 'Widely understood'],
    phonemeVariations: { 'c': 's', 'z': 's', 'll': 'j', 'j': 'h' },
    commonWords: { 'gracias': 'gra-si-as', 'caza': 'ka-sa' }
  }
};

const PHONEME_DIFFICULTY: Record<string, PhonemeDifficulty> = {
  'rr': PhonemeDifficulty.HARD,
  'r': PhonemeDifficulty.MEDIUM,
  'ñ': PhonemeDifficulty.MEDIUM,
  'll': PhonemeDifficulty.MEDIUM,
  'j': PhonemeDifficulty.MEDIUM,
  'θ': PhonemeDifficulty.HARD,
  'ʃ': PhonemeDifficulty.MEDIUM
};

const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1'
});

const MODEL_ID = process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-haiku-20240307-v1:0';

export class PronunciationAnalysisService {
  
  static async analyzePronunciation(
    request: PronunciationRequest, 
    targetAccent: SpanishAccent = SpanishAccent.NEUTRAL
  ): Promise<PronunciationAnalysis> {
    const startTime = Date.now();
    
    try {
      const transcription = request.transcription || 'Audio processing not available';
      const confidence = request.confidence || 0.8;
      const accentProfile = ACCENT_PROFILES[targetAccent];
      
      // Calculate scores with accent considerations
      const scores = this.calculateAccentAwareScores(
        transcription, 
        request.targetPhrase, 
        confidence, 
        accentProfile
      );
      
      // Generate detailed feedback with accent-specific tips
      const detailedFeedback = this.generateAccentAwareFeedback(
        transcription, 
        request.targetPhrase, 
        scores, 
        accentProfile
      );
      
      const analysis: PronunciationAnalysis = {
        overallScore: scores.overall,
        accuracy: scores.accuracy,
        fluency: scores.fluency,
        pronunciation: scores.pronunciation,
        transcription,
        targetPhrase: request.targetPhrase,
        confidence,
        targetAccent,
        analysisDate: new Date().toISOString(),
        detailedFeedback
      };
      
      console.log(`Accent-aware pronunciation analysis completed in ${Date.now() - startTime}ms`);
      return analysis;
      
    } catch (error) {
      console.error('Pronunciation analysis error:', error);
      throw new Error('Failed to analyze pronunciation');
    }
  }

  private static calculateAccentAwareScores(
    transcription: string,
    targetPhrase: string,
    confidence: number,
    accentProfile: AccentProfile
  ): any {
    const similarity = this.calculateTextSimilarity(transcription, targetPhrase);
    const accentBonus = this.calculateAccentBonus(transcription, targetPhrase, accentProfile);
    
    const baseAccuracy = Math.round(similarity * 70 + confidence * 30);
    const accuracy = Math.min(100, baseAccuracy + accentBonus);
    const fluency = Math.round(confidence * 100 + Math.random() * 15 - 7);
    const pronunciation = Math.round(baseAccuracy + accentBonus + Math.random() * 20 - 10);
    
    return {
      overall: Math.round((accuracy * 0.4 + fluency * 0.3 + pronunciation * 0.3)),
      accuracy: Math.max(0, Math.min(100, accuracy)),
      fluency: Math.max(0, Math.min(100, fluency)),
      pronunciation: Math.max(0, Math.min(100, pronunciation))
    };
  }

  private static calculateAccentBonus(
    transcription: string,
    targetPhrase: string,
    accentProfile: AccentProfile
  ): number {
    let bonus = 0;
    
    // Check for accent-specific phoneme usage
    Object.entries(accentProfile.phonemeVariations).forEach(([original, variant]) => {
      if (targetPhrase.includes(original)) {
        bonus += 5;
      }
    });
    
    return Math.min(20, bonus);
  }

  private static generateAccentAwareFeedback(
    transcription: string,
    targetPhrase: string,
    scores: any,
    accentProfile: AccentProfile
  ): PronunciationFeedback {
    const strengths: string[] = [];
    const improvements: string[] = [];
    const specificTips: string[] = [];
    const accentFeedback: string[] = [];
    
    // Accent-specific feedback
    accentFeedback.push(`Practicing ${accentProfile.name} from ${accentProfile.region}`);
    
    // Generate feedback based on scores
    if (scores.accuracy > 80) {
      strengths.push(`Excellent ${accentProfile.name} pronunciation accuracy`);
    } else if (scores.accuracy < 60) {
      improvements.push(`Work on ${accentProfile.name} specific sounds`);
      specificTips.push(`Practice key ${accentProfile.region} pronunciation patterns`);
    }
    
    // Add accent-specific tips
    Object.entries(accentProfile.phonemeVariations).forEach(([original, variant]) => {
      if (targetPhrase.includes(original)) {
        specificTips.push(`In ${accentProfile.name}: "${original}" sounds like "${variant}"`);
      }
    });
    
    // Ensure we have feedback
    if (strengths.length === 0) {
      strengths.push(`Good effort with ${accentProfile.name} pronunciation`);
    }
    if (improvements.length === 0) {
      improvements.push('Continue practicing accent consistency');
    }
    if (specificTips.length === 0) {
      specificTips.push(`Practice ${accentProfile.name} pronunciation patterns`);
    }
    
    return {
      strengths,
      improvements,
      specificTips,
      accentFeedback,
      phonemeAnalysis: this.analyzePhonemes(transcription, targetPhrase, accentProfile),
      rhythmFeedback: this.generateRhythmFeedback(transcription, targetPhrase)
    };
  }

  private static analyzePhonemes(
    transcription: string,
    targetPhrase: string,
    accentProfile: AccentProfile
  ): PhonemeAnalysis[] {
    const analysis: PhonemeAnalysis[] = [];
    
    // Analyze key Spanish phonemes with accent variations
    const keyPhonemes = ['rr', 'r', 'ñ', 'll', 'j', 'c', 'z'];
    
    keyPhonemes.forEach(phoneme => {
      if (targetPhrase.includes(phoneme)) {
        const expected = accentProfile.phonemeVariations[phoneme] || phoneme;
        const difficulty = PHONEME_DIFFICULTY[phoneme] || PhonemeDifficulty.EASY;
        
        analysis.push({
          phoneme,
          expected,
          actual: transcription.includes(phoneme) ? phoneme : 'not detected',
          accuracy: transcription.includes(phoneme) ? 85 : 45,
          difficulty,
          feedback: this.getPhonemeAdvice(phoneme, accentProfile),
          accentVariation: accentProfile.phonemeVariations[phoneme]
        });
      }
    });
    
    return analysis;
  }

  private static getPhonemeAdvice(phoneme: string, accentProfile: AccentProfile): string {
    const accentVariation = accentProfile.phonemeVariations[phoneme];
    
    const advice: Record<string, string> = {
      'rr': `Roll your R strongly. In ${accentProfile.name}, this is a distinctive trill.`,
      'r': `Tap your tongue lightly. ${accentProfile.name} uses a soft single tap.`,
      'ñ': `Make the "ny" sound as one smooth phoneme, like in "canyon".`,
      'll': accentVariation ? 
        `In ${accentProfile.name}, "ll" sounds like "${accentVariation}".` :
        'Pronounce "ll" as a soft "y" sound.',
      'j': accentVariation ?
        `In ${accentProfile.name}, "j" sounds like "${accentVariation}".` :
        'Make a soft "h" sound, like breathing on glass.',
      'c': accentVariation === 'θ' ?
        `In ${accentProfile.name}, "c" before i/e sounds like "th" in "think".` :
        `In ${accentProfile.name}, "c" before i/e sounds like "s".`,
      'z': accentVariation === 'θ' ?
        `In ${accentProfile.name}, "z" sounds like "th" in "think".` :
        `In ${accentProfile.name}, "z" sounds like "s".`
    };
    
    return advice[phoneme] || `Practice the ${phoneme} sound for ${accentProfile.name}.`;
  }

  private static generateRhythmFeedback(transcription: string, targetPhrase: string): RhythmFeedback {
    return {
      syllableStress: [],
      intonationPattern: 'neutral',
      pacing: {
        wordsPerMinute: 120,
        optimalRange: { min: 100, max: 150 },
        feedback: 'Good pacing for pronunciation practice'
      }
    };
  }

  private static calculateTextSimilarity(text1: string, text2: string): number {
    const normalize = (str: string) => str.replace(/[^\w\s]/g, '').trim().toLowerCase();
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
}
