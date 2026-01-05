import { BedrockService } from './bedrockService';
import { IdiolectProfile, Phrase } from '../models/phrase';

export interface SpanishTranslation {
  literal: string;
  natural: string;
  explanation: string;
  confidence: number;
  culturalNotes?: string;
  formalityLevel: 'informal' | 'formal';
}

export interface TranslationResult {
  englishPhrase: string;
  translation: SpanishTranslation;
  styleMatching: {
    tonePreserved: boolean;
    formalityAdjusted: boolean;
    personalityMaintained: boolean;
  };
  learningTips: string[];
}

export class SpanishTranslationService {
  
  // Main translation method that preserves user's idiolect
  static async translatePhrase(
    phrase: string,
    userProfile: IdiolectProfile
  ): Promise<TranslationResult> {
    
    const translationPrompt = this.buildTranslationPrompt(phrase, userProfile);
    
    try {
      const response = await BedrockService.invokeModelPublic(translationPrompt);
      const translation = this.parseTranslationResponse(response);
      
      return {
        englishPhrase: phrase,
        translation,
        styleMatching: this.analyzeStyleMatching(phrase, translation, userProfile),
        learningTips: this.generateLearningTips(phrase, translation, userProfile)
      };
      
    } catch (error) {
      console.error('Translation error:', error);
      throw new Error('Failed to translate phrase');
    }
  }

  // Batch translate multiple phrases efficiently
  static async translatePhrases(
    phrases: Phrase[],
    userProfile: IdiolectProfile
  ): Promise<TranslationResult[]> {
    
    const translations = await Promise.all(
      phrases.map(phrase => 
        this.translatePhrase(phrase.englishText, userProfile)
      )
    );
    
    return translations;
  }

  // Build personalized translation prompt
  private static buildTranslationPrompt(phrase: string, profile: IdiolectProfile): string {
    const toneDesc = this.getToneDescription(profile.overallTone);
    const formalityDesc = this.getFormalityDescription(profile.overallFormality);
    const patterns = profile.commonPatterns.slice(0, 3);
    
    return `You are a Spanish translation expert specializing in preserving personal speaking styles.

USER'S SPEAKING STYLE:
- Overall tone: ${toneDesc}
- Formality level: ${formalityDesc}
- Common patterns: ${patterns.map(p => p.description).join(', ')}

PHRASE TO TRANSLATE: "${phrase}"

Provide a JSON response with:
{
  "literal": "Direct word-for-word Spanish translation",
  "natural": "Natural Spanish that matches the user's speaking style and tone",
  "explanation": "Brief explanation of translation choices and style matching",
  "confidence": 0.85,
  "culturalNotes": "Any cultural context or regional variations",
  "formalityLevel": "informal" or "formal"
}

IMPORTANT:
- Match the user's tone (${toneDesc}) in the natural translation
- Preserve their formality level (${formalityDesc})
- Use contractions if they use contractions, formal language if they're formal
- Keep the personality and energy of their original phrase
- Provide both literal (for learning) and natural (for usage) versions`;
  }

  // Parse Claude's response into structured translation
  private static parseTranslationResponse(response: string): SpanishTranslation {
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        literal: parsed.literal || '',
        natural: parsed.natural || '',
        explanation: parsed.explanation || '',
        confidence: parsed.confidence || 0.7,
        culturalNotes: parsed.culturalNotes,
        formalityLevel: parsed.formalityLevel || 'informal'
      };
      
    } catch (error) {
      console.error('Failed to parse translation response:', error);
      
      // Fallback parsing
      return {
        literal: 'Translation error',
        natural: 'Translation error',
        explanation: 'Failed to generate translation',
        confidence: 0.0,
        formalityLevel: 'informal'
      };
    }
  }

  // Analyze how well the translation preserves user's style
  private static analyzeStyleMatching(
    original: string,
    translation: SpanishTranslation,
    profile: IdiolectProfile
  ): { tonePreserved: boolean; formalityAdjusted: boolean; personalityMaintained: boolean } {
    
    // Simple heuristics for style matching analysis
    const hasContractions = /\b(I'm|you're|can't|won't|don't|isn't)\b/i.test(original);
    const isQuestion = original.includes('?');
    const isExclamation = original.includes('!');
    const isCasual = profile.overallTone.includes('casual');
    
    return {
      tonePreserved: translation.confidence > 0.7,
      formalityAdjusted: translation.formalityLevel === (isCasual ? 'informal' : 'formal'),
      personalityMaintained: translation.natural.length > 0
    };
  }

  // Generate personalized learning tips
  private static generateLearningTips(
    original: string,
    translation: SpanishTranslation,
    profile: IdiolectProfile
  ): string[] {
    const tips: string[] = [];
    
    // Tip based on formality
    if (profile.overallFormality === 'informal') {
      tips.push('Notice how Spanish informal speech uses "tú" instead of "usted"');
    }
    
    // Tip based on contractions
    const hasContractions = profile.commonPatterns.some(p => p.type === 'contractions');
    if (hasContractions) {
      tips.push('Spanish doesn\'t use contractions like English - each word is pronounced fully');
    }
    
    // Tip based on question style
    if (original.includes('?')) {
      tips.push('Spanish questions often start with inverted question marks (¿)');
    }
    
    // General tip based on tone
    if (profile.overallTone.includes('casual')) {
      tips.push('Your casual style translates well to informal Spanish conversations');
    }
    
    return tips.slice(0, 2); // Limit to 2 tips
  }

  // Helper methods
  private static getToneDescription(tone: string): string {
    const descriptions: Record<string, string> = {
      'very_casual': 'very relaxed and informal',
      'casual': 'casual and friendly',
      'neutral': 'balanced and neutral',
      'polite': 'polite and considerate',
      'formal': 'formal and professional',
      'very_formal': 'very formal and ceremonial'
    };
    return descriptions[tone] || 'neutral';
  }

  private static getFormalityDescription(formality: string): string {
    const descriptions: Record<string, string> = {
      'informal': 'uses informal language',
      'semi_formal': 'uses moderately formal language',
      'formal': 'uses formal language'
    };
    return descriptions[formality] || 'uses standard language';
  }
}
