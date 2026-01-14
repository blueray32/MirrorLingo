import React, { useState, useEffect } from 'react'
import { SpacedRepetitionScheduler, ReviewItem, PerformanceRating } from '../utils/spacedRepetition'
import { Phrase, IdiolectProfile } from '../types/phrases'
import { usePronunciationAnalysis } from '../hooks/usePronunciationAnalysis'
import { useSpacedRepetitionSync } from '../hooks/useSpacedRepetitionSync'
import { PronunciationWaveform } from './PronunciationWaveform'

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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

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
  const [showPronunciation, setShowPronunciation] = useState(false)
  const [sessionStartTime] = useState(() => Date.now())
  const [sessionStats, setSessionStats] = useState({
    reviewed: 0,
    correct: 0,
    ratings: [] as number[]
  })

  const {
    isRecording,
    isAnalyzing,
    analysisResult,
    error,
    audioLevel,
    startRecording,
    stopRecording,
    clearResults
  } = usePronunciationAnalysis('demo-user')

  // Spaced repetition sync hook
  const {
    isEnabled: isSyncEnabled,
    isSyncing,
    syncReviewItems,
    getReviewItems
  } = useSpacedRepetitionSync(profile.userId)

  // Fetch translations for all phrases
  useEffect(() => {
    const fetchTranslations = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/translations`, {
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

    const initializeReviewItems = async () => {
      let items: ReviewItem[] = [];

      // Try to get existing review items from sync first
      if (isSyncEnabled) {
        try {
          const syncedItems = await getReviewItems();
          if (syncedItems.length > 0) {
            items = syncedItems;
          }
        } catch (error) {
          console.error('Failed to get synced items:', error);
        }
      }

      // If no synced items, create new ones from phrases
      if (items.length === 0) {
        items = phrases.map(phrase => ({
          id: phrase.phraseId,
          content: phrase.englishText,
          translation: translations[phrase.englishText] || 'Translation unavailable',
          easeFactor: 2.5,
          interval: 1,
          repetitions: 0,
          nextReview: new Date(),
          createdAt: new Date(phrase.createdAt),
          lastReviewed: null
        }));
      }

      const dueItems = scheduler.getDueItems(items);
      setReviewItems(dueItems);

      if (dueItems.length > 0) {
        setCurrentItem(dueItems[0]);
      }
    };

    initializeReviewItems();
  }, [phrases, scheduler, translations, isLoading, isSyncEnabled, getReviewItems])

  if (isLoading) {
    return (
      <div className="practice-session">
        <div className="loading-state glass-card">
          <div className="themed-spinner"></div>
          <h3>Curating your <span className="highlight">Personalized Session</span></h3>
          <p>Adapting content to your speaking style...</p>
        </div>
        <style jsx>{`
          .practice-session {
            max-width: 600px;
            margin: 0 auto;
          }
          .highlight {
            background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          .loading-state {
            text-align: center;
            padding: var(--space-xl);
          }
          .themed-spinner {
            width: 50px;
            height: 50px;
            border: 3px solid var(--border-glass);
            border-top: 3px solid var(--primary);
            border-radius: 50%;
            animation: spin 1s cubic-bezier(0.5, 0, 0.5, 1) infinite;
            margin: 0 auto var(--space-md);
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const handleRating = async (rating: PerformanceRating) => {
    if (!currentItem) return

    const updatedItem = scheduler.processReview(currentItem, rating)
    const newStats = {
      reviewed: sessionStats.reviewed + 1,
      correct: sessionStats.correct + (rating >= PerformanceRating.GOOD ? 1 : 0),
      ratings: [...sessionStats.ratings, rating]
    }

    setSessionStats(newStats)

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

    // Move to next item
    const remainingItems = reviewItems.filter(item => item.id !== currentItem.id)

    if (remainingItems.length > 0) {
      setCurrentItem(remainingItems[0])
      setShowAnswer(false)
      setShowPronunciation(false)
      clearResults()
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

  const handlePronunciationPractice = () => {
    if (!currentItem) return

    if (isRecording) {
      stopRecording()
    } else {
      startRecording(currentItem.translation)
    }
  }

  if (!currentItem) {
    return (
      <div className="practice-session">
        <div className="empty-caught-up glass-card">
          <h3>🎉 Perfect Timing!</h3>
          <p>You've cleared all your pending phrases.</p>
          <div className="divider"></div>
          <p className="hint">Record more phrases from the dashboard to continue growing your deck.</p>
        </div>
        <style jsx>{`
            .empty-caught-up {
                text-align: center;
                padding: var(--space-xl);
            }
            .divider {
                height: 1px;
                background: var(--border-glass);
                width: 50px;
                margin: var(--space-md) auto;
            }
            .hint { color: var(--text-secondary); font-size: 0.9rem; }
        `}</style>
      </div>
    )
  }

  const progressPercent = ((sessionStats.reviewed + 1) / reviewItems.length) * 100;

  return (
    <div className="practice-session fade-in">
      <div className="session-card glass-card">
        <header className="card-header">
          <div className="progress-container">
            <div className="progress-info">
              <span>Task {sessionStats.reviewed + 1} of {reviewItems.length}</span>
              <span>{Math.round(progressPercent)}%</span>
              {isSyncEnabled && (
                <span className={`sync-status ${isSyncing ? 'syncing' : 'synced'}`}>
                  {isSyncing ? '🔄 Syncing...' : '✅ Synced'}
                </span>
              )}
            </div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>
        </header>

        <div className="content-area">
          {!showAnswer ? (
            <div className="question-view">
              <div className="phrase-display">
                <span className="source-label">Translate from English:</span>
                <h2>{currentItem.content}</h2>
              </div>

              <button onClick={() => setShowAnswer(true)} className="primary-btn reveal-btn">
                Reveal Spanish Answer
              </button>
            </div>
          ) : (
            <div className="answer-view">
              <div className="phrase-display answer">
                <span className="source-label">Your personalized Spanish:</span>
                <h2 className="highlight-text">{currentItem.translation}</h2>
              </div>

              <div className="options-panel">
                <button
                  onClick={() => setShowPronunciation(!showPronunciation)}
                  className={`tool-btn ${showPronunciation ? 'active' : ''}`}
                >
                  {showPronunciation ? '🎤 Hide Tool' : '🎤 Practice Pronunciation'}
                </button>

                {showPronunciation && (
                  <div className="pronunciation-lab glass-card">
                    {isRecording && <PronunciationWaveform audioLevel={audioLevel} isRecording={isRecording} />}

                    <button
                      onClick={handlePronunciationPractice}
                      disabled={isAnalyzing}
                      className={`record-action ${isRecording ? 'recording' : ''}`}
                    >
                      {isRecording ? 'Stop Recording' : 'Start Recording'}
                    </button>

                    {isAnalyzing && <p className="status-text animated-dots">AI is analyzing</p>}

                    {analysisResult && (
                      <div className="analysis-box">
                        <div className="score-ring">
                          <span className="score-num">{analysisResult.overallScore}</span>
                          <span className="score-label">pts</span>
                        </div>
                        <div className="feedback-pills">
                          {analysisResult.feedback.strengths[0] && (
                            <span className="pill strength">✨ {analysisResult.feedback.strengths[0]}</span>
                          )}
                          {analysisResult.feedback.improvements[0] && (
                            <span className="pill improvement">💡 {analysisResult.feedback.improvements[0]}</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="rating-system">
                <p className="system-label">How well did you do?</p>
                <div className="rating-grid">
                  <button onClick={() => handleRating(PerformanceRating.AGAIN)} className="rate-btn rate-again">
                    <span className="icon">↩️</span> Again
                  </button>
                  <button onClick={() => handleRating(PerformanceRating.HARD)} className="rate-btn rate-hard">
                    <span className="icon">🧗</span> Hard
                  </button>
                  <button onClick={() => handleRating(PerformanceRating.GOOD)} className="rate-btn rate-good">
                    <span className="icon">✅</span> Good
                  </button>
                  <button onClick={() => handleRating(PerformanceRating.EASY)} className="rate-btn rate-easy">
                    <span className="icon">🚀</span> Easy
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .practice-session {
          max-width: 600px;
          margin: 0 auto;
        }

        .session-card {
            padding: 0 !important;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }

        .card-header {
            padding: var(--space-lg);
            background: rgba(255, 255, 255, 0.03);
            border-bottom: 1px solid var(--border-glass);
        }

        .progress-container {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        .progress-info {
            display: flex;
            justify-content: space-between;
            font-size: 0.85rem;
            font-weight: 700;
            color: var(--text-secondary);
        }

        .progress-bar-bg {
            height: 6px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: var(--radius-full);
            overflow: hidden;
        }

        .progress-bar-fill {
            height: 100%;
            background: linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%);
            border-radius: var(--radius-full);
            transition: width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .content-area {
            padding: var(--space-xl) var(--space-lg);
            text-align: center;
        }

        .phrase-display {
            margin-bottom: var(--space-xl);
        }

        .phrase-display.answer {
            animation: slideUp 0.4s ease-out;
        }

        .source-label {
            display: block;
            font-size: 0.8rem;
            text-transform: uppercase;
            letter-spacing: 0.15em;
            color: var(--text-secondary);
            margin-bottom: 0.75rem;
            font-weight: 800;
        }

        .phrase-display h2 {
            font-size: 1.8rem;
            color: var(--text-primary);
            line-height: 1.3;
        }

        .highlight-text {
            background: linear-gradient(135deg, #a5b4fc 0%, #f9a8d4 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-weight: 800;
        }

        .reveal-btn {
            padding: 1rem 2.5rem;
            font-size: 1.1rem;
        }

        .options-panel {
            margin-bottom: var(--space-xl);
        }

        .tool-btn {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid var(--border-glass);
            color: var(--text-secondary);
            padding: 0.6rem 1.2rem;
            border-radius: var(--radius-md);
            cursor: pointer;
            font-weight: 600;
            transition: all var(--transition-fast);
        }

        .tool-btn.active {
            background: var(--primary);
            color: white;
            border-color: var(--primary);
        }

        .pronunciation-lab {
            margin-top: var(--space-md);
            padding: var(--space-md) !important;
            background: rgba(0, 0, 0, 0.2) !important;
        }

        .record-action {
            margin-top: var(--space-md);
            padding: 0.75rem 1.5rem;
            border-radius: var(--radius-full);
            border: none;
            background: var(--accent);
            color: white;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s;
        }

        .record-action.recording {
            background: var(--danger);
            animation: pulse-red 2s infinite;
        }

        @keyframes pulse-red {
            0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
            70% { box-shadow: 0 0 0 15px rgba(239, 68, 68, 0); }
            100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }

        .analysis-box {
            margin-top: var(--space-md);
            display: flex;
            align-items: center;
            gap: var(--space-md);
            text-align: left;
            padding: var(--space-md);
            background: rgba(255, 255, 255, 0.03);
            border-radius: var(--radius-md);
        }

        .score-ring {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            border: 3px solid var(--accent);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }

        .score-num { font-size: 1.1rem; font-weight: 800; line-height: 1; color: var(--accent); }
        .score-label { font-size: 0.6rem; text-transform: uppercase; opacity: 0.7; }

        .feedback-pills {
            display: flex;
            flex-direction: column;
            gap: 0.4rem;
        }

        .pill {
            font-size: 0.8rem;
            padding: 0.2rem 0.6rem;
            border-radius: var(--radius-sm);
            font-weight: 600;
        }

        .pill.strength { background: rgba(16, 185, 129, 0.1); color: var(--accent); }
        .pill.improvement { background: rgba(245, 158, 11, 0.1); color: var(--warning); }

        .rating-system {
            border-top: 1px solid var(--border-glass);
            padding-top: var(--space-lg);
        }

        .system-label {
            font-size: 0.9rem;
            color: var(--text-secondary);
            margin-bottom: var(--space-md);
            font-weight: 600;
        }

        .rating-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 0.75rem;
        }

        .rate-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            padding: 0.8rem;
            border-radius: var(--radius-md);
            border: 1px solid var(--border-glass);
            background: rgba(255, 255, 255, 0.03);
            color: var(--text-primary);
            font-weight: 700;
            cursor: pointer;
            transition: all var(--transition-fast);
        }

        .rate-btn:hover {
            transform: translateY(-2px);
            background: rgba(255, 255, 255, 0.08);
        }

        .rate-again:hover { border-color: var(--danger); color: var(--danger); }
        .rate-hard:hover { border-color: var(--warning); color: var(--warning); }
        .rate-good:hover { border-color: var(--secondary); color: var(--secondary); }
        .rate-easy:hover { border-color: var(--accent); color: var(--accent); }

        @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }

        .status-text { color: var(--text-secondary); font-size: 0.9rem; margin-top: 0.5rem; }

        @media (max-width: 480px) {
            .rating-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  )
}
