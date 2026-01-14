import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';
import { PracticeSession } from '../components/PracticeSession';
import { TrainingMixer } from '../components/TrainingMixer';
import { PronunciationFeedback } from '../components/PronunciationFeedback';
import { usePhrasesApi } from '../hooks/usePhrasesApi';
import { QuickPhraseCard } from '../components/QuickPhraseCard';

// Demo user ID
const DEMO_USER_ID = 'demo-user-123';

type TutorTab = 'practice' | 'training' | 'pronunciation' | 'deck';

export default function TutorPage() {
  const [activeTab, setActiveTab] = useState<TutorTab>('practice');
  const [selectedPhrase, setSelectedPhrase] = useState<{ english: string, spanish: string } | null>(null);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isLoadingTranslations, setIsLoadingTranslations] = useState(false);

  const { loadPhrases, phrases, profile, isLoading } = usePhrasesApi(DEMO_USER_ID);

  useEffect(() => {
    loadPhrases();
  }, [loadPhrases]);

  // Fetch translations when phrases are loaded
  useEffect(() => {
    const fetchTranslations = async () => {
      if (phrases.length === 0) return;
      setIsLoadingTranslations(true);

      try {
        const response = await fetch('/api/translations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-user-id': DEMO_USER_ID },
          body: JSON.stringify({
            phrases: phrases.map(p => p.englishText),
            profile: profile
          })
        });

        const result = await response.json();
        if (result.success) {
          const transMap: Record<string, string> = {};
          result.data.translations.forEach((t: { englishPhrase: string; translation: { natural: string } }) => {
            transMap[t.englishPhrase] = t.translation.natural;
          });
          setTranslations(transMap);
        }
      } catch (error) {
        console.error('Failed to fetch translations:', error);
      } finally {
        setIsLoadingTranslations(false);
      }
    };

    fetchTranslations();
  }, [phrases, profile]);

  useEffect(() => {
    if (phrases.length > 0 && !selectedPhrase) {
      const first = phrases[0];
      setSelectedPhrase({
        english: first.englishText,
        spanish: translations[first.englishText] || first.englishText
      });
    }
  }, [phrases, selectedPhrase, translations]);

  const handleSessionComplete = () => {
    console.log('Session complete');
  };

  return (
    <Layout currentPage="tutor">
      <Head>
        <title>Spanish Tutor - MirrorLingo</title>
        <meta name="description" content="Personalized Spanish tutoring based on your speaking style" />
      </Head>

      <div className="tutor-container">
        <header className="tutor-header">
          <h1>🎓 Your <span className="highlight">Spanish Tutor</span></h1>
          <p>Master the Spanish that matters to you with personalized exercises.</p>
        </header>

        {isLoading ? (
          <div className="loading-state glass-card">
            <div className="spinner"></div>
            <p>Loading your learning material...</p>
          </div>
        ) : phrases.length === 0 ? (
          <div className="empty-state glass-card">
            <h3>No Phrases Yet</h3>
            <p>Record some phrases on the Home page to start your tutoring.</p>
            <Link href="/" className="primary-btn">Go to Home</Link>
          </div>
        ) : (
          <div className="tutor-board glass-card">
            <div className="tabs-nav">
              <button
                className={`tab-btn ${activeTab === 'practice' ? 'active' : ''}`}
                onClick={() => setActiveTab('practice')}
              >
                🔄 Spaced Practice
              </button>
              <button
                className={`tab-btn ${activeTab === 'deck' ? 'active' : ''}`}
                onClick={() => setActiveTab('deck')}
              >
                🎴 Phrase Deck
              </button>
              <button
                className={`tab-btn ${activeTab === 'training' ? 'active' : ''}`}
                onClick={() => setActiveTab('training')}
              >
                ⚡ Mixed Training
              </button>
              <button
                className={`tab-btn ${activeTab === 'pronunciation' ? 'active' : ''}`}
                onClick={() => setActiveTab('pronunciation')}
              >
                🎤 Pronunciation
              </button>
            </div>

            <div className="tab-content">
              {activeTab === 'practice' && (
                <div className="component-container">
                  <PracticeSession
                    phrases={phrases}
                    profile={profile!}
                    onSessionComplete={handleSessionComplete}
                  />
                </div>
              )}

              {activeTab === 'deck' && (
                <div className="component-container deck-grid">
                  {isLoadingTranslations ? (
                    <div className="loading-state">
                      <div className="spinner"></div>
                      <p>Translating your phrases...</p>
                    </div>
                  ) : (
                    phrases.map(p => (
                      <QuickPhraseCard
                        key={p.phraseId}
                        phrase={{
                          ...p,
                          spanishText: translations[p.englishText] || 'Loading...'
                        }}
                      />
                    ))
                  )}
                </div>
              )}

              {activeTab === 'training' && (
                <div className="component-container">
                  {isLoadingTranslations ? (
                    <div className="loading-state">
                      <div className="spinner"></div>
                      <p>Loading translations for training...</p>
                    </div>
                  ) : (
                    <TrainingMixer
                      phrases={phrases.map(p => ({
                        ...p,
                        spanishText: translations[p.englishText] || ''
                      }))}
                      profile={profile!}
                      onComplete={handleSessionComplete}
                    />
                  )}
                </div>
              )}

              {activeTab === 'pronunciation' && (
                <div className="component-container">
                  {selectedPhrase ? (
                    <PronunciationFeedback
                      englishPhrase={selectedPhrase.english}
                      spanishPhrase={selectedPhrase.spanish}
                      onComplete={() => console.log('Pronunciation done')}
                    />
                  ) : (
                    <p>Select a phrase below to practice.</p>
                  )}

                  <div className="phrase-selector">
                    <h3>Pick a Phrase to Practice:</h3>
                    <div className="phrase-list">
                      {phrases.slice(0, 10).map(p => (
                        <button
                          key={p.phraseId}
                          className={`phrase-select-btn ${selectedPhrase?.english === p.englishText ? 'active' : ''}`}
                          onClick={() => setSelectedPhrase({
                            english: p.englishText,
                            spanish: translations[p.englishText] || p.englishText
                          })}
                        >
                          {p.englishText}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .tutor-header {
          text-align: center;
          margin-bottom: var(--space-xl);
        }

        .highlight {
          background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .tutor-header p {
          color: var(--text-secondary);
          font-size: 1.1rem;
        }

        .tutor-board {
          overflow: hidden;
          padding: 0 !important;
        }

        .tabs-nav {
          display: flex;
          background: rgba(255, 255, 255, 0.03);
          border-bottom: 1px solid var(--border-glass);
        }

        .tab-btn {
          flex: 1;
          padding: 1.25rem;
          border: none;
          background: none;
          font-weight: 700;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition-normal);
          border-bottom: 3px solid transparent;
        }

        .tab-btn:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.05);
        }

        .tab-btn.active {
          color: var(--primary);
          border-bottom-color: var(--primary);
          background: rgba(99, 102, 241, 0.05);
        }

        .tab-content {
          padding: var(--space-lg);
        }

        .deck-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: var(--space-md);
        }

        .loading-state, .empty-state {
          text-align: center;
          padding: var(--space-xl);
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid var(--border-glass);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto var(--space-md);
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .primary-btn {
          display: inline-block;
          margin-top: var(--space-md);
          padding: 0.8rem 2rem;
          background: var(--primary);
          color: white;
          border-radius: var(--radius-md);
          text-decoration: none;
          font-weight: 700;
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
        }

        .phrase-selector {
            margin-top: var(--space-xl);
            padding-top: var(--space-lg);
            border-top: 1px solid var(--border-glass);
        }

        .phrase-list {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            margin-top: var(--space-sm);
        }

        .phrase-select-btn {
            padding: 0.6rem 1.2rem;
            background: var(--bg-glass);
            border: 1px solid var(--border-glass);
            border-radius: var(--radius-full);
            color: var(--text-secondary);
            cursor: pointer;
            transition: all var(--transition-fast);
            font-size: 0.9rem;
        }

        .phrase-select-btn:hover {
            border-color: var(--text-secondary);
            color: var(--text-primary);
        }

        .phrase-select-btn.active {
            background: var(--primary);
            color: white;
            border-color: var(--primary);
        }

        @media (max-width: 768px) {
          .tabs-nav { flex-direction: column; }
          .tab-btn { border-bottom: none; border-left: 3px solid transparent; text-align: left; }
          .tab-btn.active { border-left-color: var(--primary); }
        }
      `}</style>
    </Layout>
  );
}
