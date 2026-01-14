// Simplified types for smart learning service
interface MistakeCategory {
  type: string;
  focusLevel: 'high' | 'medium' | 'low';
  currentAccuracy: number;
  improvementRate: number;
  recentMistakes: number;
}

interface PhonemeProgress {
  phoneme: string;
  currentAccuracy: number;
  improvementRate: number;
  practiceCount: number;
}

interface ConversationMemory {
  userId: string;
  relationshipLevel: string;
  totalConversations: number;
}

export interface SmartRecommendation {
  id: string;
  type: 'conversation_topic' | 'pronunciation_exercise' | 'integrated_practice';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action: string;
  reasoning: string;
  targetSkills: string[];
  estimatedTime: number;
  conversationTopic?: string;
  targetPhonemes?: string[];
  grammarFocus?: string[];
}

export class SmartLearningService {
  generateSmartRecommendations(
    mistakeCategories: MistakeCategory[],
    phonemeProgress: PhonemeProgress[],
    conversationMemory: ConversationMemory | null
  ): SmartRecommendation[] {
    const recommendations: SmartRecommendation[] = [];

    // Grammar-driven conversation topics
    const grammarTopics = this.suggestConversationTopicsForGrammar(mistakeCategories);
    recommendations.push(...grammarTopics);

    // Conversation-driven pronunciation exercises
    const pronunciationExercises = this.suggestPronunciationFromConversation(phonemeProgress, conversationMemory);
    recommendations.push(...pronunciationExercises);

    // Integrated practice sessions
    const integratedPractice = this.suggestIntegratedPractice(mistakeCategories, phonemeProgress);
    recommendations.push(...integratedPractice);

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  private suggestConversationTopicsForGrammar(mistakeCategories: MistakeCategory[]): SmartRecommendation[] {
    const topicMap = {
      'verb_conjugation': {
        topic: 'Daily Routine',
        description: 'Practice verb tenses through daily activities',
        action: 'Have a conversation about your daily routine',
        reasoning: 'Daily routine conversations naturally use multiple verb tenses'
      },
      'gender_agreement': {
        topic: 'Shopping',
        description: 'Practice noun-adjective agreement while shopping',
        action: 'Role-play a shopping conversation',
        reasoning: 'Shopping requires describing items with correct gender agreement'
      },
      'subjunctive_mood': {
        topic: 'Future Plans',
        description: 'Practice subjunctive through hopes and plans',
        action: 'Discuss your future goals and wishes',
        reasoning: 'Future plans naturally use subjunctive mood expressions'
      },
      'prepositions': {
        topic: 'Directions',
        description: 'Practice prepositions through location descriptions',
        action: 'Give and ask for directions in Spanish',
        reasoning: 'Direction conversations heavily use prepositions'
      },
      'ser_vs_estar': {
        topic: 'Personal Description',
        description: 'Practice ser vs estar through self-description',
        action: 'Describe yourself and your current state',
        reasoning: 'Personal descriptions require choosing between ser and estar'
      }
    };

    return mistakeCategories
      .filter(cat => cat.focusLevel === 'high' && topicMap[cat.type as keyof typeof topicMap])
      .slice(0, 2)
      .map(category => {
        const topic = topicMap[category.type as keyof typeof topicMap];
        return {
          id: `grammar-topic-${category.type}`,
          type: 'conversation_topic' as const,
          priority: 'high' as const,
          title: `${topic.topic} Conversation`,
          description: topic.description,
          action: topic.action,
          reasoning: topic.reasoning,
          targetSkills: ['grammar', 'conversation'],
          estimatedTime: 15,
          conversationTopic: topic.topic,
          grammarFocus: [category.type]
        };
      });
  }

  private suggestPronunciationFromConversation(
    phonemeProgress: PhonemeProgress[],
    _conversationMemory: ConversationMemory | null
  ): SmartRecommendation[] {
    const recommendations: SmartRecommendation[] = [];
    
    // Find weak phonemes
    const weakPhonemes = phonemeProgress
      .filter(p => p.currentAccuracy < 0.7)
      .sort((a, b) => a.currentAccuracy - b.currentAccuracy)
      .slice(0, 2);

    const phonemeExercises = {
      'rr': {
        title: 'Rolling R Practice',
        description: 'Master the Spanish rolled R through targeted exercises',
        action: 'Practice rolling R with "perro", "carro", "ferrocarril"',
        reasoning: 'The rolled R is essential for clear Spanish pronunciation'
      },
      'ñ': {
        title: 'Ñ Sound Mastery',
        description: 'Perfect the Spanish ñ sound',
        action: 'Practice ñ with "niño", "mañana", "español"',
        reasoning: 'The ñ sound is unique to Spanish and needs focused practice'
      },
      'j': {
        title: 'Spanish J Sound',
        description: 'Master the guttural J sound',
        action: 'Practice J with "joven", "trabajo", "mejor"',
        reasoning: 'The Spanish J sound is different from English and needs attention'
      },
      'll': {
        title: 'LL Sound Practice',
        description: 'Perfect the Spanish LL pronunciation',
        action: 'Practice LL with "llamar", "pollo", "calle"',
        reasoning: 'LL pronunciation varies by region but needs consistency'
      }
    };

    weakPhonemes.forEach(phoneme => {
      const exercise = phonemeExercises[phoneme.phoneme as keyof typeof phonemeExercises];
      if (exercise) {
        recommendations.push({
          id: `pronunciation-${phoneme.phoneme}`,
          type: 'pronunciation_exercise',
          priority: 'high',
          title: exercise.title,
          description: exercise.description,
          action: exercise.action,
          reasoning: exercise.reasoning,
          targetSkills: ['pronunciation'],
          estimatedTime: 10,
          targetPhonemes: [phoneme.phoneme]
        });
      }
    });

    return recommendations;
  }

  private suggestIntegratedPractice(
    mistakeCategories: MistakeCategory[],
    phonemeProgress: PhonemeProgress[]
  ): SmartRecommendation[] {
    const recommendations: SmartRecommendation[] = [];

    // Find overlapping issues
    const weakPhonemes = phonemeProgress.filter(p => p.currentAccuracy < 0.7);
    const grammarIssues = mistakeCategories.filter(c => c.focusLevel === 'high');

    if (weakPhonemes.length > 0 && grammarIssues.length > 0) {
      const phoneme = weakPhonemes[0];
      const grammar = grammarIssues[0];

      recommendations.push({
        id: 'integrated-practice',
        type: 'integrated_practice',
        priority: 'high',
        title: 'Combined Grammar & Pronunciation',
        description: `Practice ${grammar.type.replace('_', ' ')} while focusing on ${phoneme.phoneme} sounds`,
        action: `Use spaced repetition cards that combine ${grammar.type.replace('_', ' ')} with ${phoneme.phoneme} pronunciation`,
        reasoning: 'Combining grammar and pronunciation practice is more efficient than separate sessions',
        targetSkills: ['grammar', 'pronunciation', 'vocabulary'],
        estimatedTime: 20,
        targetPhonemes: [phoneme.phoneme],
        grammarFocus: [grammar.type]
      });
    }

    // Suggest conversation + spaced repetition integration
    if (grammarIssues.length > 0) {
      recommendations.push({
        id: 'conversation-spaced-repetition',
        type: 'integrated_practice',
        priority: 'medium',
        title: 'Conversation-Based Spaced Repetition',
        description: 'Practice vocabulary cards, then use them in conversation',
        action: 'Complete spaced repetition session, then have a conversation using those phrases',
        reasoning: 'Using new vocabulary immediately in conversation improves retention',
        targetSkills: ['vocabulary', 'conversation', 'grammar'],
        estimatedTime: 25
      });
    }

    return recommendations;
  }
}

export const smartLearningService = new SmartLearningService();
