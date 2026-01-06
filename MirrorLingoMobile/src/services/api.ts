import AsyncStorage from '@react-native-async-storage/async-storage';
import { offlineService, OfflinePhraseData } from './offline';

// Types from the existing web app
export interface IdiolectProfile {
  tone: 'formal' | 'casual' | 'mixed';
  formality: number;
  patterns: string[];
  fillerWords: string[];
  contractions: boolean;
  intents: Array<{
    category: string;
    phrases: string[];
    confidence: number;
  }>;
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
  private baseUrl = process.env.REACT_APP_API_URL || 'https://your-api-gateway-url.amazonaws.com';
  private userId: string = '';

  constructor() {
    this.initUserId();
  }

  private async initUserId(): Promise<void> {
    const stored = await AsyncStorage.getItem('user_id');
    if (stored) {
      this.userId = stored;
    } else {
      this.userId = `mobile-${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`;
      await AsyncStorage.setItem('user_id', this.userId);
    }
  }

  async analyzePhrase(phrase: string): Promise<PhraseAnalysis> {
    try {
      const response = await fetch(`${this.baseUrl}/phrases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': this.userId,
        },
        body: JSON.stringify({ phrases: [phrase] }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const analysis = data.analyses[0];
      
      // Cache the analysis offline
      await this.cacheAnalysis(phrase, analysis);
      
      return analysis;
    } catch (error) {
      console.error('API Error:', error);
      // Try to get cached analysis or return mock
      const cached = await this.getCachedAnalysis(phrase);
      return cached || this.getMockAnalysis(phrase);
    }
  }

  async analyzePhrases(phrases: string[]): Promise<PhraseAnalysis[]> {
    try {
      const response = await fetch(`${this.baseUrl}/phrases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': this.userId,
        },
        body: JSON.stringify({ phrases }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      return data.analyses;
    } catch (error) {
      console.error('API Error:', error);
      // Return mock data for demo
      return phrases.map(phrase => this.getMockAnalysis(phrase));
    }
  }

  async getUserPhrases(): Promise<PhraseAnalysis[]> {
    try {
      const response = await fetch(`${this.baseUrl}/phrases`, {
        headers: {
          'x-user-id': this.userId,
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      return data.phrases;
    } catch (error) {
      console.error('API Error:', error);
      // Return cached data or empty array
      return this.getCachedPhrases();
    }
  }

  // Sync methods
  async syncOfflineData(): Promise<void> {
    try {
      const { phrases, progress } = await offlineService.getUnsyncedData();
      
      // Sync phrases
      for (const phrase of phrases) {
        await this.syncPhrase(phrase);
      }
      
      // Sync progress
      for (const progressItem of progress) {
        await this.syncProgress(progressItem);
      }
      
      console.log('Offline data synced successfully');
    } catch (error) {
      console.error('Failed to sync offline data:', error);
    }
  }

  private async syncPhrase(phraseData: OfflinePhraseData): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/phrases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': this.userId,
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

  private async syncProgress(progressItem: any): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': this.userId,
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
        tone: 'casual',
        formality: 0.3,
        patterns: ['contractions', 'filler_words'],
        fillerWords: ['um', 'like'],
        contractions: true,
        intents: [
          {
            category: 'daily_conversation',
            phrases: [phrase],
            confidence: 0.85,
          },
        ],
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
