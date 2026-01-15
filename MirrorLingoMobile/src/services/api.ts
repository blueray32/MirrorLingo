import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { offlineService, OfflinePhraseData } from './offline';

// Types matching backend models
export interface Phrase {
  userId: string;
  phraseId: string;
  englishText: string;
  intent: IntentCategory;
  createdAt: string;
  updatedAt: string;
  analysis?: IdiolectAnalysis;
  speechMetrics?: SpeechMetrics;
}

export interface IdiolectProfile {
  userId: string;
  overallTone: ToneLevel;
  overallFormality: FormalityLevel;
  commonPatterns: LanguagePattern[];
  preferredIntents: IntentCategory[];
  analysisCount: number;
  lastUpdated: string;
}

export interface IdiolectAnalysis {
  tone: ToneLevel;
  formality: FormalityLevel;
  patterns: LanguagePattern[];
  confidence: number;
  analysisDate: string;
}

export interface LanguagePattern {
  type: PatternType;
  description: string;
  examples: string[];
  frequency: number;
}

export interface SpeechMetrics {
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

export enum IntentCategory {
  WORK = 'work',
  FAMILY = 'family',
  ERRANDS = 'errands',
  SOCIAL = 'social',
  CASUAL = 'casual',
  FORMAL = 'formal',
  OTHER = 'other'
}

export enum ToneLevel {
  VERY_CASUAL = 'very_casual',
  CASUAL = 'casual',
  NEUTRAL = 'neutral',
  POLITE = 'polite',
  FORMAL = 'formal',
  VERY_FORMAL = 'very_formal'
}

export enum FormalityLevel {
  INFORMAL = 'informal',
  SEMI_FORMAL = 'semi_formal',
  FORMAL = 'formal'
}

export enum PatternType {
  FILLER_WORDS = 'filler_words',
  CONTRACTIONS = 'contractions',
  POLITENESS_MARKERS = 'politeness_markers',
  QUESTION_STYLE = 'question_style',
  SENTENCE_LENGTH = 'sentence_length',
  VOCABULARY_LEVEL = 'vocabulary_level',
  SLANG_USAGE = 'slang_usage'
}

export interface TranslationVariant {
  literal: string;
  natural: string;
  explanation: string;
  culturalNotes?: string;
  styleMatch: number;
}

export interface PhraseAnalysis {
  phrase: string;
  idiolectProfile: IdiolectProfile;
  translations: TranslationVariant;
  learningTips: string[];
}

class MirrorLingoAPI {
  // Android emulator uses 10.0.2.2 to access host machine's localhost
  // iOS simulator can use 127.0.0.1 directly
  private static getApiHost(): string {
    if (process.env.REACT_APP_API_URL) {
      return process.env.REACT_APP_API_URL;
    }
    const host = Platform.OS === 'android' ? '10.0.2.2' : '127.0.0.1';
    return `http://${host}:3002/api`;
  }

  public baseUrl = MirrorLingoAPI.getApiHost();
  private userId: string = '';

  constructor() {
    console.log(`[MirrorLingoAPI] Using base URL: ${this.baseUrl}`);
  }

  private userIdReady: Promise<string> | null = null;

  public async getUserId(): Promise<string> {
    if (this.userId) return this.userId;
    if (this.userIdReady) return this.userIdReady;

    this.userIdReady = (async () => {
      try {
        const stored = await AsyncStorage.getItem('user_id');
        if (stored) {
          this.userId = stored;
        } else {
          this.userId = `mobile-${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`;
          await AsyncStorage.setItem('user_id', this.userId);
        }
        return this.userId;
      } catch (e) {
        console.error('Failed to init user ID:', e);
        return 'demo-user-mobile';
      }
    })();

    return this.userIdReady;
  }

  async analyzePhrase(inputPhrase: string): Promise<PhraseAnalysis> {
    try {
      const userId = await this.getUserId();
      const response: Response = await fetch(`${this.baseUrl}/phrases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify({ phrases: [inputPhrase] }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data: { success: boolean; data: { phrases: Phrase[]; profile: IdiolectProfile } } = await response.json();

      if (!data.success || !data.data) {
        throw new Error('Invalid API response');
      }

      // Convert backend response to mobile format
      const { phrases: returnedPhrases, profile } = data.data;
      const phraseResult = returnedPhrases[0];

      // Fetch real translation for this single phrase
      const transResponse = await fetch(`${this.baseUrl}/translations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify({ phrases: [phraseResult.englishText], profile }),
      });

      let translation = {
        literal: `Literal translation for: ${phraseResult.englishText}`,
        natural: `Natural translation for: ${phraseResult.englishText}`,
        explanation: 'Translation explanation',
        styleMatch: 0.85
      };

      if (transResponse.ok) {
        const transData = await transResponse.json();
        if (transData.success && transData.data.translations?.[0]) {
          translation = transData.data.translations[0].translation;
        }
      }

      const analysis: PhraseAnalysis = {
        phrase: phraseResult.englishText,
        idiolectProfile: profile,
        translations: translation,
        learningTips: ['Practice tip 1', 'Practice tip 2']
      };
      return analysis;
    } catch (error) {
      console.error('API Error:', error);
      // Try to get cached analysis or return mock
      const cached = await this.getCachedAnalysis(inputPhrase);
      return cached || this.getMockAnalysis(inputPhrase);
    }
  }

  async analyzePhrases(inputPhrases: string[]): Promise<PhraseAnalysis[]> {
    try {
      const userId = await this.getUserId();
      const response: Response = await fetch(`${this.baseUrl}/phrases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify({ phrases: inputPhrases }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data: { success: boolean; data: { phrases: Phrase[]; profile: IdiolectProfile } } = await response.json();

      if (!data.success || !data.data) {
        throw new Error('Invalid API response');
      }

      // Convert backend response to mobile format
      const { phrases: returnedPhrases, profile } = data.data;

      // Fetch real translations for all phrases
      const transResponse = await fetch(`${this.baseUrl}/translations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify({ phrases: returnedPhrases.map(p => p.englishText), profile }),
      });

      let translationsMap = new Map();
      if (transResponse.ok) {
        const transData = await transResponse.json();
        if (transData.success) {
          transData.data.translations.forEach((t: any) => {
            translationsMap.set(t.englishPhrase.toLowerCase().trim(), t.translation);
          });
        }
      }

      return returnedPhrases.map((phraseItem: Phrase): PhraseAnalysis => {
        const trans = translationsMap.get(phraseItem.englishText.toLowerCase().trim());
        return {
          phrase: phraseItem.englishText,
          idiolectProfile: profile,
          translations: trans || {
            literal: `Literal translation for: ${phraseItem.englishText}`,
            natural: `Natural translation for: ${phraseItem.englishText}`,
            explanation: 'Translation explanation',
            styleMatch: 0.85
          },
          learningTips: ['Practice tip 1', 'Practice tip 2']
        };
      });
    } catch (error) {
      console.error('API Error:', error);
      // Return mock data for demo
      return inputPhrases.map(p => this.getMockAnalysis(p));
    }
  }

  async getUserPhrases(): Promise<PhraseAnalysis[]> {
    try {
      const userId = await this.getUserId();
      const response = await fetch(`${this.baseUrl}/phrases`, {
        headers: {
          'x-user-id': userId,
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      return data.data?.phrases || [];
    } catch (error) {
      console.error('API Error:', error);
      // Return cached data or empty array
      return this.getCachedPhrases();
    }
  }

  // Sync methods
  async syncOfflineData(): Promise<void> {
    try {
      const userId = await this.getUserId();
      const { phrases, progress } = await offlineService.getUnsyncedData();

      // Sync phrases
      for (const phrase of phrases) {
        await this.syncPhrase(phrase, userId);
      }

      // Sync progress
      for (const progressItem of progress) {
        await this.syncProgress(progressItem, userId);
      }

      console.log('Offline data synced successfully');
    } catch (error) {
      console.error('Failed to sync offline data:', error);
    }
  }

  private async syncPhrase(phraseData: OfflinePhraseData, userId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/phrases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify({
          phrases: [phraseData.phrase],
          transcript: phraseData.transcript,
          audioPath: phraseData.audioPath,
        }),
      });

      if (response.ok) {
        await offlineService.markPhraseSynced(phraseData.id);
      }
    } catch (error) {
      console.error('Failed to sync phrase:', error);
    }
  }

  async segmentTranscript(transcript: string): Promise<string[]> {
    try {
      const userId = await this.getUserId();
      const response = await fetch(`${this.baseUrl}/transcript/segment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify({ transcript }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.data.segments)) {
          return data.data.segments;
        }
      }
    } catch (error) {
      console.error('Segmentation error:', error);
    }

    // Fallback: simple client-side split
    return transcript.split(/[.!?]+|\s{2,}/).map(s => s.trim()).filter(s => s.length > 5);
  }

  private async syncProgress(progressItem: any, userId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify(progressItem),
      });

      if (response.ok) {
        await offlineService.markProgressSynced(progressItem.timestamp);
      }
    } catch (error) {
      console.error('Failed to sync progress:', error);
    }
  }

  // Cache methods
  private async cacheAnalysis(phrase: string, analysis: PhraseAnalysis): Promise<void> {
    try {
      const cached = await AsyncStorage.getItem('phrase_analyses');
      const analyses = cached ? JSON.parse(cached) : {};
      analyses[phrase] = analysis;
      await AsyncStorage.setItem('phrase_analyses', JSON.stringify(analyses));
    } catch (error) {
      console.error('Failed to cache analysis:', error);
    }
  }

  private async getCachedAnalysis(phrase: string): Promise<PhraseAnalysis | null> {
    try {
      const cached = await AsyncStorage.getItem('phrase_analyses');
      const analyses = cached ? JSON.parse(cached) : {};
      return analyses[phrase] || null;
    } catch (error) {
      console.error('Failed to get cached analysis:', error);
      return null;
    }
  }
  async cachePhrases(phrases: PhraseAnalysis[]): Promise<void> {
    try {
      await AsyncStorage.setItem('cached_phrases', JSON.stringify(phrases));
    } catch (error) {
      console.error('Cache Error:', error);
    }
  }

  async getCachedPhrases(): Promise<PhraseAnalysis[]> {
    try {
      const cached = await AsyncStorage.getItem('cached_phrases');
      return cached ? JSON.parse(cached) : [];
    } catch (error) {
      console.error('Cache Error:', error);
      return [];
    }
  }

  // Mock data for demo purposes
  private getMockAnalysis(phrase: string): PhraseAnalysis {
    return {
      phrase,
      idiolectProfile: {
        userId: this.userId,
        overallTone: ToneLevel.CASUAL,
        overallFormality: FormalityLevel.INFORMAL,
        commonPatterns: [
          {
            type: PatternType.CONTRACTIONS,
            description: 'Uses contractions frequently',
            examples: ["don't", "can't", "won't"],
            frequency: 0.8
          },
          {
            type: PatternType.FILLER_WORDS,
            description: 'Occasional filler words',
            examples: ['um', 'like'],
            frequency: 0.3
          }
        ],
        preferredIntents: [IntentCategory.CASUAL, IntentCategory.SOCIAL],
        analysisCount: 1,
        lastUpdated: new Date().toISOString()
      },
      translations: {
        literal: this.getMockLiteralTranslation(phrase),
        natural: this.getMockNaturalTranslation(phrase),
        explanation: 'This translation preserves your casual, friendly tone.',
        culturalNotes: 'In Spanish-speaking cultures, this level of informality is common among friends.',
        styleMatch: 0.9,
      },
      learningTips: [
        'Practice the natural version for everyday conversations',
        'Notice how your casual tone is preserved in Spanish',
      ],
    };
  }

  private getMockLiteralTranslation(phrase: string): string {
    const translations: Record<string, string> = {
      'Could you take a look at this?': '¿Podrías echar un vistazo a esto?',
      'No worries, take your time': 'No te preocupes, tómate tu tiempo',
      'I\'ll be there in about 10 minutes': 'Estaré allí en unos 10 minutos',
    };
    return translations[phrase] || 'Traducción literal aquí';
  }

  private getMockNaturalTranslation(phrase: string): string {
    const translations: Record<string, string> = {
      'Could you take a look at this?': '¿Le echas un ojo a esto?',
      'No worries, take your time': 'Tranquilo, sin prisa',
      'I\'ll be there in about 10 minutes': 'Llego en 10 minutitos',
    };
    return translations[phrase] || 'Traducción natural aquí';
  }
}

export const mirrorLingoAPI = new MirrorLingoAPI();
