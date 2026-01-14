import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { mirrorLingoAPI, PhraseAnalysis } from '../services/api';
import { SpacedRepetitionScheduler, ReviewItem, PerformanceRating } from '../utils/spacedRepetition';
import { useSpacedRepetitionSync } from '../hooks/useSpacedRepetitionSync';
import AsyncStorage from '@react-native-async-storage/async-storage';

type PracticeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Practice'>;
type PracticeScreenRouteProp = RouteProp<RootStackParamList, 'Practice'>;

interface Props {
  navigation: PracticeScreenNavigationProp;
  route: PracticeScreenRouteProp;
}

interface SessionStats {
  reviewed: number;
  correct: number;
  ratings: PerformanceRating[];
}

export const PracticeScreen: React.FC<Props> = ({ navigation, route }) => {
  const [phrases, setPhrases] = useState<PhraseAnalysis[]>([]);
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    reviewed: 0,
    correct: 0,
    ratings: [],
  });
  const [sessionStartTime] = useState(() => Date.now());

  const scheduler = useMemo(() => new SpacedRepetitionScheduler(), []);

  // Spaced repetition sync hook
  const {
    isEnabled: isSyncEnabled,
    isSyncing,
    syncReviewItems,
    getReviewItems
  } = useSpacedRepetitionSync('demo-user-mobile'); // Using demo user ID for now

  useEffect(() => {
    loadPhrases();
  }, []);

  const loadPhrases = async () => {
    try {
      setLoading(true);

      let loadedPhrases: PhraseAnalysis[];
      if (route.params?.phrases) {
        // Analyze new phrases from recording
        loadedPhrases = await mirrorLingoAPI.analyzePhrases(route.params.phrases);
      } else {
        // Load existing user phrases
        loadedPhrases = await mirrorLingoAPI.getUserPhrases();
      }
      setPhrases(loadedPhrases);

      // Convert to review items and load saved progress
      const savedProgress = await loadSavedProgress();
      const items: ReviewItem[] = loadedPhrases.map((phrase, idx) => {
        const saved = savedProgress[phrase.phrase];
        return {
          id: `phrase-${idx}`,
          content: phrase.phrase,
          translation: phrase.translations?.natural || 'Translation unavailable',
          easeFactor: saved?.easeFactor || 2.5,
          interval: saved?.interval || 1,
          repetitions: saved?.repetitions || 0,
          nextReview: saved?.nextReview ? new Date(saved.nextReview) : new Date(),
          createdAt: new Date(),
          lastReviewed: saved?.lastReviewed ? new Date(saved.lastReviewed) : null,
        };
      });

      // Get due items for review
      const dueItems = scheduler.getDueItems(items);
      setReviewItems(dueItems.length > 0 ? dueItems : items);
    } catch (error) {
      Alert.alert('Error', 'Failed to load phrases');
    } finally {
      setLoading(false);
    }
  };

  const loadSavedProgress = async (): Promise<Record<string, any>> => {
    try {
      const saved = await AsyncStorage.getItem('spaced_repetition_progress');
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.error('Failed to load progress:', error);
      return {};
    }
  };

  const saveProgress = async (item: ReviewItem) => {
    try {
      const saved = await loadSavedProgress();
      saved[item.content] = {
        easeFactor: item.easeFactor,
        interval: item.interval,
        repetitions: item.repetitions,
        nextReview: item.nextReview.toISOString(),
        lastReviewed: item.lastReviewed?.toISOString(),
      };
      await AsyncStorage.setItem('spaced_repetition_progress', JSON.stringify(saved));
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  };

  const currentItem = reviewItems[currentIndex];
  const currentPhrase = phrases[currentIndex];

  const handleRating = async (rating: PerformanceRating) => {
    if (!currentItem) return;

    // Process the review with spaced repetition
    const updatedItem = scheduler.processReview(currentItem, rating);
    await saveProgress(updatedItem);

    // Update review items with the processed item
    const updatedReviewItems = reviewItems.map(item => 
      item.id === currentItem.id ? updatedItem : item
    );

    // Sync updated items if sync is enabled
    if (isSyncEnabled) {
      try {
        await syncReviewItems(updatedReviewItems);
      } catch (error) {
        console.error('Failed to sync review items:', error);
      }
    }

    // Update session stats
    const newStats = {
      reviewed: sessionStats.reviewed + 1,
      correct: sessionStats.correct + (rating >= PerformanceRating.GOOD ? 1 : 0),
      ratings: [...sessionStats.ratings, rating],
    };
    setSessionStats(newStats);

    // Move to next item
    if (currentIndex < reviewItems.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowTranslation(false);
    } else {
      // Session complete
      const timeSpent = Math.round((Date.now() - sessionStartTime) / 1000);
      const averageRating = newStats.ratings.reduce((a, b) => a + b, 0) / newStats.ratings.length;

      Alert.alert(
        'Session Complete!',
        `Great practice session!\n\n` +
        `Phrases reviewed: ${newStats.reviewed}\n` +
        `Correct: ${newStats.correct}\n` +
        `Accuracy: ${Math.round((newStats.correct / newStats.reviewed) * 100)}%\n` +
        `Time: ${Math.floor(timeSpent / 60)}m ${timeSpent % 60}s`,
        [
          { text: 'Practice Again', onPress: () => {
            setCurrentIndex(0);
            setShowTranslation(false);
            setSessionStats({ reviewed: 0, correct: 0, ratings: [] });
          }},
          { text: 'Go Home', onPress: () => navigation.navigate('Home') },
        ]
      );
    }
  };

  const handleSkip = () => {
    if (currentIndex < reviewItems.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowTranslation(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Analyzing your phrases...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (reviewItems.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>All caught up!</Text>
          <Text style={styles.emptyText}>No phrases are due for review right now.</Text>
          <Text style={styles.emptySubtext}>Come back later for more practice.</Text>
          <TouchableOpacity
            style={styles.recordButton}
            onPress={() => navigation.navigate('Record')}
          >
            <Text style={styles.recordButtonText}>Record New Phrases</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Session Header */}
        <View style={styles.sessionHeader}>
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              {currentIndex + 1} of {reviewItems.length}
            </Text>
            {isSyncEnabled && (
              <Text style={[styles.syncStatus, { color: isSyncing ? '#ff9500' : '#34c759' }]}>
                {isSyncing ? '🔄 Syncing...' : '✅ Synced'}
              </Text>
            )}
          </View>
          <View style={styles.statsContainer}>
            <Text style={styles.statsText}>
              Correct: {sessionStats.correct}/{sessionStats.reviewed}
            </Text>
          </View>
        </View>

        <View style={styles.phraseCard}>
          <Text style={styles.englishPhrase}>"{currentItem?.content || currentPhrase?.phrase}"</Text>

          {!showTranslation ? (
            <View style={styles.revealSection}>
              <Text style={styles.revealHint}>Think of the Spanish translation, then reveal the answer.</Text>
              <TouchableOpacity
                style={styles.revealButton}
                onPress={() => setShowTranslation(true)}
              >
                <Text style={styles.revealButtonText}>Show Spanish</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.translationContainer}>
              <View style={styles.spanishAnswer}>
                <Text style={styles.spanishAnswerText}>
                  {currentItem?.translation || currentPhrase?.translations?.natural}
                </Text>
              </View>

              {currentPhrase?.translations?.literal && (
                <View style={styles.translationSection}>
                  <Text style={styles.translationLabel}>Literal Translation:</Text>
                  <Text style={styles.literalTranslation}>
                    "{currentPhrase.translations.literal}"
                  </Text>
                </View>
              )}

              {currentPhrase?.translations?.explanation && (
                <View style={styles.explanationSection}>
                  <Text style={styles.explanationLabel}>Why this translation?</Text>
                  <Text style={styles.explanation}>
                    {currentPhrase.translations.explanation}
                  </Text>
                </View>
              )}

              {/* Rating Section */}
              <View style={styles.ratingSection}>
                <Text style={styles.ratingTitle}>How well did you remember this?</Text>
                <View style={styles.ratingGrid}>
                  <TouchableOpacity
                    style={[styles.ratingButton, styles.ratingAgain]}
                    onPress={() => handleRating(PerformanceRating.AGAIN)}
                  >
                    <Text style={styles.ratingEmoji}>😵</Text>
                    <Text style={styles.ratingLabel}>Again</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.ratingButton, styles.ratingHard]}
                    onPress={() => handleRating(PerformanceRating.HARD)}
                  >
                    <Text style={styles.ratingEmoji}>😅</Text>
                    <Text style={styles.ratingLabel}>Hard</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.ratingButton, styles.ratingGood]}
                    onPress={() => handleRating(PerformanceRating.GOOD)}
                  >
                    <Text style={styles.ratingEmoji}>😊</Text>
                    <Text style={styles.ratingLabel}>Good</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.ratingButton, styles.ratingEasy]}
                    onPress={() => handleRating(PerformanceRating.EASY)}
                  >
                    <Text style={styles.ratingEmoji}>😎</Text>
                    <Text style={styles.ratingLabel}>Easy</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Skip Button */}
        {currentIndex < reviewItems.length - 1 && (
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
          >
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#48bb78',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#a0aec0',
    textAlign: 'center',
    marginBottom: 30,
  },
  recordButton: {
    backgroundColor: '#667eea',
    padding: 15,
    borderRadius: 12,
  },
  recordButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667eea',
  },
  statsContainer: {
    alignItems: 'center',
  },
  statsText: {
    fontSize: 14,
    color: '#718096',
  },
  phraseCard: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  englishPhrase: {
    fontSize: 22,
    color: '#2d3748',
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '600',
    lineHeight: 30,
  },
  revealSection: {
    alignItems: 'center',
  },
  revealHint: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 16,
  },
  revealButton: {
    backgroundColor: '#667eea',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  revealButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  translationContainer: {
    marginTop: 10,
  },
  spanishAnswer: {
    marginBottom: 20,
    padding: 20,
    backgroundColor: '#e6fffa',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#38b2ac',
  },
  spanishAnswerText: {
    fontSize: 20,
    color: '#234e52',
    fontWeight: '600',
    textAlign: 'center',
  },
  translationSection: {
    marginBottom: 15,
  },
  translationLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    fontWeight: '600',
  },
  naturalTranslation: {
    fontSize: 18,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  literalTranslation: {
    fontSize: 16,
    color: '#666',
  },
  explanationSection: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  explanationLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    marginBottom: 5,
  },
  explanation: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  ratingSection: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  ratingTitle: {
    fontSize: 16,
    color: '#4a5568',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '500',
  },
  ratingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  ratingButton: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingAgain: {
    backgroundColor: '#fed7d7',
  },
  ratingHard: {
    backgroundColor: '#feebc8',
  },
  ratingGood: {
    backgroundColor: '#c6f6d5',
  },
  ratingEasy: {
    backgroundColor: '#bee3f8',
  },
  ratingEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  ratingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d3748',
  },
  skipButton: {
    padding: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#718096',
    fontSize: 14,
    fontWeight: '500',
  },
  syncStatus: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  navButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  navButtonDisabled: {
    backgroundColor: '#ccc',
  },
  navButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
