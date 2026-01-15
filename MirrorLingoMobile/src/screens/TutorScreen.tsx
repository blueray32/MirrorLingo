import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Animated,
    TextInput,
    Alert
} from 'react-native';
import { Theme } from '../styles/designSystem';
import { usePhrasesApi } from '../hooks/usePhrasesApi';
import { mirrorLingoAPI, PhraseAnalysis } from '../services/api';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { useFocusEffect } from '@react-navigation/native';

type TutorScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MainTabs'>;

interface Props {
    navigation: TutorScreenNavigationProp;
}

type TutorTab = 'practice' | 'deck' | 'training' | 'pronunciation';

export const TutorScreen: React.FC<Props> = ({ navigation }) => {
    const { phrases, profile, isLoading, loadPhrases } = usePhrasesApi();
    const [activeTab, setActiveTab] = useState<TutorTab>('practice');
    const [exercises, setExercises] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [score, setScore] = useState({ correct: 0, total: 0 });

    // Pronunciation state
    const [selectedPhrase, setSelectedPhrase] = useState<any>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [pronunciationResult, setPronunciationResult] = useState<any>(null);

    useEffect(() => {
        loadPhrases();
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadPhrases();
        }, [loadPhrases])
    );

    useEffect(() => {
        if (phrases.length > 0) {
            if (!selectedPhrase) {
                // Initial selection
                setSelectedPhrase(phrases[0]);
            } else {
                // Keep selectedPhrase in sync with updated list (e.g. after auto-repair)
                const updated = phrases.find(p => p.englishText === selectedPhrase.englishText);
                if (updated && (updated.spanishText !== selectedPhrase.spanishText)) {
                    setSelectedPhrase(updated);
                }
            }
        }
    }, [phrases, selectedPhrase]);

    // Generate exercises logic (Full Parity Ported from Website)
    const generateExercises = useCallback(() => {
        if (phrases.length === 0) return;

        const mixedExercises: any[] = [];
        phrases.forEach((phrase) => {
            const spanishText = phrase.spanishText || "";
            const englishText = phrase.englishText || "";

            if (!spanishText || !englishText) return;

            const spanishWords = spanishText.split(' ');

            // Type 1: Fill in the blank (Spanish)
            if (spanishWords.length >= 3) {
                const keyWordIndex = Math.floor(spanishWords.length / 2);
                const blankWord = spanishWords[keyWordIndex];
                const exerciseWords = [...spanishWords];
                exerciseWords[keyWordIndex] = '_____';

                mixedExercises.push({
                    id: `fill-${phrase.phraseId || Math.random()}`,
                    type: 'Fill in the Blank',
                    exercise: `Complete the Spanish: ${exerciseWords.join(' ')}`,
                    answer: blankWord.toLowerCase().replace(/[.,!?¡¿]/g, ''),
                    hint: `English: "${englishText}"`,
                    original: spanishText
                });
            }

            // Type 2: Word Reorder (Spanish)
            if (spanishWords.length >= 3 && spanishWords.length <= 8) {
                const shuffled = [...spanishWords].sort(() => Math.random() - 0.5);
                if (shuffled.join(' ') !== spanishText) {
                    mixedExercises.push({
                        id: `reorder-${phrase.phraseId || Math.random()}`,
                        type: 'Word Reorder',
                        exercise: `Reorder to form: "${englishText}"\n\n${shuffled.join('  /  ')}`,
                        answer: spanishText.toLowerCase().replace(/[.,!?¡¿]/g, ''),
                        hint: `Starts with "${spanishWords[0]}"`,
                        original: spanishText
                    });
                }
            }

            // Type 3: Translation (English to Spanish)
            mixedExercises.push({
                id: `translate-${phrase.phraseId || Math.random()}`,
                type: 'Translation',
                exercise: `Translate to Spanish: "${englishText}"`,
                answer: spanishText.toLowerCase().replace(/[.,!?¡¿]/g, ''),
                hint: `Starts with "${spanishWords[0]}"`,
                original: spanishText
            });

            // Type 4: Vocabulary Recall (Multiple Choice)
            const others = phrases
                .filter(p => p.phraseId !== phrase.phraseId)
                .map(p => p.englishText)
                .slice(0, 3);

            if (others.length >= 2) {
                const options = [englishText, ...others].sort(() => Math.random() - 0.5);
                mixedExercises.push({
                    id: `vocab-${phrase.phraseId || Math.random()}`,
                    type: 'Vocabulary Recall',
                    exercise: `What does this Spanish mean?\n"${spanishText}"`,
                    answer: englishText.toLowerCase().replace(/[.,!?]/g, ''),
                    options: options,
                    original: englishText
                });
            }

            // Type 5: Articles (el, la, un, una)
            const spanishArticles = ['el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas'];
            const firstWord = spanishWords[0]?.toLowerCase();
            if (spanishArticles.includes(firstWord) && spanishWords.length >= 2) {
                const withoutArticle = spanishWords.slice(1).join(' ');
                mixedExercises.push({
                    id: `article-${phrase.phraseId || Math.random()}`,
                    type: 'Article Practice',
                    exercise: `Add the correct article: _____ ${withoutArticle}`,
                    answer: firstWord,
                    hint: 'el, la, un, or una?',
                    options: ['el', 'la', 'un', 'una'].sort(() => Math.random() - 0.5),
                    original: spanishText
                });
            }
        });

        // Limit to 10 shuffled exercises
        setExercises(mixedExercises.sort(() => Math.random() - 0.5).slice(0, 10));
    }, [phrases]);

    useEffect(() => {
        if (phrases.length > 0) {
            generateExercises();
        }
    }, [phrases]);

    const checkAnswer = () => {
        const normalizedUserAnswer = userAnswer.toLowerCase().trim().replace(/[.,!?]/g, '');
        const normalizedCorrectAnswer = exercises[currentIndex].answer;
        const isMatch = normalizedUserAnswer === normalizedCorrectAnswer;

        setIsCorrect(isMatch);
        setShowResult(true);
        setScore((prev: { correct: number; total: number }) => ({
            correct: prev.correct + (isMatch ? 1 : 0),
            total: prev.total + 1
        }));
    };

    const nextExercise = () => {
        if (currentIndex < exercises.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setUserAnswer('');
            setShowResult(false);
        } else {
            Alert.alert(
                'Training Complete!',
                `You scored ${score.correct + (isCorrect ? 1 : 0)} out of ${exercises.length}`
            );
            generateExercises();
            setCurrentIndex(0);
            setUserAnswer('');
            setShowResult(false);
        }
    };

    const renderPractice = () => (
        <View style={styles.tabContent}>
            <View style={styles.card}>
                <Text style={styles.cardEmoji}>🔄</Text>
                <Text style={styles.cardTitle}>Spaced Practice</Text>
                <Text style={styles.cardDescription}>
                    Master phrases using scientifically proven spaced repetition intervals.
                </Text>
                <TouchableOpacity
                    style={styles.primaryAction}
                    onPress={() => navigation.navigate('Practice', { phrases: phrases.slice(0, 10) })}
                >
                    <Text style={styles.primaryActionText}>Start Session</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderDeck = () => (
        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
            {phrases.map((phrase, index) => (
                <Flashcard key={index} phrase={phrase} />
            ))}
            {phrases.length === 0 && (
                <Text style={styles.emptyText}>Record some phrases to populate your deck!</Text>
            )}
        </ScrollView>
    );

    const renderTraining = () => {
        if (exercises.length === 0) return (
            <View style={styles.tabContent}>
                <ActivityIndicator size="large" color={Theme.colors.primary} />
                <Text style={styles.emptyText}>Preparing exercises...</Text>
            </View>
        );

        const current = exercises[currentIndex];
        return (
            <View style={styles.tabContent}>
                <View style={styles.mixerCard}>
                    <View style={styles.mixerHeader}>
                        <Text style={styles.mixerType}>{current.type}</Text>
                        <Text style={styles.mixerProgress}>{currentIndex + 1} / {exercises.length}</Text>
                    </View>

                    <View style={styles.exerciseContent}>
                        <Text style={styles.exerciseText}>{current.exercise}</Text>

                        {!showResult ? (
                            <View style={styles.inputSection}>
                                {current.options ? (
                                    <View style={styles.optionsGrid}>
                                        {current.options.map((option: string, idx: number) => (
                                            <TouchableOpacity
                                                key={idx}
                                                style={[styles.optionBtn, userAnswer === option && styles.optionSelected]}
                                                onPress={() => setUserAnswer(option)}
                                            >
                                                <Text style={[styles.optionBtnText, userAnswer === option && styles.optionSelectedText]}>
                                                    {option}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                ) : (
                                    <TextInput
                                        style={styles.exerciseInput}
                                        placeholder="Type answer..."
                                        placeholderTextColor={Theme.colors.textMuted}
                                        value={userAnswer}
                                        onChangeText={setUserAnswer}
                                        autoCorrect={false}
                                        autoCapitalize="none"
                                    />
                                )}
                                <TouchableOpacity
                                    style={[styles.verifyButton, !userAnswer && styles.buttonDisabled]}
                                    onPress={checkAnswer}
                                    disabled={!userAnswer}
                                >
                                    <Text style={styles.verifyButtonText}>Verify</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.resultSection}>
                                <View style={[styles.resultBanner, isCorrect ? styles.correctBanner : styles.errorBanner]}>
                                    <Text style={styles.resultBannerText}>
                                        {isCorrect ? '✨ Perfect!' : '🧗 Almost there'}
                                    </Text>
                                </View>
                                {!isCorrect && (
                                    <View style={styles.revealBox}>
                                        <Text style={styles.revealLabel}>Correct Answer:</Text>
                                        <Text style={styles.revealValue}>{current.answer}</Text>
                                    </View>
                                )}
                                <TouchableOpacity style={styles.nextButton} onPress={nextExercise}>
                                    <Text style={styles.nextButtonText}>Next Exercise</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            </View>
        );
    };

    const startPronunciationRecording = () => {
        setIsRecording(true);
        setPronunciationResult(null);
    };

    const stopPronunciationRecording = () => {
        setIsRecording(false);
        setIsAnalyzing(true);
        // Simulate analysis
        setTimeout(() => {
            const score = Math.floor(70 + Math.random() * 25);
            setPronunciationResult({
                score,
                accuracy: score + (Math.random() > 0.5 ? 2 : -2),
                fluency: score + (Math.random() > 0.5 ? 3 : -3),
                tips: [
                    "Great emphasis on the 'r' sounds.",
                    "Vowels could be slightly clearer.",
                    "Pitch matches natural Spanish intonation well."
                ]
            });
            setIsAnalyzing(false);
        }, 2000);
    };

    const renderPronunciation = () => {
        if (!selectedPhrase && phrases.length > 0) return null;
        if (phrases.length === 0) return (
            <View style={styles.tabContent}>
                <Text style={styles.emptyText}>Record some phrases to start accent practice!</Text>
            </View>
        );

        const spanishText = (selectedPhrase as any).spanishText || (selectedPhrase as any).translation || 'Loading...';

        return (
            <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
                <View style={styles.pronunciationCard}>
                    <Text style={styles.accentLabel}>Accent Tool</Text>
                    <Text style={styles.accentTitle}>Mirror Your Pronunciation</Text>

                    <View style={styles.targetPhraseBox}>
                        <Text style={styles.targetLabel}>Target Phrase</Text>
                        <Text style={styles.targetText}>{spanishText}</Text>
                        <TouchableOpacity
                            style={styles.guideBtn}
                            onPress={() => Alert.alert('Guide', 'Audio guide playing...')}
                        >
                            <Text style={styles.guideBtnText}>🔊 Play Guide</Text>
                        </TouchableOpacity>
                    </View>

                    {isAnalyzing ? (
                        <View style={styles.analyzingBox}>
                            <ActivityIndicator size="large" color={Theme.colors.primary} />
                            <Text style={styles.analyzingText}>Analyzing your accent...</Text>
                        </View>
                    ) : pronunciationResult ? (
                        <View style={styles.pronunciationResults}>
                            <View style={styles.scoreCircle}>
                                <Text style={styles.scoreBigText}>{pronunciationResult.score}</Text>
                                <Text style={styles.scoreUnit}>pts</Text>
                            </View>
                            <View style={styles.resultsMeta}>
                                <Text style={styles.resultsStatus}>
                                    {pronunciationResult.score > 85 ? 'Excelente!' : 'Muy bien!'}
                                </Text>
                                <View style={styles.metricRow}>
                                    <Text style={styles.metricText}>Accuracy: {pronunciationResult.accuracy}%</Text>
                                    <Text style={styles.metricText}>Fluency: {pronunciationResult.fluency}%</Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                style={styles.retryBtn}
                                onPress={() => setPronunciationResult(null)}
                            >
                                <Text style={styles.retryBtnText}>Try Again</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.controlsRow}>
                            {!isRecording ? (
                                <TouchableOpacity
                                    style={styles.recordActionBtn}
                                    onPress={startPronunciationRecording}
                                >
                                    <View style={styles.recordDot} />
                                    <Text style={styles.recordBtnText}>Start Practice</Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity
                                    style={[styles.recordActionBtn, styles.stopBtn]}
                                    onPress={stopPronunciationRecording}
                                >
                                    <View style={styles.stopSquare} />
                                    <Text style={styles.recordBtnText}>Stop & Analyze</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                </View>

                <View style={styles.selectorSection}>
                    <Text style={styles.selectorTitle}>Pick a Phrase to Practice:</Text>
                    <View style={styles.phraseSelectorList}>
                        {phrases.slice(0, 10).map((p, i) => (
                            <TouchableOpacity
                                key={i}
                                style={[styles.phraseTag, selectedPhrase?.englishText === p.englishText && styles.activePhraseTag]}
                                onPress={() => {
                                    setSelectedPhrase(p);
                                    setPronunciationResult(null);
                                }}
                            >
                                <Text
                                    style={[styles.phraseTagText, selectedPhrase?.englishText === p.englishText && styles.activePhraseTagText]}
                                    numberOfLines={1}
                                >
                                    {p.englishText}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </ScrollView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Tutor</Text>
                    <Text style={styles.subtitle}>Personalized Practice</Text>
                </View>
                <View style={styles.scoreBadge}>
                    <Text style={styles.scoreText}>{phrases.length} Phrases</Text>
                </View>
            </View>

            <View style={styles.tabsContainer}>
                {(['practice', 'deck', 'training', 'pronunciation'] as const).map(tab => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tab, activeTab === tab && styles.activeTab]}
                        onPress={() => setActiveTab(tab)}
                    >
                        <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                            {tab === 'pronunciation' ? 'Accent' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Theme.colors.primary} />
                </View>
            ) : (
                <View style={{ flex: 1 }}>
                    {activeTab === 'practice' && renderPractice()}
                    {activeTab === 'deck' && renderDeck()}
                    {activeTab === 'training' && renderTraining()}
                    {activeTab === 'pronunciation' && renderPronunciation()}
                </View>
            )}
        </SafeAreaView>
    );
};

// Flashcard Component
const Flashcard = ({ phrase }: { phrase: any }) => {
    const [flipped, setFlipped] = useState(false);
    const animatedValue = useRef(new Animated.Value(0)).current;

    let frontInterpolate = animatedValue.interpolate({
        inputRange: [0, 180],
        outputRange: ['0deg', '180deg'],
    });
    let backInterpolate = animatedValue.interpolate({
        inputRange: [0, 180],
        outputRange: ['180deg', '360deg'],
    });

    const flipCard = () => {
        if (flipped) {
            Animated.spring(animatedValue, {
                toValue: 0,
                friction: 8,
                tension: 10,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.spring(animatedValue, {
                toValue: 180,
                friction: 8,
                tension: 10,
                useNativeDriver: true,
            }).start();
        }
        setFlipped(!flipped);
    };

    const frontOpacity = animatedValue.interpolate({
        inputRange: [89, 90],
        outputRange: [1, 0],
    });
    const backOpacity = animatedValue.interpolate({
        inputRange: [89, 90],
        outputRange: [0, 1],
    });

    const frontZIndex = animatedValue.interpolate({
        inputRange: [89, 90],
        outputRange: [1, 0],
    });
    const backZIndex = animatedValue.interpolate({
        inputRange: [89, 90],
        outputRange: [0, 1],
    });

    const frontAnimatedStyle = {
        transform: [{ rotateY: frontInterpolate }],
        opacity: frontOpacity,
        zIndex: frontZIndex,
    };
    const backAnimatedStyle = {
        transform: [{ rotateY: backInterpolate }],
        opacity: backOpacity,
        zIndex: backZIndex,
    };

    const englishText = phrase.englishText || phrase.phrase || 'Phrase Unavailable';
    const spanishText = phrase.spanishText || phrase.translation || 'Translation pending...';

    return (
        <TouchableOpacity onPress={flipCard} activeOpacity={1} style={styles.flashcardContainer}>
            <View style={{ flex: 1 }}>
                <Animated.View
                    style={[styles.flashcard, styles.flashcardFront, frontAnimatedStyle]}
                    pointerEvents={flipped ? 'none' : 'auto'}
                >
                    <Text style={styles.flashcardLabel}>English</Text>
                    <View style={styles.flashcardTextWrapper}>
                        <Text style={styles.flashcardText}>{englishText}</Text>
                    </View>
                    <Text style={styles.flashcardHint}>Tap to flip 🔄</Text>
                </Animated.View>
                <Animated.View
                    style={[styles.flashcard, styles.flashcardBack, backAnimatedStyle]}
                    pointerEvents={flipped ? 'auto' : 'none'}
                >
                    <Text style={styles.flashcardLabelSpanish}>Spanish</Text>
                    <View style={styles.flashcardTextWrapper}>
                        <Text style={styles.flashcardTextSpanish}>{spanishText}</Text>
                    </View>
                    <TouchableOpacity style={styles.listenBtn} onPress={(e) => {
                        e.stopPropagation();
                        Alert.alert('Listen', 'Spanish audio guide playing...');
                    }}>
                        <Text style={styles.listenBtnText}>🔊 Listen</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },
    header: {
        padding: Theme.spacing.md,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        color: Theme.colors.textPrimary,
        fontSize: Theme.typography.sizes.xl,
        fontWeight: Theme.typography.weights.bold,
    },
    subtitle: {
        color: Theme.colors.textSecondary,
        fontSize: Theme.typography.sizes.md,
        marginTop: 2,
    },
    scoreBadge: {
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(99, 102, 241, 0.2)',
    },
    scoreText: {
        color: Theme.colors.primary,
        fontSize: 12,
        fontWeight: 'bold',
    },
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: Theme.colors.card,
        marginHorizontal: Theme.spacing.md,
        padding: 4,
        borderRadius: Theme.radius.md,
        marginBottom: Theme.spacing.md,
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    tab: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 6,
    },
    activeTab: {
        backgroundColor: Theme.colors.primary,
    },
    tabText: {
        color: Theme.colors.textSecondary,
        fontSize: 12,
        fontWeight: '600',
    },
    activeTabText: {
        color: Theme.colors.textPrimary,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabContent: {
        flex: 1,
        padding: Theme.spacing.md,
        alignItems: 'center',
    },
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        padding: Theme.spacing.md,
        paddingBottom: 40,
    },
    card: {
        backgroundColor: Theme.colors.card,
        borderRadius: Theme.radius.lg,
        padding: Theme.spacing.xl,
        marginTop: 20,
        borderWidth: 1,
        borderColor: Theme.colors.border,
        alignItems: 'center',
        width: '100%',
    },
    cardEmoji: {
        fontSize: 48,
        marginBottom: 16,
    },
    cardTitle: {
        color: Theme.colors.textPrimary,
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    cardDescription: {
        color: Theme.colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    primaryAction: {
        backgroundColor: Theme.colors.primary,
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: Theme.radius.md,
        width: '100%',
        alignItems: 'center',
    },
    primaryActionText: {
        color: Theme.colors.textPrimary,
        fontWeight: 'bold',
        fontSize: 16,
    },
    flashcardContainer: {
        height: 200,
        width: '100%',
        marginBottom: 20,
    },
    flashcard: {
        width: '100%',
        height: '100%',
        borderRadius: Theme.radius.lg,
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
        backfaceVisibility: 'hidden',
        borderWidth: 1,
        position: 'absolute',
        top: 0,
    },
    flashcardFront: {
        backgroundColor: '#1e293b', // Opaque Navy
        borderColor: Theme.colors.border,
    },
    flashcardBack: {
        backgroundColor: '#2d3748', // Slightly different opaque navy
        borderColor: Theme.colors.primary,
    },
    flashcardTextWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 10,
    },
    flashcardLabel: {
        position: 'absolute',
        top: 16,
        left: 20,
        fontSize: 10,
        fontWeight: 'bold',
        color: Theme.colors.textMuted,
        textTransform: 'uppercase',
    },
    flashcardLabelSpanish: {
        position: 'absolute',
        top: 16,
        left: 20,
        fontSize: 10,
        fontWeight: 'bold',
        color: Theme.colors.primary,
        textTransform: 'uppercase',
    },
    flashcardText: {
        color: Theme.colors.textPrimary,
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    flashcardTextSpanish: {
        color: Theme.colors.textPrimary,
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    flashcardHint: {
        position: 'absolute',
        bottom: 16,
        color: Theme.colors.textMuted,
        fontSize: 12,
    },
    listenBtn: {
        marginTop: 16,
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    listenBtnText: {
        color: Theme.colors.primary,
        fontWeight: '700',
        fontSize: 13,
    },
    emptyText: {
        color: Theme.colors.textMuted,
        textAlign: 'center',
        marginTop: 40,
    },
    mixerCard: {
        backgroundColor: Theme.colors.card,
        borderRadius: Theme.radius.lg,
        borderWidth: 1,
        borderColor: Theme.colors.border,
        width: '100%',
        overflow: 'hidden',
    },
    mixerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderBottomWidth: 1,
        borderBottomColor: Theme.colors.border,
    },
    mixerType: {
        color: Theme.colors.textMuted,
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    mixerProgress: {
        color: Theme.colors.primary,
        fontSize: 10,
        fontWeight: '800',
    },
    exerciseContent: {
        padding: 24,
        alignItems: 'center',
    },
    exerciseText: {
        color: Theme.colors.textPrimary,
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 26,
    },
    inputSection: {
        width: '100%',
    },
    exerciseInput: {
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        borderWidth: 1,
        borderColor: Theme.colors.border,
        borderRadius: Theme.radius.md,
        padding: 16,
        color: Theme.colors.textPrimary,
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 16,
    },
    verifyButton: {
        backgroundColor: Theme.colors.primary,
        padding: 14,
        borderRadius: Theme.radius.md,
        alignItems: 'center',
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    verifyButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    resultSection: {
        width: '100%',
    },
    resultBanner: {
        padding: 12,
        borderRadius: Theme.radius.md,
        alignItems: 'center',
        marginBottom: 16,
    },
    correctBanner: {
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
    },
    errorBanner: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
    },
    resultBannerText: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    revealBox: {
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        padding: 12,
        borderRadius: Theme.radius.md,
        marginBottom: 20,
    },
    revealLabel: {
        color: Theme.colors.textMuted,
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    revealValue: {
        color: Theme.colors.primary,
        fontSize: 16,
        fontWeight: 'bold',
    },
    nextButton: {
        backgroundColor: Theme.colors.secondary,
        padding: 14,
        borderRadius: Theme.radius.md,
        alignItems: 'center',
    },
    nextButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    optionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    optionBtn: {
        width: '48%',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderWidth: 1,
        borderColor: Theme.colors.border,
        borderRadius: Theme.radius.md,
        padding: 16,
        marginBottom: 12,
        alignItems: 'center',
    },
    optionSelected: {
        backgroundColor: Theme.colors.primary,
        borderColor: Theme.colors.primary,
    },
    optionBtnText: {
        color: Theme.colors.textPrimary,
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
    optionSelectedText: {
        color: '#fff',
    },
    pronunciationCard: {
        backgroundColor: Theme.colors.card,
        borderRadius: Theme.radius.lg,
        padding: 24,
        borderWidth: 1,
        borderColor: Theme.colors.border,
        alignItems: 'center',
    },
    accentLabel: {
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        color: Theme.colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
        marginBottom: 12,
    },
    accentTitle: {
        color: Theme.colors.textPrimary,
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 24,
        textAlign: 'center',
    },
    targetPhraseBox: {
        backgroundColor: 'rgba(0,0,0,0.2)',
        width: '100%',
        padding: 20,
        borderRadius: Theme.radius.md,
        alignItems: 'center',
        marginBottom: 30,
    },
    targetLabel: {
        color: Theme.colors.textMuted,
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
        marginBottom: 8,
    },
    targetText: {
        color: Theme.colors.textPrimary,
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 16,
    },
    guideBtn: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: Theme.colors.border,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    guideBtnText: {
        color: Theme.colors.textPrimary,
        fontSize: 12,
        fontWeight: '600',
    },
    controlsRow: {
        width: '100%',
        alignItems: 'center',
    },
    recordActionBtn: {
        backgroundColor: Theme.colors.accent,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 30,
        gap: 12,
    },
    stopBtn: {
        backgroundColor: Theme.colors.error,
    },
    recordDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#fff',
    },
    stopSquare: {
        width: 10,
        height: 10,
        backgroundColor: '#fff',
    },
    recordBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    analyzingBox: {
        alignItems: 'center',
        padding: 20,
    },
    analyzingText: {
        color: Theme.colors.textSecondary,
        marginTop: 12,
        fontWeight: '600',
    },
    pronunciationResults: {
        alignItems: 'center',
        width: '100%',
    },
    scoreCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: Theme.colors.accent,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(16, 185, 129, 0.05)',
        marginBottom: 20,
    },
    scoreBigText: {
        fontSize: 32,
        fontWeight: '900',
        color: Theme.colors.accent,
    },
    scoreUnit: {
        fontSize: 10,
        fontWeight: 'bold',
        color: Theme.colors.accent,
        textTransform: 'uppercase',
    },
    resultsMeta: {
        alignItems: 'center',
        marginBottom: 24,
    },
    resultsStatus: {
        color: Theme.colors.textPrimary,
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    metricRow: {
        flexDirection: 'row',
        gap: 20,
    },
    metricText: {
        color: Theme.colors.textSecondary,
        fontSize: 12,
        fontWeight: '600',
    },
    retryBtn: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: Theme.radius.md,
    },
    retryBtnText: {
        color: Theme.colors.textSecondary,
        fontWeight: 'bold',
    },
    selectorSection: {
        marginTop: 30,
    },
    selectorTitle: {
        color: Theme.colors.textPrimary,
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    phraseSelectorList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    phraseTag: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1,
        borderColor: Theme.colors.border,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        maxWidth: '100%',
    },
    activePhraseTag: {
        backgroundColor: Theme.colors.primary,
        borderColor: Theme.colors.primary,
    },
    phraseTagText: {
        color: Theme.colors.textSecondary,
        fontSize: 12,
        fontWeight: '600',
    },
    activePhraseTagText: {
        color: '#fff',
    },
});
