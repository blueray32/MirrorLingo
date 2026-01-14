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

  // Generate mixed exercises from phrases - SPANISH LEARNING focused
  const generateExercises = useCallback(() => {
    const mixedExercises: MixedExercise[] = [];

    phrases.forEach((phrase) => {
      const englishText = phrase.englishText;
      const spanishText = phrase.spanishText || '';

      // Skip phrases without Spanish translations
      if (!spanishText) return;

      const spanishWords = spanishText.split(' ');
      const englishWords = englishText.split(' ');

      // Type 1: Translation - Translate from English to Spanish
      if (spanishWords.length >= 2) {
        mixedExercises.push({
          id: `translate-${phrase.phraseId}`,
          type: 'fill_blank',
          originalPhrase: englishText,
          exercise: `Translate to Spanish: "${englishText}"`,
          answer: spanishText.toLowerCase().replace(/[.,!?¡¿]/g, ''),
          hint: `Starts with "${spanishWords[0]}"`,
          difficulty: spanishWords.length > 6 ? 'hard' : spanishWords.length > 3 ? 'medium' : 'easy'
        });
      }

      // Type 2: Spanish fill-in-the-blank - complete the Spanish sentence
      if (spanishWords.length >= 3) {
        const keyWordIndex = Math.floor(spanishWords.length / 2);
        const blankWord = spanishWords[keyWordIndex];
        const exerciseWords = [...spanishWords];
        exerciseWords[keyWordIndex] = '_____';

        mixedExercises.push({
          id: `fill-${phrase.phraseId}`,
          type: 'fill_blank',
          originalPhrase: englishText,
          exercise: `Complete the Spanish: ${exerciseWords.join(' ')}`,
          answer: blankWord.toLowerCase().replace(/[.,!?¡¿]/g, ''),
          hint: `English: "${englishText}"`,
          difficulty: spanishWords.length > 6 ? 'hard' : spanishWords.length > 4 ? 'medium' : 'easy'
        });
      }

      // Type 3: Spanish word reorder
      if (spanishWords.length >= 3 && spanishWords.length <= 8) {
        const shuffled = [...spanishWords].sort(() => Math.random() - 0.5);
        // Make sure it's actually shuffled
        if (shuffled.join(' ') !== spanishText) {
          mixedExercises.push({
            id: `reorder-${phrase.phraseId}`,
            type: 'reorder',
            originalPhrase: englishText,
            exercise: `Reorder to form: "${englishText}"\n${shuffled.join(' / ')}`,
            answer: spanishText.toLowerCase().replace(/[.,!?¡¿]/g, ''),
            hint: `First word: "${spanishWords[0]}"`,
            difficulty: spanishWords.length > 5 ? 'hard' : 'medium'
          });
        }
      }

      // Type 4: Vocabulary recall - Spanish to English (multiple choice)
      if (spanishWords.length <= 6) {
        // Create distractor options based on other phrases
        const otherEnglish = phrases
          .filter(p => p.phraseId !== phrase.phraseId && p.spanishText)
          .map(p => p.englishText)
          .slice(0, 3);

        if (otherEnglish.length >= 2) {
          const options = [englishText, ...otherEnglish].sort(() => Math.random() - 0.5);
          mixedExercises.push({
            id: `vocab-${phrase.phraseId}`,
            type: 'context',
            originalPhrase: englishText,
            exercise: `What does "${spanishText}" mean?`,
            answer: englishText.toLowerCase().replace(/[.,!?]/g, ''),
            hint: 'Think about the context',
            difficulty: 'easy',
            options: options
          });
        }
      }

      // Type 5: Spanish article/gender practice
      const spanishArticles = ['el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas'];
      const firstWord = spanishWords[0]?.toLowerCase();
      if (spanishArticles.includes(firstWord) && spanishWords.length >= 2) {
        const withoutArticle = spanishWords.slice(1).join(' ');
        mixedExercises.push({
          id: `article-${phrase.phraseId}`,
          type: 'fill_blank',
          originalPhrase: englishText,
          exercise: `Add the correct article: _____ ${withoutArticle}`,
          answer: firstWord,
          hint: 'el, la, un, or una?',
          difficulty: 'easy',
          options: ['el', 'la', 'un', 'una'].sort(() => Math.random() - 0.5)
        });
      }

      // Type 6: Common Spanish verb conjugation hints
      const verbEndings = ['ar', 'er', 'ir'];
      const verbMatch = spanishWords.find(w =>
        verbEndings.some(ending => w.toLowerCase().endsWith('o') || w.toLowerCase().endsWith('es') || w.toLowerCase().endsWith('e'))
      );
      if (verbMatch && spanishWords.length >= 3) {
        mixedExercises.push({
          id: `verb-${phrase.phraseId}`,
          type: 'transform',
          originalPhrase: englishText,
          exercise: `Identify the verb in: "${spanishText}"`,
          answer: verbMatch.toLowerCase().replace(/[.,!?¡¿]/g, ''),
          hint: 'Look for action words',
          difficulty: 'medium'
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

  const getDifficultyColorClass = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'accent-badge';
      case 'medium': return 'secondary-badge';
      case 'hard': return 'primary-badge';
      default: return '';
    }
  };

  if (isGenerating) {
    return (
      <div className="training-mixer">
        <div className="generating-state glass-card">
          <div className="themed-spinner"></div>
          <h3>Mixing your <span className="highlight">Training Deck</span></h3>
          <p>Generating personalized exercises based on your recordings...</p>
        </div>
        <style jsx>{styles}</style>
      </div>
    );
  }

  if (exercises.length === 0) {
    return (
      <div className="training-mixer">
        <div className="empty-state glass-card">
          <h3>Need more material</h3>
          <p>You haven't recorded enough phrases yet to generate a mixer.</p>
          <p className="hint">Try recording at least 3-5 phrases from the home page.</p>
        </div>
        <style jsx>{styles}</style>
      </div>
    );
  }

  const currentExercise = exercises[currentIndex];
  const isLastExercise = currentIndex === exercises.length - 1;

  return (
    <div className="training-mixer fade-in">
      <div className="mixer-card glass-card">
        <header className="card-header">
          <div className="progress-bar-container">
            <div className="progress-stats">
              <span>Exercise {currentIndex + 1} of {exercises.length}</span>
              <span className="accent-text">Score: {score.correct}/{score.total}</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${((currentIndex + 1) / exercises.length) * 100}%` }}></div>
            </div>
          </div>
          <div className="meta-badges">
            <span className="type-badge">{getExerciseTypeLabel(currentExercise.type)}</span>
            <span className={`badge ${getDifficultyColorClass(currentExercise.difficulty)}`}>
              {currentExercise.difficulty}
            </span>
          </div>
        </header>

        <div className="exercise-body">
          <div className="prompt-container">
            <p className="prompt-text">{currentExercise.exercise}</p>
          </div>

          {!showResult ? (
            <div className="input-section">
              {currentExercise.options ? (
                <div className="options-grid">
                  {currentExercise.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => setUserAnswer(option)}
                      className={`option-btn ${userAnswer === option ? 'selected' : ''}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="field-group">
                  <input
                    type="text"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && userAnswer.trim() && checkAnswer()}
                    placeholder="Type your answer here..."
                    className="styled-input"
                    autoFocus
                  />
                  {currentExercise.hint && (
                    <p className="hint-text">💡 Hint: {currentExercise.hint}</p>
                  )}
                </div>
              )}

              <button
                onClick={checkAnswer}
                disabled={!userAnswer.trim()}
                className="primary-btn submit-action"
              >
                Verify Answer
              </button>
            </div>
          ) : (
            <div className="result-view">
              <div className={`status-banner ${isCorrect ? 'is-correct' : 'is-error'}`}>
                {isCorrect ? (
                  <><span className="icon">✨</span> Perfect Match</>
                ) : (
                  <><span className="icon">🧗</span> Almost there</>
                )}
              </div>

              {!isCorrect && (
                <div className="reveal-box">
                  <span className="box-label">Correct answer:</span>
                  <div className="box-content highlighted">{currentExercise.answer}</div>
                </div>
              )}

              <div className="reveal-box secondary">
                <span className="box-label">Original phrase:</span>
                <div className="box-content">"{currentExercise.originalPhrase}"</div>
              </div>

              <button onClick={nextExercise} className="primary-btn next-action">
                {isLastExercise ? 'Finish Challenge' : 'Next Exercise'}
              </button>
            </div>
          )}
        </div>
      </div>

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
    max-width: 800px;
    margin: 0 auto;
  }

  .generating-state, .empty-state {
    text-align: center;
    padding: var(--space-xl);
  }

  .highlight {
    background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .themed-spinner {
    width: 50px;
    height: 50px;
    border: 3px solid var(--border-glass);
    border-top: 3px solid var(--primary);
    border-radius: 50%;
    animation: themed-spin 1s cubic-bezier(0.5, 0, 0.5, 1) infinite;
    margin: 0 auto var(--space-md);
  }

  @keyframes themed-spin {
    to { transform: rotate(360deg); }
  }

  .mixer-card {
    padding: 0 !important;
    overflow: hidden;
  }

  .card-header {
    background: rgba(255, 255, 255, 0.03);
    padding: var(--space-lg);
    border-bottom: 1px solid var(--border-glass);
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .progress-bar-container {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .progress-stats {
    display: flex;
    justify-content: space-between;
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--text-secondary);
  }

  .accent-text { color: var(--accent); }

  .progress-track {
    height: 6px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: var(--radius-full);
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%);
    border-radius: var(--radius-full);
    transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .meta-badges {
    display: flex;
    gap: var(--space-sm);
  }

  .type-badge {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--border-glass);
    padding: 0.2rem 0.6rem;
    border-radius: var(--radius-sm);
    font-size: 0.75rem;
    color: var(--text-secondary);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .badge {
      padding: 0.2rem 0.6rem;
      border-radius: var(--radius-sm);
      font-size: 0.75rem;
      font-weight: 800;
      text-transform: uppercase;
  }

  .primary-badge { 
      background: rgba(99, 102, 241, 0.15); 
      color: var(--primary);
  }
  .secondary-badge { 
      background: rgba(236, 72, 153, 0.15); 
      color: var(--secondary);
  }
  .accent-badge { 
      background: rgba(16, 185, 129, 0.15); 
      color: var(--accent);
  }

  .exercise-body {
    padding: var(--space-xl) var(--space-lg);
  }

  .prompt-container {
    background: rgba(255, 255, 255, 0.03);
    padding: var(--space-xl);
    border-radius: var(--radius-md);
    border-left: 4px solid var(--primary);
    margin-bottom: var(--space-xl);
    text-align: center;
  }

  .prompt-text {
    font-size: 1.4rem;
    color: var(--text-primary);
    font-weight: 500;
    line-height: 1.4;
  }

  .options-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-md);
    margin-bottom: var(--space-xl);
  }

  .option-btn {
    padding: var(--space-lg);
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid var(--border-glass);
    border-radius: var(--radius-md);
    color: var(--text-primary);
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .option-btn:hover {
    background: rgba(255, 255, 255, 0.08);
    transform: translateY(-2px);
    border-color: var(--primary);
  }

  .option-btn.selected {
    background: var(--primary);
    color: white;
    border-color: var(--primary);
    box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
  }

  .field-group {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: var(--space-xl);
  }

  .styled-input {
    width: 100%;
    background: rgba(0, 0, 0, 0.2);
    border: 2px solid var(--border-glass);
    border-radius: var(--radius-md);
    padding: var(--space-lg);
    color: var(--text-primary);
    font-size: 1.2rem;
    text-align: center;
    transition: all var(--transition-fast);
  }

  .styled-input:focus {
    outline: none;
    border-color: var(--primary);
    background: rgba(0, 0, 0, 0.3);
    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
  }

  .hint-text {
    font-size: 0.85rem;
    color: var(--text-secondary);
    opacity: 0.7;
    font-style: italic;
  }

  .submit-action, .next-action {
    width: 100%;
    padding: 1rem;
    font-size: 1.1rem;
  }

  .result-view {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
    animation: resultEnter 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @keyframes resultEnter {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }

  .status-banner {
    padding: var(--space-md);
    border-radius: var(--radius-md);
    font-weight: 800;
    font-size: 1.2rem;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .is-correct { background: rgba(16, 185, 129, 0.1); color: var(--accent); }
  .is-error { background: rgba(239, 68, 68, 0.1); color: var(--danger); }

  .reveal-box {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid var(--border-glass);
    border-radius: var(--radius-md);
    padding: var(--space-md);
    text-align: left;
  }

  .box-label {
    display: block;
    font-size: 0.75rem;
    color: var(--text-secondary);
    text-transform: uppercase;
    font-weight: 800;
    margin-bottom: 0.4rem;
  }

  .box-content {
      font-size: 1.1rem;
      color: var(--text-primary);
      font-weight: 600;
  }

  .box-content.highlighted {
      color: var(--primary);
      font-weight: 800;
  }

  @media (max-width: 600px) {
    .options-grid { grid-template-columns: 1fr; }
    .prompt-text { font-size: 1.1rem; }
  }
`;
