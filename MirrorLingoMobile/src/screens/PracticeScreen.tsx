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
import { Theme } from '../styles/designSystem';
import { ActivityIndicator, StatusBar } from 'react-native';

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
      if (route.params?.phrases && route.params.phrases.length > 0) {
        // Check if we received strings or objects
        if (typeof route.params.phrases[0] === 'string') {
          // Analyze new phrases from recording
          loadedPhrases = await mirrorLingoAPI.analyzePhrases(route.params.phrases as string[]);
          // Persist newly analyzed phrases if they came from a raw recording
          await mirrorLingoAPI.cachePhrases(loadedPhrases);
        } else {
          // We received pre-analyzed objects from TutorScreen
          loadedPhrases = route.params.phrases as any[];
        }
      } else {
        // Load existing user phrases
        loadedPhrases = await mirrorLingoAPI.getUserPhrases();
      }
      setPhrases(loadedPhrases);

      // Convert to review items and load saved progress
      const savedProgress = await loadSavedProgress();
      const items: ReviewItem[] = loadedPhrases.map((phrase: any, idx) => {
        const content = phrase.englishText || phrase.phrase || 'Phrase Unavailable';
        const translation =
          phrase.spanishText ||
          phrase.translations?.natural ||
          phrase.translation ||
          'Translation pending...';

        const saved = savedProgress[content];
        return {
          id: `phrase-${idx}`,
          content: content,
          translation: translation,
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
          {
            text: 'Practice Again', onPress: () => {
              setCurrentIndex(0);
              setShowTranslation(false);
              setSessionStats({ reviewed: 0, correct: 0, ratings: [] });
            }
          },
          { text: 'Go Home', onPress: () => navigation.navigate('MainTabs') },
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
        <StatusBar barStyle="light-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
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
      <StatusBar barStyle="light-content" />
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

              {/* Fallback translations / explanations if available */}
              {(currentPhrase as any)?.translations?.literal && (
                <View style={styles.translationSection}>
                  <Text style={styles.translationLabel}>Literal Translation:</Text>
                  <Text style={styles.literalTranslation}>
                    "{(currentPhrase as any).translations.literal}"
                  </Text>
                </View>
              )}

              {(currentPhrase as any)?.translations?.explanation && (
                <View style={styles.explanationSection}>
                  <Text style={styles.explanationLabel}>Why this translation?</Text>
                  <Text style={styles.explanation}>
                    {(currentPhrase as any).translations.explanation}
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
    backgroundColor: Theme.colors.background,
  },
  content: {
    padding: Theme.spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: Theme.typography.sizes.md,
    color: Theme.colors.textSecondary,
    marginTop: Theme.spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: Theme.typography.sizes.xl,
    fontWeight: 'bold',
    color: Theme.colors.accent,
    marginBottom: Theme.spacing.sm,
  },
  emptyText: {
    fontSize: Theme.typography.sizes.md,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: Theme.spacing.xs,
  },
  emptySubtext: {
    fontSize: Theme.typography.sizes.sm,
    color: Theme.colors.textMuted,
    textAlign: 'center',
    marginBottom: Theme.spacing.xl,
  },
  recordButton: {
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.radius.md,
  },
  recordButtonText: {
    color: Theme.colors.textPrimary,
    fontSize: Theme.typography.sizes.md,
    fontWeight: '600',
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.card,
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  progressContainer: {
    alignItems: 'flex-start',
  },
  progressText: {
    fontSize: Theme.typography.sizes.sm,
    fontWeight: 'bold',
    color: Theme.colors.primary,
  },
  statsContainer: {
    alignItems: 'flex-end',
  },
  statsText: {
    fontSize: Theme.typography.sizes.sm,
    color: Theme.colors.textSecondary,
    fontWeight: '600',
  },
  phraseCard: {
    backgroundColor: Theme.colors.card,
    padding: Theme.spacing.lg,
    borderRadius: Theme.radius.lg,
    marginBottom: Theme.spacing.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  englishPhrase: {
    fontSize: Theme.typography.sizes.xl,
    color: Theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: Theme.spacing.xl,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  revealSection: {
    alignItems: 'center',
  },
  revealHint: {
    fontSize: Theme.typography.sizes.sm,
    color: Theme.colors.textMuted,
    textAlign: 'center',
    marginBottom: Theme.spacing.lg,
  },
  revealButton: {
    backgroundColor: Theme.colors.primary,
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.xl,
    borderRadius: Theme.radius.md,
    width: '100%',
    alignItems: 'center',
  },
  revealButtonText: {
    color: Theme.colors.textPrimary,
    fontSize: Theme.typography.sizes.md,
    fontWeight: 'bold',
  },
  translationContainer: {
    marginTop: Theme.spacing.sm,
  },
  spanishAnswer: {
    marginBottom: Theme.spacing.lg,
    padding: Theme.spacing.lg,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: Theme.radius.md,
    borderLeftWidth: 4,
    borderLeftColor: Theme.colors.accent,
  },
  spanishAnswerText: {
    fontSize: Theme.typography.sizes.xl,
    color: Theme.colors.accent,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  translationSection: {
    marginBottom: Theme.spacing.md,
  },
  translationLabel: {
    fontSize: Theme.typography.sizes.xs,
    color: Theme.colors.textMuted,
    marginBottom: Theme.spacing.xs,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  literalTranslation: {
    fontSize: Theme.typography.sizes.md,
    color: Theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  explanationSection: {
    marginTop: Theme.spacing.md,
    padding: Theme.spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: Theme.radius.sm,
  },
  explanationLabel: {
    fontSize: Theme.typography.sizes.xs,
    color: Theme.colors.textSecondary,
    fontWeight: 'bold',
    marginBottom: Theme.spacing.xs,
  },
  explanation: {
    fontSize: Theme.typography.sizes.sm,
    color: Theme.colors.textMuted,
    lineHeight: 20,
  },
  ratingSection: {
    marginTop: Theme.spacing.xl,
    paddingTop: Theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
  },
  ratingTitle: {
    fontSize: Theme.typography.sizes.sm,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: Theme.spacing.md,
    fontWeight: '600',
  },
  ratingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Theme.spacing.sm,
  },
  ratingButton: {
    width: '48%',
    padding: Theme.spacing.md,
    borderRadius: Theme.radius.md,
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  ratingAgain: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  ratingHard: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  ratingGood: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
  },
  ratingEasy: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  ratingEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  ratingLabel: {
    fontSize: Theme.typography.sizes.xs,
    fontWeight: 'bold',
    color: Theme.colors.textPrimary,
  },
  skipButton: {
    padding: Theme.spacing.md,
    alignItems: 'center',
  },
  skipButtonText: {
    color: Theme.colors.textMuted,
    fontSize: Theme.typography.sizes.sm,
    fontWeight: '600',
  },
  syncStatus: {
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 2,
    textTransform: 'uppercase',
  },
});
