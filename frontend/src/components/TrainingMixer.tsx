import React, { useState, useEffect, useCallback } from 'react';
import { Phrase, IdiolectProfile } from '../types/phrases';

interface TrainingMixerProps {
  phrases: Phrase[];
  profile: IdiolectProfile;
  onComplete?: () => void;
}

interface MixedExercise {
  id: string;
  type: 'fill_blank' | 'reorder' | 'transform' | 'context' | 'synonym' | 'antonym' | 'pronunciation';
  originalPhrase: string;
  exercise: string;
  answer: string;
  hint?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  options?: string[]; // For multiple choice exercises
}

export const TrainingMixer: React.FC<TrainingMixerProps> = ({
  phrases,
  profile,
  onComplete
}) => {
  const [exercises, setExercises] = useState<MixedExercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [isGenerating, setIsGenerating] = useState(true);

  // Generate mixed exercises from phrases
  const generateExercises = useCallback(() => {
    const mixedExercises: MixedExercise[] = [];

    phrases.forEach((phrase, idx) => {
      const text = phrase.englishText;
      const words = text.split(' ');

      // Type 1: Fill in the blank - remove a key word
      if (words.length >= 3) {
        const keyWordIndex = Math.floor(words.length / 2);
        const blankWord = words[keyWordIndex];
        const exerciseWords = [...words];
        exerciseWords[keyWordIndex] = '_____';

        mixedExercises.push({
          id: `fill-${phrase.phraseId}`,
          type: 'fill_blank',
          originalPhrase: text,
          exercise: exerciseWords.join(' '),
          answer: blankWord.toLowerCase().replace(/[.,!?]/g, ''),
          hint: `Starts with "${blankWord[0]}"`,
          difficulty: words.length > 8 ? 'hard' : words.length > 5 ? 'medium' : 'easy'
        });
      }

      // Type 2: Word reorder - scramble the words
      if (words.length >= 4 && words.length <= 10) {
        const shuffled = [...words].sort(() => Math.random() - 0.5);
        // Make sure it's actually shuffled
        if (shuffled.join(' ') !== text) {
          mixedExercises.push({
            id: `reorder-${phrase.phraseId}`,
            type: 'reorder',
            originalPhrase: text,
            exercise: shuffled.join(' / '),
            answer: text.toLowerCase().replace(/[.,!?]/g, ''),
            hint: `First word: "${words[0]}"`,
            difficulty: words.length > 7 ? 'hard' : 'medium'
          });
        }
      }

      // Type 3: Transform - change tense/formality based on profile
      const isQuestion = text.includes('?');
      const hasContraction = /\b(I'm|you're|can't|won't|don't)\b/i.test(text);

      if (hasContraction) {
        // Expand contractions
        const expanded = text
          .replace(/I'm/gi, 'I am')
          .replace(/you're/gi, 'you are')
          .replace(/can't/gi, 'cannot')
          .replace(/won't/gi, 'will not')
          .replace(/don't/gi, 'do not')
          .replace(/isn't/gi, 'is not')
          .replace(/aren't/gi, 'are not');

        mixedExercises.push({
          id: `transform-${phrase.phraseId}`,
          type: 'transform',
          originalPhrase: text,
          exercise: `Make this more formal: "${text}"`,
          answer: expanded.toLowerCase().replace(/[.,!?]/g, ''),
          hint: 'Expand the contractions',
          difficulty: 'easy'
        });
      }

      // Type 4: Context completion - complete a phrase in context
      if (phrase.intent && words.length >= 5) {
        const partialPhrase = words.slice(0, Math.ceil(words.length / 2)).join(' ');
        mixedExercises.push({
          id: `context-${phrase.phraseId}`,
          type: 'context',
          originalPhrase: text,
          exercise: `Complete this ${phrase.intent} phrase: "${partialPhrase}..."`,
          answer: words.slice(Math.ceil(words.length / 2)).join(' ').toLowerCase().replace(/[.,!?]/g, ''),
          hint: `About ${phrase.intent}`,
          difficulty: 'hard'
        });
      }

      // Type 5: Synonym replacement - replace a word with its synonym
      const synonymMap: Record<string, string[]> = {
        'good': ['great', 'excellent', 'wonderful', 'fantastic'],
        'bad': ['terrible', 'awful', 'horrible', 'poor'],
        'big': ['large', 'huge', 'enormous', 'massive'],
        'small': ['tiny', 'little', 'miniature', 'compact'],
        'happy': ['joyful', 'cheerful', 'delighted', 'pleased'],
        'sad': ['unhappy', 'depressed', 'miserable', 'gloomy'],
        'fast': ['quick', 'rapid', 'speedy', 'swift'],
        'slow': ['sluggish', 'gradual', 'leisurely', 'delayed']
      };

      for (const [word, synonyms] of Object.entries(synonymMap)) {
        if (text.toLowerCase().includes(word)) {
          const synonym = synonyms[Math.floor(Math.random() * synonyms.length)];
          mixedExercises.push({
            id: `synonym-${phrase.phraseId}-${word}`,
            type: 'synonym',
            originalPhrase: text,
            exercise: `Replace "${word}" with a synonym: "${text}"`,
            answer: text.toLowerCase().replace(new RegExp(word, 'gi'), synonym),
            hint: `Think of another word for "${word}"`,
            difficulty: 'medium',
            options: [synonym, ...synonyms.filter(s => s !== synonym).slice(0, 2), word]
          });
          break;
        }
      }

      // Type 6: Antonym challenge - find the opposite meaning
      const antonymMap: Record<string, string> = {
        'good': 'bad',
        'happy': 'sad',
        'big': 'small',
        'fast': 'slow',
        'hot': 'cold',
        'light': 'dark',
        'up': 'down',
        'in': 'out'
      };

      for (const [word, antonym] of Object.entries(antonymMap)) {
        if (text.toLowerCase().includes(word)) {
          mixedExercises.push({
            id: `antonym-${phrase.phraseId}-${word}`,
            type: 'antonym',
            originalPhrase: text,
            exercise: `What's the opposite of "${word}" in: "${text}"?`,
            answer: antonym,
            hint: `Think of the opposite meaning`,
            difficulty: 'easy',
            options: [antonym, word, 'maybe', 'never'].sort(() => Math.random() - 0.5)
          });
          break;
        }
      }

      // Type 7: Pronunciation practice - identify stressed syllables
      const multisyllableWords = words.filter(w => w.length > 6);
      if (multisyllableWords.length > 0) {
        const targetWord = multisyllableWords[0];
        mixedExercises.push({
          id: `pronunciation-${phrase.phraseId}`,
          type: 'pronunciation',
          originalPhrase: text,
          exercise: `Which syllable is stressed in "${targetWord}"?`,
          answer: '1', // Simplified - first syllable
          hint: 'Listen to how you naturally say this word',
          difficulty: 'hard',
          options: ['1st syllable', '2nd syllable', '3rd syllable', 'Last syllable']
        });
      }
    });

    // Shuffle and limit exercises
    const shuffled = mixedExercises.sort(() => Math.random() - 0.5).slice(0, 10);
    setExercises(shuffled);
    setIsGenerating(false);
  }, [phrases]);

  useEffect(() => {
    generateExercises();
  }, [generateExercises]);

  const checkAnswer = () => {
    const normalizedUserAnswer = userAnswer.toLowerCase().trim().replace(/[.,!?]/g, '');
    const normalizedCorrectAnswer = exercises[currentIndex].answer;

    // Check for exact match or close match (allow small typos)
    const isMatch = normalizedUserAnswer === normalizedCorrectAnswer ||
      levenshteinDistance(normalizedUserAnswer, normalizedCorrectAnswer) <= 2;

    setIsCorrect(isMatch);
    setShowResult(true);
    setScore(prev => ({
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
      // Session complete
      if (onComplete) {
        onComplete();
      }
    }
  };

  const getExerciseTypeLabel = (type: MixedExercise['type']) => {
    switch (type) {
      case 'fill_blank': return 'Fill in the Blank';
      case 'reorder': return 'Word Reorder';
      case 'transform': return 'Transform';
      case 'context': return 'Complete the Phrase';
      case 'synonym': return 'Synonym Challenge';
      case 'antonym': return 'Antonym Challenge';
      case 'pronunciation': return 'Pronunciation Practice';
      default: return 'Exercise';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#38a169';
      case 'medium': return '#dd6b20';
      case 'hard': return '#e53e3e';
      default: return '#718096';
    }
  };

  if (isGenerating) {
    return (
      <div className="training-mixer">
        <div className="generating">
          <div className="spinner"></div>
          <h3>Mixing Your Training Material...</h3>
          <p>Creating personalized exercises based on your phrases</p>
        </div>
        <style jsx>{styles}</style>
      </div>
    );
  }

  if (exercises.length === 0) {
    return (
      <div className="training-mixer">
        <div className="no-exercises">
          <h3>Not Enough Material</h3>
          <p>Add more phrases to generate mixed training exercises.</p>
        </div>
        <style jsx>{styles}</style>
      </div>
    );
  }

  const currentExercise = exercises[currentIndex];
  const isLastExercise = currentIndex === exercises.length - 1;

  return (
    <div className="training-mixer">
      <div className="mixer-header">
        <div className="progress-info">
          <span className="exercise-count">{currentIndex + 1} of {exercises.length}</span>
          <span className="score">Score: {score.correct}/{score.total}</span>
        </div>
        <div className="exercise-meta">
          <span className="exercise-type">{getExerciseTypeLabel(currentExercise.type)}</span>
          <span
            className="difficulty"
            style={{ color: getDifficultyColor(currentExercise.difficulty) }}
          >
            {currentExercise.difficulty}
          </span>
        </div>
      </div>

      <div className="exercise-card">
        <div className="exercise-prompt">
          <p>{currentExercise.exercise}</p>
        </div>

        {!showResult ? (
          <div className="answer-section">
            {currentExercise.options ? (
              <div className="multiple-choice">
                {currentExercise.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => setUserAnswer(option)}
                    className={`choice-btn ${userAnswer === option ? 'selected' : ''}`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            ) : (
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && userAnswer.trim() && checkAnswer()}
                placeholder="Type your answer..."
                className="answer-input"
                autoFocus
              />
            )}
            {currentExercise.hint && (
              <p className="hint">Hint: {currentExercise.hint}</p>
            )}
            <button
              onClick={checkAnswer}
              disabled={!userAnswer.trim()}
              className="submit-btn"
            >
              Check Answer
            </button>
          </div>
        ) : (
          <div className="result-section">
            <div className={`result ${isCorrect ? 'correct' : 'incorrect'}`}>
              {isCorrect ? (
                <>
                  <span className="result-icon">✓</span>
                  <span>Correct!</span>
                </>
              ) : (
                <>
                  <span className="result-icon">✗</span>
                  <span>Not quite</span>
                </>
              )}
            </div>

            {!isCorrect && (
              <div className="correct-answer">
                <p>Correct answer:</p>
                <strong>{currentExercise.answer}</strong>
              </div>
            )}

            <div className="original-phrase">
              <p>Original phrase:</p>
              <em>"{currentExercise.originalPhrase}"</em>
            </div>

            <button onClick={nextExercise} className="next-btn">
              {isLastExercise ? 'Finish' : 'Next Exercise'}
            </button>
          </div>
        )}
      </div>

      {/* Session Complete Modal */}
      {showResult && isLastExercise && (
        <div className="completion-summary">
          <h3>Training Complete!</h3>
          <div className="final-score">
            <span className="score-number">{score.correct}</span>
            <span className="score-divider">/</span>
            <span className="score-total">{score.total}</span>
          </div>
          <p className="score-message">
            {score.correct === score.total ? 'Perfect score!' :
              score.correct >= score.total * 0.7 ? 'Great job!' :
                'Keep practicing!'}
          </p>
        </div>
      )}

      <style jsx>{styles}</style>
    </div>
  );
};

// Levenshtein distance for fuzzy matching
export function levenshteinDistance(str1: string, str2: string): number {
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
}

const styles = `
  .training-mixer {
    max-width: 600px;
    margin: 0 auto;
    padding: 2rem;
  }

  .generating, .no-exercises {
    text-align: center;
    padding: 3rem;
    background: white;
    border-radius: 1rem;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #e2e8f0;
    border-top-color: #4299e1;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .mixer-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: #f8fafc;
    border-radius: 0.75rem;
  }

  .progress-info {
    display: flex;
    gap: 1.5rem;
  }

  .exercise-count {
    font-weight: 600;
    color: #4299e1;
  }

  .score {
    color: #718096;
  }

  .exercise-meta {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .exercise-type {
    background: #e2e8f0;
    padding: 0.25rem 0.75rem;
    border-radius: 1rem;
    font-size: 0.85rem;
    color: #4a5568;
  }

  .difficulty {
    font-weight: 600;
    font-size: 0.85rem;
    text-transform: uppercase;
  }

  .exercise-card {
    background: white;
    border-radius: 1rem;
    padding: 2rem;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  }

  .exercise-prompt {
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: #f0f9ff;
    border-radius: 0.75rem;
    border-left: 4px solid #4299e1;
  }

  .exercise-prompt p {
    color: #2d3748;
    font-size: 1.2rem;
    line-height: 1.5;
    margin: 0;
  }

  .multiple-choice {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .choice-btn {
    padding: 1rem;
    border: 2px solid #e2e8f0;
    border-radius: 0.75rem;
    background: white;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 1rem;
    text-align: center;
  }

  .choice-btn:hover {
    border-color: #4299e1;
    background: #f0f9ff;
  }

  .choice-btn.selected {
    border-color: #4299e1;
    background: #4299e1;
    color: white;
  }

  .answer-input {
    width: 100%;
    padding: 1rem;
    font-size: 1.1rem;
    border: 2px solid #e2e8f0;
    border-radius: 0.75rem;
    margin-bottom: 1rem;
    transition: border-color 0.2s;
  }

  .answer-input:focus {
    outline: none;
    border-color: #4299e1;
  }

  .hint {
    color: #718096;
    font-size: 0.9rem;
    font-style: italic;
    margin-bottom: 1rem;
  }

  .submit-btn, .next-btn {
    width: 100%;
    padding: 1rem;
    font-size: 1rem;
    font-weight: 600;
    border: none;
    border-radius: 0.75rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .submit-btn {
    background: linear-gradient(135deg, #4299e1, #3182ce);
    color: white;
  }

  .submit-btn:disabled {
    background: #a0aec0;
    cursor: not-allowed;
  }

  .submit-btn:not(:disabled):hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(66, 153, 225, 0.4);
  }

  .next-btn {
    background: linear-gradient(135deg, #48bb78, #38a169);
    color: white;
    margin-top: 1.5rem;
  }

  .next-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(72, 187, 120, 0.4);
  }

  .result-section {
    text-align: center;
  }

  .result {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 1rem;
    border-radius: 0.75rem;
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
  }

  .result.correct {
    background: #c6f6d5;
    color: #22543d;
  }

  .result.incorrect {
    background: #fed7d7;
    color: #742a2a;
  }

  .result-icon {
    font-size: 1.5rem;
  }

  .correct-answer {
    background: #fef5e7;
    padding: 1rem;
    border-radius: 0.5rem;
    margin-bottom: 1rem;
  }

  .correct-answer p {
    color: #744210;
    font-size: 0.9rem;
    margin-bottom: 0.25rem;
  }

  .correct-answer strong {
    color: #744210;
    font-size: 1.1rem;
  }

  .original-phrase {
    background: #f8fafc;
    padding: 1rem;
    border-radius: 0.5rem;
  }

  .original-phrase p {
    color: #718096;
    font-size: 0.85rem;
    margin-bottom: 0.25rem;
  }

  .original-phrase em {
    color: #4a5568;
    font-size: 1rem;
  }

  .completion-summary {
    margin-top: 2rem;
    padding: 2rem;
    background: linear-gradient(135deg, #667eea, #764ba2);
    border-radius: 1rem;
    text-align: center;
    color: white;
  }

  .completion-summary h3 {
    margin-bottom: 1rem;
  }

  .final-score {
    font-size: 3rem;
    font-weight: 700;
    margin-bottom: 1rem;
  }

  .score-divider {
    margin: 0 0.25rem;
    opacity: 0.7;
  }

  .score-total {
    opacity: 0.7;
  }

  .score-message {
    font-size: 1.2rem;
    opacity: 0.9;
  }

  @media (max-width: 768px) {
    .training-mixer {
      padding: 1rem;
    }

    .mixer-header {
      flex-direction: column;
      gap: 0.75rem;
    }

    .exercise-prompt p {
      font-size: 1rem;
    }
  }
`;
