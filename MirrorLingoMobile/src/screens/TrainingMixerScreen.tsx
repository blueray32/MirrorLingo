import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';

type TrainingMixerScreenRouteProp = RouteProp<RootStackParamList, 'TrainingMixer'>;
type TrainingMixerScreenNavigationProp = StackNavigationProp<RootStackParamList, 'TrainingMixer'>;

interface Props {
  route: TrainingMixerScreenRouteProp;
  navigation: TrainingMixerScreenNavigationProp;
}

interface Exercise {
  id: string;
  type: 'fill-blank' | 'reorder' | 'formality' | 'context' | 'synonym' | 'antonym' | 'pronunciation';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  hint?: string;
  originalPhrase?: string;
}

// Levenshtein distance for fuzzy matching
const levenshteinDistance = (str1: string, str2: string): number => {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]) + 1;
      }
    }
  }

  return dp[m][n];
};

// Synonym and antonym maps for exercises
const SYNONYM_MAP: Record<string, string[]> = {
  'good': ['great', 'excellent', 'wonderful', 'fantastic'],
  'bad': ['terrible', 'awful', 'horrible', 'poor'],
  'big': ['large', 'huge', 'enormous', 'massive'],
  'small': ['tiny', 'little', 'miniature', 'compact'],
  'happy': ['joyful', 'cheerful', 'delighted', 'pleased'],
  'sad': ['unhappy', 'depressed', 'miserable', 'gloomy'],
  'fast': ['quick', 'rapid', 'speedy', 'swift'],
  'slow': ['sluggish', 'gradual', 'leisurely', 'delayed'],
  'nice': ['pleasant', 'lovely', 'delightful', 'kind'],
  'hard': ['difficult', 'tough', 'challenging', 'demanding'],
};

const ANTONYM_MAP: Record<string, string> = {
  'good': 'bad',
  'happy': 'sad',
  'big': 'small',
  'fast': 'slow',
  'hot': 'cold',
  'light': 'dark',
  'up': 'down',
  'in': 'out',
  'easy': 'hard',
  'new': 'old',
};

export const TrainingMixerScreen: React.FC<Props> = ({ route, navigation }) => {
  const { phrases, profile } = route.params;
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    generateExercises();
  }, []);

  const generateExercises = () => {
    setIsLoading(true);

    const generatedExercises: Exercise[] = [];

    phrases.forEach((phrase: any, index: number) => {
      const text = phrase.englishText;
      const words = text.split(' ');

      // Type 1: Fill-in-the-blank exercise
      if (words.length >= 3) {
        const keyWordIndex = Math.floor(words.length / 2);
        const blankWord = words[keyWordIndex];
        generatedExercises.push({
          id: `fill-${index}`,
          type: 'fill-blank',
          question: createFillBlankQuestion(phrase.englishText),
          correctAnswer: extractMissingWord(phrase.englishText),
          explanation: `The missing word completes the phrase in your typical speaking style.`,
          difficulty: 'easy',
          hint: `Starts with "${blankWord[0]}"`,
          originalPhrase: text,
        });
      }

      // Type 2: Word reorder exercise
      if (words.length >= 4 && words.length <= 10) {
        generatedExercises.push({
          id: `reorder-${index}`,
          type: 'reorder',
          question: `Reorder these words to match your speaking style:`,
          options: shuffleWords(phrase.englishText),
          correctAnswer: phrase.englishText,
          explanation: `This matches your natural word order and phrasing patterns.`,
          difficulty: 'medium',
          hint: `First word: "${words[0]}"`,
          originalPhrase: text,
        });
      }

      // Type 3: Formality transformation
      const hasContraction = /\b(I'm|you're|can't|won't|don't|isn't|aren't)\b/i.test(text);
      if (hasContraction || profile?.tone === 'casual') {
        generatedExercises.push({
          id: `formality-${index}`,
          type: 'formality',
          question: `Make this more formal: "${phrase.englishText}"`,
          correctAnswer: makeFormal(phrase.englishText),
          explanation: `This transforms your casual style into a more formal register.`,
          difficulty: 'hard',
          hint: 'Expand the contractions',
          originalPhrase: text,
        });
      }

      // Type 4: Context completion
      if (words.length >= 5) {
        const partialPhrase = words.slice(0, Math.ceil(words.length / 2)).join(' ');
        generatedExercises.push({
          id: `context-${index}`,
          type: 'context',
          question: `Complete this phrase: "${partialPhrase}..."`,
          correctAnswer: words.slice(Math.ceil(words.length / 2)).join(' ').toLowerCase().replace(/[.,!?]/g, ''),
          explanation: `This tests your recall of natural phrase patterns.`,
          difficulty: 'hard',
          hint: `About ${words.length - Math.ceil(words.length / 2)} words remaining`,
          originalPhrase: text,
        });
      }

      // Type 5: Synonym replacement
      for (const [word, synonyms] of Object.entries(SYNONYM_MAP)) {
        if (text.toLowerCase().includes(word)) {
          const synonym = synonyms[Math.floor(Math.random() * synonyms.length)];
          const otherSynonyms = synonyms.filter(s => s !== synonym).slice(0, 2);
          generatedExercises.push({
            id: `synonym-${index}-${word}`,
            type: 'synonym',
            question: `Replace "${word}" with a synonym in: "${text}"`,
            correctAnswer: synonym,
            explanation: `"${synonym}" is a synonym for "${word}" that maintains your speaking style.`,
            difficulty: 'medium',
            hint: `Think of another word for "${word}"`,
            options: [synonym, ...otherSynonyms, word].sort(() => Math.random() - 0.5),
            originalPhrase: text,
          });
          break;
        }
      }

      // Type 6: Antonym challenge
      for (const [word, antonym] of Object.entries(ANTONYM_MAP)) {
        if (text.toLowerCase().includes(word)) {
          generatedExercises.push({
            id: `antonym-${index}-${word}`,
            type: 'antonym',
            question: `What's the opposite of "${word}" in: "${text}"?`,
            correctAnswer: antonym,
            explanation: `"${antonym}" is the opposite of "${word}".`,
            difficulty: 'easy',
            hint: 'Think of the opposite meaning',
            options: [antonym, word, 'maybe', 'never'].sort(() => Math.random() - 0.5),
            originalPhrase: text,
          });
          break;
        }
      }

      // Type 7: Pronunciation practice
      const multisyllableWords = words.filter(w => w.length > 6);
      if (multisyllableWords.length > 0) {
        const targetWord = multisyllableWords[0].replace(/[.,!?]/g, '');
        generatedExercises.push({
          id: `pronunciation-${index}`,
          type: 'pronunciation',
          question: `Which syllable is stressed in "${targetWord}"?`,
          correctAnswer: '1st syllable',
          explanation: `In English, "${targetWord}" typically has stress on the first syllable.`,
          difficulty: 'hard',
          hint: 'Listen to how you naturally say this word',
          options: ['1st syllable', '2nd syllable', '3rd syllable', 'Last syllable'],
          originalPhrase: text,
        });
      }
    });

    // Shuffle and limit exercises
    const shuffledExercises = generatedExercises
      .sort(() => Math.random() - 0.5)
      .slice(0, 10);

    setExercises(shuffledExercises);
    setIsLoading(false);
  };

  const createFillBlankQuestion = (phrase: string): string => {
    const words = phrase.split(' ');
    const randomIndex = Math.floor(Math.random() * words.length);
    const modifiedWords = [...words];
    modifiedWords[randomIndex] = '____';
    return modifiedWords.join(' ');
  };

  const extractMissingWord = (phrase: string): string => {
    const words = phrase.split(' ');
    const randomIndex = Math.floor(Math.random() * words.length);
    return words[randomIndex].toLowerCase().replace(/[.,!?]/g, '');
  };

  const shuffleWords = (phrase: string): string[] => {
    const words = phrase.split(' ');
    return words.sort(() => Math.random() - 0.5);
  };

  const makeFormal = (phrase: string): string => {
    return phrase
      .replace(/don't/g, 'do not')
      .replace(/can't/g, 'cannot')
      .replace(/won't/g, 'will not')
      .replace(/I'll/g, 'I will')
      .replace(/you're/g, 'you are')
      .replace(/it's/g, 'it is');
  };

  const checkAnswer = () => {
    const exercise = exercises[currentExercise];
    let answer: string;
    let correctAnswer = exercise.correctAnswer.toLowerCase().trim();

    // Handle different exercise types
    if (exercise.type === 'reorder') {
      answer = selectedOption?.toLowerCase().trim() || '';
    } else if (exercise.options && exercise.options.length > 0) {
      // Multiple choice exercises (synonym, antonym, pronunciation)
      answer = selectedOption?.toLowerCase().trim() || '';
    } else {
      answer = userAnswer.trim().toLowerCase().replace(/[.,!?]/g, '');
      correctAnswer = correctAnswer.replace(/[.,!?]/g, '');
    }

    // Check for exact match or fuzzy match (allow small typos for text input)
    const isExactMatch = answer === correctAnswer;
    const isFuzzyMatch = !exercise.options && levenshteinDistance(answer, correctAnswer) <= 2;
    const correct = isExactMatch || isFuzzyMatch;

    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      setScore(prev => prev + 1);
    }
  };

  const nextExercise = () => {
    if (currentExercise < exercises.length - 1) {
      setCurrentExercise(prev => prev + 1);
      setUserAnswer('');
      setSelectedOption(null);
      setShowResult(false);
    } else {
      // Show final results
      Alert.alert(
        'Training Complete!',
        `You scored ${score} out of ${exercises.length}`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }
  };

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'easy': return '#48bb78';
      case 'medium': return '#ed8936';
      case 'hard': return '#e53e3e';
      default: return '#718096';
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Generating personalized exercises...</Text>
      </View>
    );
  }

  if (exercises.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No exercises available</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const exercise = exercises[currentExercise];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Exercise {currentExercise + 1} of {exercises.length}
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { width: `${((currentExercise + 1) / exercises.length) * 100}%` }
              ]} 
            />
          </View>
        </View>
        
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>Score: {score}/{exercises.length}</Text>
          <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(exercise.difficulty) }]}>
            <Text style={styles.difficultyText}>{exercise.difficulty.toUpperCase()}</Text>
          </View>
        </View>
      </View>

      <View style={styles.exerciseContainer}>
        <Text style={styles.exerciseType}>
          {exercise.type === 'fill-blank' && '📝 Fill in the Blank'}
          {exercise.type === 'reorder' && '🔄 Word Reorder'}
          {exercise.type === 'formality' && '🎩 Formality Transform'}
          {exercise.type === 'context' && '💭 Context Completion'}
          {exercise.type === 'synonym' && '🔤 Synonym Challenge'}
          {exercise.type === 'antonym' && '↔️ Antonym Challenge'}
          {exercise.type === 'pronunciation' && '🎤 Pronunciation Practice'}
        </Text>

        <Text style={styles.question}>{exercise.question}</Text>

        {/* Show hint if available and result not shown */}
        {exercise.hint && !showResult && (
          <View style={styles.hintContainer}>
            <Text style={styles.hintText}>💡 Hint: {exercise.hint}</Text>
          </View>
        )}

        {/* Multiple choice for reorder, synonym, antonym, pronunciation */}
        {exercise.options && exercise.options.length > 0 ? (
          <View style={styles.optionsContainer}>
            {exercise.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  selectedOption === option && styles.selectedOption,
                ]}
                onPress={() => setSelectedOption(option)}
              >
                <Text style={[
                  styles.optionText,
                  selectedOption === option && styles.selectedOptionText,
                ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <TextInput
            style={styles.answerInput}
            value={userAnswer}
            onChangeText={setUserAnswer}
            placeholder="Type your answer here..."
            multiline
          />
        )}

        {showResult && (
          <View style={[styles.resultContainer, isCorrect ? styles.correctResult : styles.incorrectResult]}>
            <Text style={styles.resultText}>
              {isCorrect ? '✅ Correct!' : '❌ Not quite'}
            </Text>
            {!isCorrect && (
              <Text style={styles.correctAnswer}>
                Correct answer: {exercise.correctAnswer}
              </Text>
            )}
            <Text style={styles.explanation}>{exercise.explanation}</Text>
            {exercise.originalPhrase && (
              <View style={styles.originalPhraseContainer}>
                <Text style={styles.originalPhraseLabel}>Original phrase:</Text>
                <Text style={styles.originalPhraseText}>"{exercise.originalPhrase}"</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.actionButtons}>
          {!showResult ? (
            <TouchableOpacity
              style={[
                styles.checkButton,
                (!userAnswer.trim() && !selectedOption) && styles.disabledButton,
              ]}
              onPress={checkAnswer}
              disabled={!userAnswer.trim() && !selectedOption}
            >
              <Text style={styles.checkButtonText}>Check Answer</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.nextButton} onPress={nextExercise}>
              <Text style={styles.nextButtonText}>
                {currentExercise < exercises.length - 1 ? 'Next Exercise' : 'Finish Training'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#718096',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#667eea',
    padding: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#667eea',
    borderRadius: 4,
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4a5568',
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  exerciseContainer: {
    padding: 20,
  },
  exerciseType: {
    fontSize: 18,
    fontWeight: '600',
    color: '#667eea',
    marginBottom: 16,
  },
  question: {
    fontSize: 20,
    color: '#2d3748',
    marginBottom: 24,
    lineHeight: 28,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  optionButton: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  selectedOption: {
    borderColor: '#667eea',
    backgroundColor: '#edf2f7',
  },
  optionText: {
    fontSize: 16,
    color: '#4a5568',
  },
  selectedOptionText: {
    color: '#667eea',
    fontWeight: '600',
  },
  answerInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 24,
    minHeight: 60,
  },
  resultContainer: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  correctResult: {
    backgroundColor: '#f0fff4',
    borderColor: '#48bb78',
    borderWidth: 1,
  },
  incorrectResult: {
    backgroundColor: '#fef5e7',
    borderColor: '#ed8936',
    borderWidth: 1,
  },
  resultText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  correctAnswer: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2d3748',
    marginBottom: 8,
  },
  explanation: {
    fontSize: 14,
    color: '#718096',
    lineHeight: 20,
  },
  hintContainer: {
    backgroundColor: '#f0f9ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#4299e1',
  },
  hintText: {
    fontSize: 14,
    color: '#2b6cb0',
    fontStyle: 'italic',
  },
  originalPhraseContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  originalPhraseLabel: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 4,
  },
  originalPhraseText: {
    fontSize: 14,
    color: '#4a5568',
    fontStyle: 'italic',
  },
  actionButtons: {
    alignItems: 'center',
  },
  checkButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#a0aec0',
  },
  checkButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#48bb78',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
