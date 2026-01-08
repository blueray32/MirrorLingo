import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

type TranslationsScreenRouteProp = RouteProp<RootStackParamList, 'Translations'>;
type TranslationsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Translations'>;

interface Props {
  route: TranslationsScreenRouteProp;
  navigation: TranslationsScreenNavigationProp;
}

interface Translation {
  phrase: string;
  literal: string;
  natural: string;
  explanation: string;
  styleMatch: number;
  culturalNotes?: string;
  learningTips?: string[];
}

export const TranslationsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { phrases, profile } = route.params;
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    generateTranslations();
  }, []);

  const generateTranslations = async () => {
    try {
      setIsLoading(true);

      // Get user ID
      const userId = await AsyncStorage.getItem('user_id') || 'anonymous';

      // Call real API
      const response = await fetch(`${API_BASE_URL}/api/translations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify({
          phrases: phrases.map((p: any) => p.englishText || p),
          profile: profile,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        if (data.success && data.data?.translations) {
          const apiTranslations: Translation[] = data.data.translations.map((t: any) => ({
            phrase: t.englishPhrase,
            literal: t.translation?.literal || t.literal || getMockLiteralTranslation(t.englishPhrase),
            natural: t.translation?.natural || t.natural || getMockNaturalTranslation(t.englishPhrase),
            explanation: t.translation?.explanation || t.explanation || `This translation preserves your ${profile?.tone || 'casual'} tone.`,
            styleMatch: t.translation?.styleMatch || t.styleMatch || 0.85,
            culturalNotes: t.translation?.culturalNotes || t.culturalNotes,
            learningTips: t.translation?.learningTips || t.learningTips || [],
          }));
          setTranslations(apiTranslations);
          return;
        }
      }

      // Fallback to mock translations
      throw new Error('API unavailable');
    } catch (error) {
      console.error('Translation API Error:', error);
      // Fallback to mock translations
      const mockTranslations: Translation[] = phrases.map((phrase: any) => ({
        phrase: phrase.englishText || phrase,
        literal: getMockLiteralTranslation(phrase.englishText || phrase),
        natural: getMockNaturalTranslation(phrase.englishText || phrase),
        explanation: `This translation preserves your ${profile?.tone || 'casual'} tone and speaking style.`,
        styleMatch: 0.85 + Math.random() * 0.1,
        culturalNotes: 'In Spanish-speaking cultures, matching your natural tone helps build authentic connections.',
        learningTips: ['Practice speaking the natural translation out loud', 'Focus on the rhythm and flow of the phrase'],
      }));
      setTranslations(mockTranslations);
    } finally {
      setIsLoading(false);
    }
  };

  const getMockLiteralTranslation = (phrase: string): string => {
    const translations: Record<string, string> = {
      'Could you take a look at this?': '¿Podrías echar un vistazo a esto?',
      'No worries, take your time': 'No te preocupes, tómate tu tiempo',
      'I\'ll be there in about 10 minutes': 'Estaré allí en unos 10 minutos',
      'How are you doing today?': '¿Cómo estás hoy?',
      'Thanks for your help': 'Gracias por tu ayuda',
    };
    return translations[phrase] || `Traducción literal de: ${phrase}`;
  };

  const getMockNaturalTranslation = (phrase: string): string => {
    const translations: Record<string, string> = {
      'Could you take a look at this?': '¿Le echas un ojo a esto?',
      'No worries, take your time': 'Tranquilo, sin prisa',
      'I\'ll be there in about 10 minutes': 'Llego en 10 minutitos',
      'How are you doing today?': '¿Qué tal el día?',
      'Thanks for your help': 'Te agradezco la ayuda',
    };
    return translations[phrase] || `Traducción natural de: ${phrase}`;
  };

  const getStyleMatchColor = (score: number): string => {
    if (score >= 0.9) return '#48bb78';
    if (score >= 0.8) return '#ed8936';
    return '#e53e3e';
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Generating Spanish translations...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Spanish Translations</Text>
        <Text style={styles.subtitle}>
          Personalized translations that match your speaking style
        </Text>
      </View>

      {translations.map((translation, index) => (
        <View key={index} style={styles.translationCard}>
          <View style={styles.originalPhrase}>
            <Text style={styles.originalLabel}>Original</Text>
            <Text style={styles.originalText}>{translation.phrase}</Text>
          </View>

          <View style={styles.translationsContainer}>
            <View style={styles.translationVariant}>
              <Text style={styles.variantLabel}>📚 Literal Translation</Text>
              <Text style={styles.translationText}>{translation.literal}</Text>
            </View>

            <View style={styles.translationVariant}>
              <Text style={styles.variantLabel}>💬 Natural Translation</Text>
              <Text style={styles.translationText}>{translation.natural}</Text>
            </View>
          </View>

          <View style={styles.explanation}>
            <Text style={styles.explanationLabel}>Why this translation?</Text>
            <Text style={styles.explanationText}>{translation.explanation}</Text>
          </View>

          <View style={styles.styleMatch}>
            <Text style={styles.styleMatchLabel}>Style Match</Text>
            <View style={styles.styleMatchBar}>
              <View
                style={[
                  styles.styleMatchFill,
                  {
                    width: `${translation.styleMatch * 100}%`,
                    backgroundColor: getStyleMatchColor(translation.styleMatch)
                  }
                ]}
              />
            </View>
            <Text style={styles.styleMatchScore}>
              {Math.round(translation.styleMatch * 100)}%
            </Text>
          </View>

          {translation.culturalNotes && (
            <View style={styles.culturalNotesContainer}>
              <Text style={styles.culturalNotesLabel}>🌍 Cultural Notes</Text>
              <Text style={styles.culturalNotesText}>{translation.culturalNotes}</Text>
            </View>
          )}

          {translation.learningTips && translation.learningTips.length > 0 && (
            <View style={styles.learningTipsContainer}>
              <Text style={styles.learningTipsLabel}>💡 Learning Tips</Text>
              {translation.learningTips.map((tip, tipIndex) => (
                <Text key={tipIndex} style={styles.learningTipText}>• {tip}</Text>
              ))}
            </View>
          )}
        </View>
      ))}

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.practiceButton}
          onPress={() => navigation.navigate('Practice', { phrases })}
        >
          <Text style={styles.practiceButtonText}>🔄 Start Practice Session</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.conversationButton}
          onPress={() => navigation.navigate('Conversation', { profile })}
        >
          <Text style={styles.conversationButtonText}>🗣️ AI Conversation</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#4a5568',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
    lineHeight: 24,
  },
  translationCard: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  originalPhrase: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  originalLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#718096',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  originalText: {
    fontSize: 18,
    color: '#2d3748',
    fontWeight: '500',
  },
  translationsContainer: {
    marginBottom: 20,
  },
  translationVariant: {
    marginBottom: 16,
  },
  variantLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4a5568',
    marginBottom: 8,
  },
  translationText: {
    fontSize: 16,
    color: '#2d3748',
    backgroundColor: '#f7fafc',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  explanation: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#edf2f7',
    borderRadius: 8,
  },
  explanationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4a5568',
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 14,
    color: '#718096',
    lineHeight: 20,
  },
  styleMatch: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  styleMatchLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4a5568',
    marginRight: 12,
    minWidth: 80,
  },
  styleMatchBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    marginRight: 12,
  },
  styleMatchFill: {
    height: '100%',
    borderRadius: 4,
  },
  styleMatchScore: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4a5568',
    minWidth: 40,
  },
  actions: {
    padding: 20,
    gap: 12,
  },
  practiceButton: {
    backgroundColor: '#48bb78',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  practiceButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  conversationButton: {
    backgroundColor: '#667eea',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  conversationButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  culturalNotesContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  culturalNotesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 8,
  },
  culturalNotesText: {
    fontSize: 14,
    color: '#78350f',
    lineHeight: 20,
  },
  learningTipsContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#dbeafe',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  learningTipsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 8,
  },
  learningTipText: {
    fontSize: 13,
    color: '#1e3a8a',
    lineHeight: 18,
    marginBottom: 4,
  },
});
