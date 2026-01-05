import React, { useState } from 'react';
import { Phrase, IdiolectProfile } from '../types/phrases';

interface SpanishTranslation {
  literal: string;
  natural: string;
  explanation: string;
  confidence: number;
  culturalNotes?: string;
  formalityLevel: 'informal' | 'formal';
}

interface TranslationResult {
  englishPhrase: string;
  translation: SpanishTranslation;
  styleMatching: {
    tonePreserved: boolean;
    formalityAdjusted: boolean;
    personalityMaintained: boolean;
  };
  learningTips: string[];
}

interface SpanishTranslationsProps {
  phrases: Phrase[];
  profile: IdiolectProfile;
  onPronunciationPractice?: (englishPhrase: string, spanishPhrase: string) => void;
}

export const SpanishTranslations: React.FC<SpanishTranslationsProps> = ({
  phrases,
  profile,
  onPronunciationPractice
}) => {
  const [translations, setTranslations] = useState<TranslationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPhrases, setSelectedPhrases] = useState<string[]>([]);

  const handleGenerateTranslations = async () => {
    if (selectedPhrases.length === 0) {
      alert('Please select at least one phrase to translate');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/translations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'demo-user-123'
        },
        body: JSON.stringify({
          phraseIds: selectedPhrases
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setTranslations(result.data.translations);
      } else {
        throw new Error(result.error);
      }
      
    } catch (error) {
      console.error('Translation error:', error);
      alert('Failed to generate translations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePhraseSelection = (phraseId: string) => {
    setSelectedPhrases(prev => 
      prev.includes(phraseId)
        ? prev.filter(id => id !== phraseId)
        : [...prev, phraseId]
    );
  };

  const selectAllPhrases = () => {
    setSelectedPhrases(phrases.map(p => p.id));
  };

  const clearSelection = () => {
    setSelectedPhrases([]);
  };

  return (
    <div className="spanish-translations">
      <div className="translation-header">
        <h2>🇪🇸 Your Personalized Spanish Translations</h2>
        <p>
          Based on your {profile.tone} tone and {profile.formality} style,
          here are Spanish translations that match how you actually speak.
        </p>
      </div>

      {translations.length === 0 ? (
        <div className="phrase-selection">
          <div className="selection-controls">
            <h3>Select phrases to translate:</h3>
            <div className="control-buttons">
              <button onClick={selectAllPhrases} className="select-all-btn">
                Select All ({phrases.length})
              </button>
              <button onClick={clearSelection} className="clear-btn">
                Clear Selection
              </button>
            </div>
          </div>

          <div className="phrase-list">
            {phrases.map((phrase) => (
              <div 
                key={phrase.id}
                className={`phrase-item ${selectedPhrases.includes(phrase.id) ? 'selected' : ''}`}
                onClick={() => togglePhraseSelection(phrase.id)}
              >
                <div className="phrase-checkbox">
                  <input 
                    type="checkbox"
                    checked={selectedPhrases.includes(phrase.id)}
                    onChange={() => togglePhraseSelection(phrase.id)}
                  />
                </div>
                <div className="phrase-content">
                  <div className="phrase-text">"{phrase.text}"</div>
                  <div className="phrase-intent">{phrase.intent}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="generate-section">
            <button 
              onClick={handleGenerateTranslations}
              disabled={selectedPhrases.length === 0 || isLoading}
              className="generate-btn"
            >
              {isLoading ? (
                <>
                  <div className="spinner" />
                  Generating Spanish Translations...
                </>
              ) : (
                `Generate Spanish for ${selectedPhrases.length} phrase${selectedPhrases.length !== 1 ? 's' : ''}`
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="translations-results">
          <div className="results-header">
            <h3>Your Spanish Translations</h3>
            <button 
              onClick={() => {
                setTranslations([]);
                setSelectedPhrases([]);
              }}
              className="new-translation-btn"
            >
              Translate More Phrases
            </button>
          </div>

          <div className="translation-cards">
            {translations.map((result, index) => (
              <div key={index} className="translation-card">
                <div className="english-phrase">
                  <h4>English:</h4>
                  <p>"{result.englishPhrase}"</p>
                </div>

                <div className="spanish-translations">
                  <div className="literal-translation">
                    <h5>📚 Literal Translation:</h5>
                    <p className="spanish-text">"{result.translation.literal}"</p>
                  </div>

                  <div className="natural-translation">
                    <h5>💬 Natural (Your Style):</h5>
                    <p className="spanish-text featured">"{result.translation.natural}"</p>
                  </div>
                </div>

                <div className="translation-explanation">
                  <h5>💡 Explanation:</h5>
                  <p>{result.translation.explanation}</p>
                </div>

                {result.translation.culturalNotes && (
                  <div className="cultural-notes">
                    <h5>🌎 Cultural Notes:</h5>
                    <p>{result.translation.culturalNotes}</p>
                  </div>
                )}

                <div className="learning-tips">
                  <h5>🎯 Learning Tips:</h5>
                  <ul>
                    {result.learningTips.map((tip, tipIndex) => (
                      <li key={tipIndex}>{tip}</li>
                    ))}
                  </ul>
                </div>

                <div className="style-matching">
                  <h5>✨ Style Matching:</h5>
                  <div className="matching-indicators">
                    <span className={`indicator ${result.styleMatching.tonePreserved ? 'good' : 'neutral'}`}>
                      {result.styleMatching.tonePreserved ? '✅' : '⚠️'} Tone Preserved
                    </span>
                    <span className={`indicator ${result.styleMatching.formalityAdjusted ? 'good' : 'neutral'}`}>
                      {result.styleMatching.formalityAdjusted ? '✅' : '⚠️'} Formality Matched
                    </span>
                    <span className={`indicator ${result.styleMatching.personalityMaintained ? 'good' : 'neutral'}`}>
                      {result.styleMatching.personalityMaintained ? '✅' : '⚠️'} Personality Maintained
                    </span>
                  </div>
                </div>

                {onPronunciationPractice && (
                  <div className="pronunciation-practice">
                    <button 
                      onClick={() => onPronunciationPractice(result.englishPhrase, result.translation.natural)}
                      className="practice-btn"
                    >
                      🎤 Practice Pronunciation
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .spanish-translations {
          padding: 2rem;
        }

        .translation-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .translation-header h2 {
          color: #2d3748;
          margin-bottom: 1rem;
        }

        .translation-header p {
          color: #718096;
          font-size: 1.1rem;
        }

        .selection-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .control-buttons {
          display: flex;
          gap: 1rem;
        }

        .select-all-btn, .clear-btn {
          padding: 0.5rem 1rem;
          border: 1px solid #e2e8f0;
          background: white;
          border-radius: 0.5rem;
          cursor: pointer;
          font-size: 0.875rem;
        }

        .select-all-btn:hover, .clear-btn:hover {
          background: #f8fafc;
        }

        .phrase-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 2rem;
        }

        .phrase-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border: 2px solid #e2e8f0;
          border-radius: 0.75rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .phrase-item:hover {
          border-color: #cbd5e0;
        }

        .phrase-item.selected {
          border-color: #4299e1;
          background: #ebf8ff;
        }

        .phrase-content {
          flex: 1;
        }

        .phrase-text {
          font-weight: 500;
          color: #2d3748;
          margin-bottom: 0.25rem;
        }

        .phrase-intent {
          font-size: 0.875rem;
          color: #718096;
          text-transform: capitalize;
        }

        .generate-section {
          text-align: center;
        }

        .generate-btn {
          padding: 1rem 2rem;
          background: linear-gradient(135deg, #4299e1, #3182ce);
          color: white;
          border: none;
          border-radius: 0.75rem;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0 auto;
        }

        .generate-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(66, 153, 225, 0.3);
        }

        .generate-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .results-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .new-translation-btn {
          padding: 0.5rem 1rem;
          background: #e2e8f0;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
        }

        .translation-cards {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .translation-card {
          background: white;
          border-radius: 1rem;
          padding: 2rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          border: 1px solid #e2e8f0;
        }

        .english-phrase {
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #f1f5f9;
        }

        .spanish-translations {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .spanish-text {
          font-size: 1.1rem;
          font-weight: 500;
          color: #2d3748;
          font-style: italic;
        }

        .spanish-text.featured {
          color: #2b6cb0;
          font-size: 1.2rem;
        }

        .translation-explanation,
        .cultural-notes,
        .learning-tips {
          margin-bottom: 1rem;
        }

        .learning-tips ul {
          margin: 0.5rem 0 0 1rem;
        }

        .learning-tips li {
          margin-bottom: 0.25rem;
        }

        .matching-indicators {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .indicator {
          padding: 0.25rem 0.75rem;
          border-radius: 1rem;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .indicator.good {
          background: #c6f6d5;
          color: #22543d;
        }

        .indicator.neutral {
          background: #fed7d7;
          color: #742a2a;
        }

        .pronunciation-practice {
          margin-top: 1.5rem;
          text-align: center;
        }

        .practice-btn {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 0.75rem;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }

        .practice-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
        }

        @media (max-width: 768px) {
          .spanish-translations {
            grid-template-columns: 1fr;
          }

          .selection-controls {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .matching-indicators {
            flex-direction: column;
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};
