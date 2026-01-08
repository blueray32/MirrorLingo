import React, { useState, useEffect } from 'react'
import { SpacedRepetitionScheduler, ReviewItem, PerformanceRating } from '../utils/spacedRepetition'
import { Phrase, IdiolectProfile } from '../types/phrases'

interface PracticeSessionProps {
  phrases: Phrase[]
  profile: IdiolectProfile
  onSessionComplete: (results: SessionResults) => void
}

interface SessionResults {
  totalReviewed: number
  correctAnswers: number
  averageRating: number
  timeSpent: number
}

export const PracticeSession: React.FC<PracticeSessionProps> = ({
  phrases,
  profile,
  onSessionComplete
}) => {
  const [translations, setTranslations] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [scheduler] = useState(() => new SpacedRepetitionScheduler())
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([])
  const [currentItem, setCurrentItem] = useState<ReviewItem | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)
  const [sessionStartTime] = useState(() => Date.now())
  const [sessionStats, setSessionStats] = useState({
    reviewed: 0,
    correct: 0,
    ratings: [] as number[]
  })

  // Fetch translations for all phrases
  useEffect(() => {
    const fetchTranslations = async () => {
      try {
        const response = await fetch('/api/translations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phrases: phrases.map(p => p.englishText),
            profile: profile
          })
        });

        const result = await response.json();

        if (result.success) {
          const newTranslations: Record<string, string> = {};
          result.data.translations.forEach((t: { englishPhrase: string; translation: { natural: string } }) => {
            newTranslations[t.englishPhrase] = t.translation.natural;
          });
          setTranslations(newTranslations);
        }
      } catch {
        // Translation fetch failed silently
      } finally {
        setIsLoading(false);
      }
    };

    if (phrases.length > 0) {
      fetchTranslations();
    } else {
      setIsLoading(false);
    }
  }, [phrases, profile]);

  // Initialize review items once translations are ready
  useEffect(() => {
    if (isLoading) return;

    // Convert phrases to review items
    const items: ReviewItem[] = phrases.map(phrase => ({
      id: phrase.phraseId,
      content: phrase.englishText,
      // Use the fetched translation, or fallback to a generic message if missing
      translation: translations[phrase.englishText] || 'Translation unavailable',
      easeFactor: 2.5,
      interval: 1,
      repetitions: 0,
      nextReview: new Date(),
      createdAt: new Date(phrase.createdAt),
      lastReviewed: null
    }))

    const dueItems = scheduler.getDueItems(items)
    setReviewItems(dueItems)

    if (dueItems.length > 0) {
      setCurrentItem(dueItems[0])
    }
  }, [phrases, scheduler, translations, isLoading])

  if (isLoading) {
    return (
      <div className="practice-session">
        <div className="loading-state">
          <div className="spinner"></div>
          <h3>Preparing your session...</h3>
          <p>Generating personalized translations</p>
        </div>
        <style jsx>{`
          .practice-session {
            max-width: 600px;
            margin: 0 auto;
            padding: 2rem;
          }
          .loading-state {
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
        `}</style>
      </div>
    );
  }

  const handleRating = (rating: PerformanceRating) => {
    if (!currentItem) return

    const updatedItem = scheduler.processReview(currentItem, rating)
    const newStats = {
      reviewed: sessionStats.reviewed + 1,
      correct: sessionStats.correct + (rating >= PerformanceRating.GOOD ? 1 : 0),
      ratings: [...sessionStats.ratings, rating]
    }

    setSessionStats(newStats)

    // Move to next item
    const remainingItems = reviewItems.filter(item => item.id !== currentItem.id)

    if (remainingItems.length > 0) {
      setCurrentItem(remainingItems[0])
      setShowAnswer(false)
    } else {
      // Session complete
      const timeSpent = (Date.now() - sessionStartTime) / 1000
      const averageRating = newStats.ratings.reduce((a, b) => a + b, 0) / newStats.ratings.length

      onSessionComplete({
        totalReviewed: newStats.reviewed,
        correctAnswers: newStats.correct,
        averageRating,
        timeSpent
      })
    }
  }

  if (!currentItem) {
    return (
      <div className="practice-session">
        <div className="no-items">
          <h3>🎉 All caught up!</h3>
          <p>No phrases are due for review right now.</p>
          <p>Come back later for more practice.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="practice-session">
      <div className="session-header">
        <div className="progress">
          {sessionStats.reviewed + 1} of {reviewItems.length}
        </div>
        <div className="stats">
          Correct: {sessionStats.correct}/{sessionStats.reviewed}
        </div>
      </div>

      <div className="review-card">
        <div className="english-phrase">
          <h3>{currentItem.content}</h3>
        </div>

        {!showAnswer ? (
          <div className="reveal-section">
            <p>Think of the Spanish translation, then reveal the answer.</p>
            <button
              onClick={() => setShowAnswer(true)}
              className="reveal-btn"
            >
              Show Spanish
            </button>
          </div>
        ) : (
          <div className="answer-section">
            <div className="spanish-translation">
              <h4>{currentItem.translation}</h4>
            </div>

            <div className="rating-buttons">
              <p>How well did you remember this?</p>
              <div className="rating-grid">
                <button
                  onClick={() => handleRating(PerformanceRating.AGAIN)}
                  className="rating-btn again"
                >
                  😵 Again
                </button>
                <button
                  onClick={() => handleRating(PerformanceRating.HARD)}
                  className="rating-btn hard"
                >
                  😅 Hard
                </button>
                <button
                  onClick={() => handleRating(PerformanceRating.GOOD)}
                  className="rating-btn good"
                >
                  😊 Good
                </button>
                <button
                  onClick={() => handleRating(PerformanceRating.EASY)}
                  className="rating-btn easy"
                >
                  😎 Easy
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .practice-session {
          max-width: 600px;
          margin: 0 auto;
          padding: 2rem;
        }

        .session-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 2rem;
          padding: 1rem;
          background: #f8fafc;
          border-radius: 0.5rem;
        }

        .progress {
          font-weight: 600;
          color: #4299e1;
        }

        .stats {
          color: #718096;
        }

        .review-card {
          background: white;
          border-radius: 1rem;
          padding: 2rem;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          text-align: center;
        }

        .english-phrase h3 {
          color: #2d3748;
          margin-bottom: 2rem;
          font-size: 1.5rem;
        }

        .reveal-section p {
          color: #718096;
          margin-bottom: 1.5rem;
        }

        .reveal-btn {
          padding: 1rem 2rem;
          background: linear-gradient(135deg, #4299e1, #3182ce);
          color: white;
          border: none;
          border-radius: 0.75rem;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .reveal-btn:hover {
          transform: translateY(-2px);
        }

        .spanish-translation {
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: #e6fffa;
          border-radius: 0.75rem;
          border-left: 4px solid #38b2ac;
        }

        .spanish-translation h4 {
          color: #2d3748;
          font-size: 1.3rem;
          margin: 0;
        }

        .rating-buttons p {
          color: #4a5568;
          margin-bottom: 1rem;
        }

        .rating-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        .rating-btn {
          padding: 1rem;
          border: none;
          border-radius: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .rating-btn.again {
          background: #fed7d7;
          color: #c53030;
        }

        .rating-btn.hard {
          background: #feebc8;
          color: #dd6b20;
        }

        .rating-btn.good {
          background: #c6f6d5;
          color: #38a169;
        }

        .rating-btn.easy {
          background: #bee3f8;
          color: #3182ce;
        }

        .rating-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .no-items {
          text-align: center;
          padding: 3rem;
          background: white;
          border-radius: 1rem;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }

        .no-items h3 {
          color: #38a169;
          margin-bottom: 1rem;
        }

        .no-items p {
          color: #718096;
          margin-bottom: 0.5rem;
        }

        @media (max-width: 768px) {
          .practice-session {
            padding: 1rem;
          }

          .rating-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
