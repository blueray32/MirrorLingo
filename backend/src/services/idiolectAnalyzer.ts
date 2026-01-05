import { BedrockService } from './bedrockService';
import { TranscriptionService, SpeechMetrics } from './transcriptionService';
import { 
  Phrase, 
  IdiolectProfile, 
  IdiolectAnalysis, 
  AnalysisResult,
  IntentCategory,
  ToneLevel,
  FormalityLevel,
  LanguagePattern,
  PatternType
} from '../models/phrase';
import { DynamoDBService, generatePhraseId, getCurrentTimestamp } from '../utils/dynamodb';

export class IdiolectAnalyzer {
  
  // Main entry point: analyze phrases from text or audio
  static async analyzeUserPhrases(
    userId: string, 
    phrases: string[]
  ): Promise<{ phrases: Phrase[], profile: IdiolectProfile }> {
    const startTime = Date.now();
    
    try {
      // Step 1: Perform bulk idiolect analysis
      const analysis = await BedrockService.analyzeIdiolect(phrases);
      
      // Step 2: Classify individual phrase intents
      const phraseObjects = await this.createPhraseObjects(userId, phrases, analysis);
      
      // Step 3: Generate or update user profile
      const profile = await this.generateUserProfile(userId, phraseObjects, analysis);
      
      // Step 4: Save everything to database
      await this.savePhrases(phraseObjects);
      await this.saveProfile(profile);
      
      console.log(`Analysis completed in ${Date.now() - startTime}ms for user ${userId}`);
      
      return { phrases: phraseObjects, profile };
      
    } catch (error) {
      console.error('Error in idiolect analysis:', error);
      throw new Error('Failed to analyze speaking patterns');
    }
  }

  // Enhanced entry point: analyze from audio transcription
  static async analyzeFromAudio(
    userId: string,
    transcriptionJobId: string
  ): Promise<{ phrases: Phrase[], profile: IdiolectProfile }> {
    
    try {
      // Get transcription result with speech metrics
      const transcriptionResult = await TranscriptionService.waitForTranscription(transcriptionJobId);
      
      if (transcriptionResult.status !== 'completed' || !transcriptionResult.transcript) {
        throw new Error('Transcription failed or incomplete');
      }

      // Split transcript into phrases (simple sentence splitting)
      const phrases = this.extractPhrasesFromTranscript(transcriptionResult.transcript);
      
      // Perform standard text analysis
      const analysis = await BedrockService.analyzeIdiolect(phrases);
      
      // Enhance analysis with speech-specific patterns
      if (transcriptionResult.speechMetrics) {
        analysis.patterns = this.enhanceWithSpeechPatterns(
          analysis.patterns, 
          transcriptionResult.speechMetrics
        );
      }
      
      // Create phrase objects with enhanced analysis
      const phraseObjects = await this.createPhraseObjects(userId, phrases, analysis);
      
      // Add speech metrics to phrases
      if (transcriptionResult.speechMetrics) {
        phraseObjects.forEach(phrase => {
          phrase.speechMetrics = transcriptionResult.speechMetrics;
        });
      }
      
      // Generate profile
      const profile = await this.generateUserProfile(userId, phraseObjects, analysis);
      
      // Save to database
      await this.savePhrases(phraseObjects);
      await this.saveProfile(profile);
      
      return { phrases: phraseObjects, profile };
      
    } catch (error) {
      console.error('Error in audio analysis:', error);
      throw new Error('Failed to analyze speech patterns');
    }
  }

  // Create phrase objects with individual intent classification
  private static async createPhraseObjects(
    userId: string, 
    phrases: string[], 
    globalAnalysis: IdiolectAnalysis
  ): Promise<Phrase[]> {
    const phraseObjects: Phrase[] = [];
    
    // Process phrases in parallel for better performance
    const intentPromises = phrases.map(phrase => 
      BedrockService.classifyIntent(phrase)
    );
    
    const intents = await Promise.all(intentPromises);
    
    phrases.forEach((phraseText, index) => {
      const phraseObj: Phrase = {
        userId,
        phraseId: generatePhraseId(),
        englishText: phraseText.trim(),
        intent: intents[index],
        createdAt: getCurrentTimestamp(),
        updatedAt: getCurrentTimestamp(),
        analysis: globalAnalysis
      };
      
      phraseObjects.push(phraseObj);
    });
    
    return phraseObjects;
  }

  // Generate comprehensive user profile from analysis
  private static async generateUserProfile(
    userId: string,
    phrases: Phrase[],
    analysis: IdiolectAnalysis
  ): Promise<IdiolectProfile> {
    
    // Get existing profile if it exists
    const existingProfile = await this.getExistingProfile(userId);
    
    // Calculate intent preferences
    const intentCounts = phrases.reduce((acc, phrase) => {
      acc[phrase.intent] = (acc[phrase.intent] || 0) + 1;
      return acc;
    }, {} as Record<IntentCategory, number>);
    
    const preferredIntents = Object.entries(intentCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([intent]) => intent as IntentCategory);
    
    // Merge patterns with existing profile
    const mergedPatterns = this.mergePatterns(
      analysis.patterns,
      existingProfile?.commonPatterns || []
    );
    
    const profile: IdiolectProfile = {
      userId,
      overallTone: analysis.tone,
      overallFormality: analysis.formality,
      commonPatterns: mergedPatterns,
      preferredIntents,
      analysisCount: (existingProfile?.analysisCount || 0) + 1,
      lastUpdated: getCurrentTimestamp()
    };
    
    return profile;
  }

  // Merge new patterns with existing ones, updating frequencies
  private static mergePatterns(
    newPatterns: LanguagePattern[],
    existingPatterns: LanguagePattern[]
  ): LanguagePattern[] {
    const patternMap = new Map<PatternType, LanguagePattern>();
    
    // Add existing patterns
    existingPatterns.forEach(pattern => {
      patternMap.set(pattern.type, pattern);
    });
    
    // Merge or add new patterns
    newPatterns.forEach(newPattern => {
      const existing = patternMap.get(newPattern.type);
      
      if (existing) {
        // Average the frequencies and merge examples
        const mergedPattern: LanguagePattern = {
          type: newPattern.type,
          description: newPattern.description, // Use latest description
          examples: [...new Set([...existing.examples, ...newPattern.examples])].slice(0, 5),
          frequency: (existing.frequency + newPattern.frequency) / 2
        };
        patternMap.set(newPattern.type, mergedPattern);
      } else {
        patternMap.set(newPattern.type, newPattern);
      }
    });
    
    // Return top 5 patterns by frequency
    return Array.from(patternMap.values())
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5);
  }

  // Get existing user profile
  private static async getExistingProfile(userId: string): Promise<IdiolectProfile | null> {
    try {
      const profileData = await DynamoDBService.getItem(userId, 'profile');
      return profileData as IdiolectProfile | null;
    } catch (error) {
      console.log('No existing profile found for user:', userId);
      return null;
    }
  }

  // Save phrases to database
  private static async savePhrases(phrases: Phrase[]): Promise<void> {
    await DynamoDBService.batchPutItems(phrases);
  }

  // Save user profile to database
  private static async saveProfile(profile: IdiolectProfile): Promise<void> {
    const profileItem = {
      ...profile,
      phraseId: 'profile' // Special phraseId for profile records
    };
    
    await DynamoDBService.putItem(profileItem);
  }

  // Retrieve user's phrases and profile
  static async getUserData(userId: string): Promise<{ phrases: Phrase[], profile?: IdiolectProfile }> {
    try {
      const allItems = await DynamoDBService.queryUserItems(userId);
      
      const phrases = allItems
        .filter(item => item.phraseId !== 'profile')
        .map(item => item as Phrase);
      
      const profileItem = allItems.find(item => item.phraseId === 'profile');
      const profile = profileItem as IdiolectProfile | undefined;
      
      return { phrases, profile };
      
    } catch (error) {
      console.error('Error retrieving user data:', error);
      throw new Error('Failed to retrieve user data');
    }
  }

  // Generate analysis summary for display
  static generateAnalysisSummary(profile: IdiolectProfile): string {
    const toneDesc = this.getToneDescription(profile.overallTone);
    const formalityDesc = this.getFormalityDescription(profile.overallFormality);
    const topPatterns = profile.commonPatterns.slice(0, 3);
    const topIntents = profile.preferredIntents.slice(0, 2);
    
    let summary = `Your speaking style: ${toneDesc} and ${formalityDesc}.`;
    
    if (topPatterns.length > 0) {
      const patternDescs = topPatterns.map(p => p.description).join(', ');
      summary += ` Common patterns: ${patternDescs}.`;
    }
    
    if (topIntents.length > 0) {
      const intentDescs = topIntents.map(i => i.replace('_', ' ')).join(' and ');
      summary += ` You often talk about ${intentDescs} topics.`;
    }
    
    return summary;
  }

  // Extract phrases from transcript using simple sentence splitting
  private static extractPhrasesFromTranscript(transcript: string): string[] {
    // Split on sentence boundaries and clean up
    const sentences = transcript
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 10) // Filter out very short fragments
      .slice(0, 10); // Limit to 10 phrases max

    return sentences.length > 0 ? sentences : [transcript]; // Fallback to full transcript
  }

  // Enhance language patterns with speech-specific insights
  private static enhanceWithSpeechPatterns(
    existingPatterns: LanguagePattern[],
    speechMetrics: SpeechMetrics
  ): LanguagePattern[] {
    const speechPatterns: LanguagePattern[] = [];

    // Speaking pace pattern
    if (speechMetrics.wordsPerMinute > 0) {
      let paceDescription = 'Normal speaking pace';
      if (speechMetrics.wordsPerMinute > 180) {
        paceDescription = 'Fast speaker - speaks quickly and energetically';
      } else if (speechMetrics.wordsPerMinute < 120) {
        paceDescription = 'Deliberate speaker - takes time to choose words carefully';
      }

      speechPatterns.push({
        type: PatternType.SENTENCE_LENGTH,
        description: paceDescription,
        examples: [`${Math.round(speechMetrics.wordsPerMinute)} words per minute`],
        frequency: Math.min(speechMetrics.wordsPerMinute / 200, 1.0)
      });
    }

    // Filler word pattern
    if (speechMetrics.fillerWordRate > 0.05) { // More than 5% filler words
      speechPatterns.push({
        type: PatternType.FILLER_WORDS,
        description: 'Uses filler words while thinking',
        examples: ['um', 'uh', 'like', 'you know'],
        frequency: Math.min(speechMetrics.fillerWordRate * 2, 1.0)
      });
    }

    // Pause pattern
    if (speechMetrics.averagePauseLength > 0.5) {
      speechPatterns.push({
        type: PatternType.SENTENCE_LENGTH,
        description: 'Takes thoughtful pauses between ideas',
        examples: [`Average pause: ${speechMetrics.averagePauseLength.toFixed(1)}s`],
        frequency: Math.min(speechMetrics.averagePauseLength / 2, 1.0)
      });
    }

    // Merge with existing patterns, prioritizing speech-specific insights
    const mergedPatterns = [...speechPatterns, ...existingPatterns];
    
    // Return top 5 patterns by frequency
    return mergedPatterns
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5);
  }

  // Helper methods for descriptions
  private static getToneDescription(tone: ToneLevel): string {
    const descriptions = {
      [ToneLevel.VERY_CASUAL]: 'very relaxed and informal',
      [ToneLevel.CASUAL]: 'casual and friendly',
      [ToneLevel.NEUTRAL]: 'balanced and neutral',
      [ToneLevel.POLITE]: 'polite and considerate',
      [ToneLevel.FORMAL]: 'formal and professional',
      [ToneLevel.VERY_FORMAL]: 'very formal and ceremonial'
    };
    return descriptions[tone] || 'neutral';
  }

  private static getFormalityDescription(formality: FormalityLevel): string {
    const descriptions = {
      [FormalityLevel.INFORMAL]: 'uses informal language',
      [FormalityLevel.SEMI_FORMAL]: 'uses moderately formal language',
      [FormalityLevel.FORMAL]: 'uses formal language'
    };
    return descriptions[formality] || 'uses standard language';
  }
}
