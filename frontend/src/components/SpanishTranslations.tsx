import React, { useState } from 'react';
import { Phrase, IdiolectProfile } from '../types/phrases';
import styles from './SpanishTranslations.module.css';

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
    <div className={`${styles.spanishTranslationsModule} ${styles.fadeIn}`}>
      <header className={styles.moduleHeader}>
        <span className={styles.badgePill}>Stylistic Mapping</span>
        <h2>Persona Synchronization</h2>
        <p>Based on your <strong className="highlight">{profile.overallTone}</strong> tone and <strong className="highlight">{profile.overallFormality}</strong> delivery, we've mapped your English expressions to their Spanish counterparts.</p>
      </header>

      {translations.length === 0 ? (
        <div className={`${styles.selectionView} glass-card`}>
          <div className={styles.selectionHeader}>
            <h3>Select Expressions to Synchronize</h3>
            <div className={styles.selectionActions}>
              <button onClick={() => setSelectedPhrases(phrases.map(p => p.phraseId))} className={styles.smallTextBtn}>Select All</button>
              <button onClick={() => setSelectedPhrases([])} className={styles.smallTextBtn}>Clear</button>
            </div>
          </div>

          <div className={styles.phraseGrid}>
            {phrases.map((phrase) => (
              <div
                key={phrase.phraseId}
                className={`${styles.phraseTile} glass-card ${selectedPhrases.includes(phrase.phraseId) ? styles.active : ''}`}
                onClick={() => togglePhraseSelection(phrase.phraseId)}
              >
                <div className={styles.tileCheck}>{selectedPhrases.includes(phrase.phraseId) ? '✓' : ''}</div>
                <div className={styles.tileContent}>
                  <p className={styles.pText}>"{phrase.englishText}"</p>
                  <span className={styles.pTag}>{phrase.intent}</span>
                </div>
              </div>
            ))}
          </div>

          <footer className={styles.selectionFooter}>
            <button
              onClick={handleGenerateTranslations}
              disabled={selectedPhrases.length === 0 || isLoading}
              className="primary-btn wide-btn"
            >
              {isLoading ? (
                <span className={styles.loadRow}>
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
        <div className={styles.resultsView}>
          <div className={styles.resultsControlBar}>
            <div className={styles.rTitleGroup}>
              <span className={styles.premiumIconGlow}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
              </span>
              <h3>Synchronized Mappings</h3>
            </div>
            <button
              onClick={() => { setTranslations([]); setSelectedPhrases([]); }}
              className={styles.smallBtnGlass}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
              Reset Session
            </button>
          </div>

          <div className={styles.translationTome}>
            {translations.map((result, index) => (
              <div key={index} className={`${styles.translationEntryPremium} ${styles.fadeIn} glass-card`}>
                <div className={styles.entryHeaderMinimal}>
                  <div className={styles.sourceDisplay}>
                    <span className={styles.sourceMarker}>EN</span>
                    <h4>{result.englishPhrase}</h4>
                  </div>
                </div>

                <div className={styles.premiumSplitView}>
                  <div className={`${styles.viewPanel} ${styles.literalPanel}`}>
                    <div className={styles.panelHeader}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
                      Literal Construction
                    </div>
                    <div className={styles.panelContent}>
                      <p className={styles.translationTextMuted}>{result.translation.literal}</p>
                    </div>
                  </div>

                  <div className={`${styles.viewPanel} ${styles.naturalPanel}`}>
                    <div className={`${styles.panelHeader} ${styles.activeHeader}`}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m5 12 5 5L20 7" /></svg>
                      Natural Reflection
                    </div>
                    <div className={styles.panelContent}>
                      <p className={styles.translationTextFeatured}>{result.translation.natural}</p>
                    </div>
                  </div>
                </div>

                <div className={styles.premiumDetailsGrid}>
                  <div className={`${styles.detailSection} ${styles.logicSection}`}>
                    <h5>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
                      Semantic Logic
                    </h5>
                    <p className={styles.logicText}>{result.translation.explanation}</p>
                    {result.translation.culturalNotes && (
                      <div className={styles.premiumCulturalTag}>
                        <span className={styles.innerTag}>Cultural Insight</span>
                        <p>{result.translation.culturalNotes}</p>
                      </div>
                    )}
                  </div>

                  <div className={`${styles.detailSection} ${styles.tipsSection}`}>
                    <h5>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6" /></svg>
                      Acquisition Vectors
                    </h5>
                    <div className={styles.premiumTipStack}>
                      {result.learningTips.map((tip, i) => (
                        <div key={i} className={styles.premiumTipItem}>
                          <span className={styles.tipBullet}></span>
                          {tip}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <footer className={styles.premiumEntryFooter}>
                  <div className={styles.styleValidatorsV2}>
                    <div className={`${styles.neonPill} ${result.styleMatching.tonePreserved ? styles.active : ''}`}>
                      <span className={styles.dot}></span> Tone
                    </div>
                    <div className={`${styles.neonPill} ${result.styleMatching.formalityAdjusted ? styles.active : ''}`}>
                      <span className={styles.dot}></span> Vector
                    </div>
                    <div className={`${styles.neonPill} ${result.styleMatching.personalityMaintained ? styles.active : ''}`}>
                      <span className={styles.dot}></span> Identity
                    </div>
                  </div>
                  {onPronunciationPractice && (
                    <button
                      onClick={() => onPronunciationPractice(result.englishPhrase, result.translation.natural)}
                      className={styles.premiumActionBtn}
                    >
                      <span className="btn-icon">🎤</span>
                      Voice Lab
                    </button>
                  )}
                </footer>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

