import React, { useState } from 'react';
import { usePhrasesApi, usePhraseValidation } from '../hooks/usePhrasesApi';
import { Phrase, IdiolectProfile } from '../types/phrases';

interface PhraseInputProps {
  userId: string;
  onAnalysisComplete?: (data: { phrases: Phrase[], profile: IdiolectProfile }) => void;
}

export const PhraseInput: React.FC<PhraseInputProps> = ({ userId, onAnalysisComplete }) => {
  const [phrases, setPhrases] = useState<string[]>(['', '', '', '', '']);
  const [showAllInputs, setShowAllInputs] = useState(false);

  const { submitPhrases, isLoading, error, clearError } = usePhrasesApi(userId);
  const { validatePhrases } = usePhraseValidation();

  const handlePhraseChange = (index: number, value: string) => {
    const newPhrases = [...phrases];
    newPhrases[index] = value;
    setPhrases(newPhrases);

    if (error) {
      clearError();
    }
  };

  const addMoreInputs = () => {
    if (phrases.length < 10) {
      setPhrases([...phrases, '']);
    }
    setShowAllInputs(true);
  };

  const removePhrase = (index: number) => {
    if (phrases.length > 1) {
      const newPhrases = phrases.filter((_, i) => i !== index);
      setPhrases(newPhrases);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validatePhrases(phrases);
    if (!validation.valid) {
      return;
    }

    const result = await submitPhrases(phrases);
    if (result && onAnalysisComplete) {
      onAnalysisComplete(result);
    }
  };

  const filledPhrases = phrases.filter(p => p.trim().length > 0);
  const displayPhrases = showAllInputs ? phrases : phrases.slice(0, 5);

  return (
    <div className="phrase-input-container fade-in">
      <header className="input-header">
        <span className="badge-pill">Style Discovery</span>
        <h2>Mirror Your Voice</h2>
        <p>Input 5-10 common English phrases you use in your daily life. We'll analyze your unique rhythm to build your Spanish persona.</p>
      </header>

      <form onSubmit={handleSubmit} className="phrase-form glass-card">
        <div className="phrases-scroll-area">
          {displayPhrases.map((phrase, index) => (
            <div key={index} className="input-field-group">
              <div className="field-label-row">
                <label htmlFor={`phrase-${index}`} className="group-label">
                  Expression {index + 1}
                  {index >= 5 && <span className="optional">(optional)</span>}
                </label>
                <span className="char-indicator">{phrase.length}/500</span>
              </div>

              <div className="input-row">
                <input
                  id={`phrase-${index}`}
                  type="text"
                  value={phrase}
                  onChange={(e) => handlePhraseChange(index, e.target.value)}
                  placeholder={getPhrasePrompt(index)}
                  maxLength={500}
                  className="premium-input"
                  disabled={isLoading}
                />
                {index > 0 && showAllInputs && (
                  <button
                    type="button"
                    onClick={() => removePhrase(index)}
                    className="delete-btn"
                    disabled={isLoading}
                    title="Remove Phrase"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="action-row">
          {!showAllInputs && phrases.length < 10 && (
            <button
              type="button"
              onClick={addMoreInputs}
              className="secondary-btn small-btn"
              disabled={isLoading}
            >
              + Add more training data
            </button>
          )}

          {showAllInputs && phrases.length < 10 && (
            <button
              type="button"
              onClick={addMoreInputs}
              className="secondary-btn small-btn"
              disabled={isLoading}
            >
              + Add expression
            </button>
          )}
        </div>

        <footer className="form-submit-footer">
          <div className="status-indicator">
            <span className={`count-badge ${filledPhrases.length >= 5 ? 'valid' : ''}`}>
              {filledPhrases.length}/10
            </span>
            <span className="count-label">Minimum 5 phrases recommended</span>
          </div>

          {error && (
            <div className="error-callout">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="primary-btn submit-btn"
            disabled={isLoading || filledPhrases.length < 3}
          >
            {isLoading ? (
              <span className="loading-content">
                <span className="themed-spinner mini"></span>
                Analyzing Fingerprint...
              </span>
            ) : 'Analyze My Style'}
          </button>
        </footer>
      </form>

      <style jsx>{`
        .phrase-input-container {
          max-width: 700px;
          margin: 0 auto;
        }

        .input-header {
          text-align: center;
          margin-bottom: var(--space-xl);
        }

        .badge-pill {
            background: rgba(99, 102, 241, 0.1);
            color: var(--primary);
            padding: 0.2rem 0.8rem;
            border-radius: var(--radius-full);
            font-size: 0.75rem;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            border: 1px solid rgba(99, 102, 241, 0.2);
        }

        .input-header h2 {
          color: var(--text-primary);
          font-size: 2.2rem;
          margin: var(--space-md) 0;
        }

        .input-header p {
          color: var(--text-secondary);
          max-width: 500px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .phrase-form {
          padding: var(--space-xl) !important;
        }

        .phrases-scroll_area {
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
        }

        .input-field-group {
          margin-bottom: var(--space-lg);
        }

        .field-label-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.5rem;
        }

        .group-label {
          font-weight: 800;
          color: var(--text-secondary);
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .optional {
          color: var(--text-secondary);
          opacity: 0.5;
          margin-left: 0.5rem;
          font-weight: 400;
        }

        .char-indicator {
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--text-secondary);
          opacity: 0.5;
        }

        .input-row {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }

        .premium-input {
          flex: 1;
          padding: 1rem;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid var(--border-glass);
          border-radius: var(--radius-md);
          color: var(--text-primary);
          font-size: 1rem;
          transition: all var(--transition-fast);
        }

        .premium-input:focus {
          outline: none;
          border-color: var(--primary);
          background: rgba(0, 0, 0, 0.3);
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
        }

        .delete-btn {
          width: 2.2rem;
          height: 2.2rem;
          border: none;
          background: rgba(239, 68, 68, 0.1);
          color: var(--danger);
          border-radius: 50%;
          cursor: pointer;
          font-size: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .delete-btn:hover { background: var(--danger); color: white; }

        .action-row {
          margin: var(--space-lg) 0;
          display: flex;
          justify-content: center;
        }

        .small-btn {
            font-size: 0.85rem;
            padding: 0.4rem 1rem;
        }

        .form-submit-footer {
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
          align-items: center;
          margin-top: var(--space-xl);
          padding-top: var(--space-xl);
          border-top: 1px solid var(--border-glass);
        }

        .status-indicator {
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .count-badge {
            background: rgba(255, 255, 255, 0.1);
            color: var(--text-secondary);
            padding: 0.2rem 0.6rem;
            border-radius: var(--radius-sm);
            font-weight: 800;
            font-size: 0.8rem;
        }

        .count-badge.valid {
            background: rgba(16, 185, 129, 0.1);
            color: var(--accent);
        }

        .count-label {
            font-size: 0.85rem;
            font-weight: 600;
            color: var(--text-secondary);
            opacity: 0.8;
        }

        .error-callout {
          color: var(--danger);
          background: rgba(239, 68, 68, 0.1);
          padding: 0.75rem var(--space-lg);
          border-radius: var(--radius-md);
          font-size: 0.9rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          width: 100%;
        }

        .submit-btn {
          padding: 1rem 3rem;
          font-size: 1.1rem;
          font-weight: 800;
          min-width: 280px;
        }

        .loading-content {
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .themed-spinner.mini { width: 18px; height: 18px; border-width: 2px; }

        @media (max-width: 600px) {
          .phrase-input-container { padding: 1rem; }
          .input-header h2 { font-size: 1.8rem; }
          .submit-btn { width: 100%; }
        }
      `}</style>
    </div>
  );
};

function getPhrasePrompt(index: number): string {
  const prompts = [
    "e.g., Let's catch up later today.",
    "e.g., I'm just playing it by ear.",
    "e.g., That makes a lot of sense.",
    "e.g., Sorry, I'm running behind.",
    "e.g., No worries, take your time.",
    "e.g., Can you send me that link?",
    "e.g., I'll handle that right away.",
    "e.g., What's the plan for tonight?",
    "e.g., That sounds like a great idea.",
    "e.g., Let's touch base tomorrow."
  ];
  return prompts[index] || "Enter a phrase you commonly use...";
}
