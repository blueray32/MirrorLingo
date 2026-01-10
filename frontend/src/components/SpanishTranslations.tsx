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
  userId: string;
  onPronunciationPractice?: (englishPhrase: string, spanishPhrase: string) => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export const SpanishTranslations: React.FC<SpanishTranslationsProps> = ({
  phrases,
  profile,
  userId,
  onPronunciationPractice
}) => {
  const [translations, setTranslations] = useState<TranslationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPhrases, setSelectedPhrases] = useState<string[]>([]);

  const handleGenerateTranslations = async () => {
    if (selectedPhrases.length === 0) return;
    setIsLoading(true);

    try {
      const selectedPhrasesData = phrases
        .filter(p => selectedPhrases.includes(p.phraseId))
        .map(p => p.englishText);

      const response = await fetch(`${API_BASE_URL}/api/translations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({
          phrases: selectedPhrasesData,
          profile: profile
        })
      });

      const result = await response.json();
      if (result.success) {
        setTranslations(result.data.translations);
      } else {
        throw new Error(result.error);
      }
    } catch {
      alert('Failed to synchronize translations. Please try again.');
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

  return (
    <div className="spanish-translations-module fade-in">
      <header className="module-header">
        <span className="badge-pill">Stylistic Mapping</span>
        <h2>Persona Synchronization</h2>
        <p>Based on your <strong className="highlight">{profile.overallTone}</strong> tone and <strong className="highlight">{profile.overallFormality}</strong> delivery, we've mapped your English expressions to their Spanish counterparts.</p>
      </header>

      {translations.length === 0 ? (
        <div className="selection-view glass-card">
          <div className="selection-header">
            <h3>Select Expressions to Synchronize</h3>
            <div className="selection-actions">
              <button onClick={() => setSelectedPhrases(phrases.map(p => p.phraseId))} className="small-text-btn">Select All</button>
              <button onClick={() => setSelectedPhrases([])} className="small-text-btn">Clear</button>
            </div>
          </div>

          <div className="phrase-grid">
            {phrases.map((phrase) => (
              <div
                key={phrase.phraseId}
                className={`phrase-tile glass-card ${selectedPhrases.includes(phrase.phraseId) ? 'active' : ''}`}
                onClick={() => togglePhraseSelection(phrase.phraseId)}
              >
                <div className="tile-check">{selectedPhrases.includes(phrase.phraseId) ? '✓' : ''}</div>
                <div className="tile-content">
                  <p className="p-text">"{phrase.englishText}"</p>
                  <span className="p-tag">{phrase.intent}</span>
                </div>
              </div>
            ))}
          </div>

          <footer className="selection-footer">
            <button
              onClick={handleGenerateTranslations}
              disabled={selectedPhrases.length === 0 || isLoading}
              className="primary-btn wide-btn"
            >
              {isLoading ? (
                <span className="load-row">
                  <span className="themed-spinner mini"></span>
                  Processing Linguistic Vectors...
                </span>
              ) : (
                `Synchronize ${selectedPhrases.length} Expression${selectedPhrases.length !== 1 ? 's' : ''}`
              )}
            </button>
          </footer>
        </div>
      ) : (
        <div className="results-view">
          <div className="results-control-bar">
            <h3>Synchronized Mappings</h3>
            <button
              onClick={() => { setTranslations([]); setSelectedPhrases([]); }}
              className="secondary-btn small"
            >
              Back to Selection
            </button>
          </div>

          <div className="translation-tome">
            {translations.map((result, index) => (
              <div key={index} className="translation-entry glass-card fade-in">
                <section className="entry-header">
                  <div className="e-label">Input Source</div>
                  <h4>"{result.englishPhrase}"</h4>
                </section>

                <div className="version-split">
                  <div className="v-card literal">
                    <span className="v-tag">Literal Construct</span>
                    <p className="v-text">"{result.translation.literal}"</p>
                  </div>
                  <div className="v-card natural active">
                    <span className="v-tag">Natural Reflection</span>
                    <p className="v-text featured">"{result.translation.natural}"</p>
                  </div>
                </div>

                <div className="entry-grid">
                  <div className="g-section">
                    <h6>Semantic Logic</h6>
                    <p className="g-text">{result.translation.explanation}</p>
                    {result.translation.culturalNotes && (
                      <div className="cultural-aside">
                        <span className="aside-tag">Cultural Context</span>
                        <p>{result.translation.culturalNotes}</p>
                      </div>
                    )}
                  </div>
                  <div className="g-section">
                    <h6>Acquisition Vectors</h6>
                    <ul className="tip-list">
                      {result.learningTips.map((tip, i) => <li key={i}>{tip}</li>)}
                    </ul>
                  </div>
                </div>

                <footer className="entry-footer">
                  <div className="style-validators">
                    <span className={`v-pill ${result.styleMatching.tonePreserved ? 'pass' : ''}`}>Tone Match</span>
                    <span className={`v-pill ${result.styleMatching.formalityAdjusted ? 'pass' : ''}`}>Style Vector</span>
                    <span className={`v-pill ${result.styleMatching.personalityMaintained ? 'pass' : ''}`}>Persona Identity</span>
                  </div>
                  {onPronunciationPractice && (
                    <button
                      onClick={() => onPronunciationPractice(result.englishPhrase, result.translation.natural)}
                      className="primary-btn practice-btn"
                    >
                      🎤 Activate Voice Lab
                    </button>
                  )}
                </footer>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{styles}</style>
    </div>
  );
};

const styles = `
    .spanish-translations-module { max-width: 900px; margin: 0 auto; }
    .module-header { text-align: center; margin-bottom: var(--space-xl); }
    .module-header h2 { font-size: 2.2rem; margin: var(--space-md) 0; color: var(--text-primary); }
    .module-header p { color: var(--text-secondary); opacity: 0.8; max-width: 600px; margin: 0 auto; line-height: 1.6; }
    .highlight { color: var(--primary); }

    .badge-pill {
        display: inline-block;
        background: rgba(99, 102, 241, 0.1);
        color: var(--primary);
        padding: 0.2rem 0.8rem;
        border-radius: var(--radius-full);
        font-size: 0.7rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        border: 1px solid rgba(99, 102, 241, 0.2);
    }

    /* Selection View */
    .selection-view { padding: var(--space-xl) !important; }
    .selection-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-xl); }
    .selection-actions { display: flex; gap: 1rem; }
    .small-text-btn { background: none; border: none; color: var(--text-secondary); font-size: 0.8rem; font-weight: 700; cursor: pointer; text-decoration: underline; }

    .phrase-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: var(--space-md); margin-bottom: var(--space-xl); }
    .phrase-tile { padding: var(--space-md) !important; display: flex; gap: var(--space-md); align-items: flex-start; cursor: pointer; transition: all 0.2s; background: rgba(0,0,0,0.1) !important; border: 1px solid var(--border-glass) !important; }
    .phrase-tile:hover { transform: translateY(-2px); border-color: rgba(255,255,255,0.2) !important; }
    .phrase-tile.active { border-color: var(--primary) !important; background: rgba(99, 102, 241, 0.05) !important; }

    .tile-check { width: 22px; height: 22px; border-radius: 50%; border: 2px solid var(--border-glass); display: flex; align-items: center; justify-content: center; font-size: 0.7rem; color: white; font-weight: 900; }
    .phrase-tile.active .tile-check { background: var(--primary); border-color: var(--primary); }
    
    .p-text { margin: 0; font-size: 0.95rem; font-weight: 600; color: var(--text-primary); }
    .p-tag { font-size: 0.7rem; text-transform: uppercase; font-weight: 800; color: var(--text-secondary); opacity: 0.6; }

    .selection-footer { display: flex; justify-content: center; }
    .wide-btn { min-width: 320px; }
    .load-row { display: flex; align-items: center; gap: 0.75rem; justify-content: center; }

    /* Results View */
    .results-control-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-xl); padding: 0 var(--space-sm); }
    .translation-tome { display: flex; flex-direction: column; gap: var(--space-xl); }
    .translation-entry { padding: 0 !important; overflow: hidden; }

    .entry-header { padding: var(--space-lg) var(--space-xl); background: rgba(255,255,255,0.02); border-bottom: 1px solid var(--border-glass); }
    .e-label { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; color: var(--primary); margin-bottom: 0.2rem; }
    .entry-header h4 { margin: 0; font-size: 1.3rem; color: var(--text-primary); }

    .version-split { display: grid; grid-template-columns: 1fr 1fr; border-bottom: 1px solid var(--border-glass); }
    .v-card { padding: var(--space-lg) var(--space-xl); display: flex; flex-direction: column; gap: 0.5rem; }
    .v-card.natural { background: rgba(99, 102, 241, 0.05); }
    .v-tag { font-size: 0.6rem; font-weight: 800; text-transform: uppercase; color: var(--text-secondary); opacity: 0.6; }
    .v-text { font-size: 1rem; color: var(--text-secondary); font-style: italic; }
    .v-text.featured { font-size: 1.4rem; color: var(--accent); font-weight: 700; }

    .entry-grid { padding: var(--space-xl); display: grid; grid-template-columns: 1.5fr 1fr; gap: var(--space-xl); }
    .g-section h6 { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 1rem; }
    .g-text { font-size: 0.95rem; line-height: 1.6; color: var(--text-secondary); margin: 0; }

    .cultural-aside { margin-top: var(--space-lg); padding: var(--space-md); background: rgba(16, 185, 129, 0.05); border-radius: var(--radius-md); border-left: 2px solid var(--accent); }
    .aside-tag { font-size: 0.65rem; font-weight: 800; color: var(--accent); text-transform: uppercase; }
    .cultural-aside p { margin: 0.2rem 0 0 0; font-size: 0.85rem; color: var(--text-secondary); }

    .tip-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.5rem; }
    .tip-list li { font-size: 0.85rem; color: var(--text-secondary); padding-left: 1rem; position: relative; }
    .tip-list li::before { content: '•'; position: absolute; left: 0; color: var(--primary); font-weight: 900; }

    .entry-footer { padding: var(--space-lg) var(--space-xl); background: rgba(0,0,0,0.2); display: flex; justify-content: space-between; align-items: center; }
    .style-validators { display: flex; gap: 0.5rem; }
    .v-pill { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; color: var(--text-secondary); opacity: 0.4; padding: 0.2rem 0.6rem; border: 1px solid var(--border-glass); border-radius: var(--radius-full); }
    .v-pill.pass { color: var(--accent); opacity: 1; border-color: var(--accent); background: rgba(16, 185, 129, 0.05); }

    .practice-btn { padding: 0.5rem 1.2rem; font-size: 0.85rem; }

    @media (max-width: 800px) {
        .version-split, .entry-grid { grid-template-columns: 1fr; }
        .entry-footer { flex-direction: column; gap: var(--space-lg); }
    }
`;
