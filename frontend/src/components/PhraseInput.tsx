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

    // Clear error when user starts typing
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
    <div className="phrase-input-container">
      <div className="header">
        <h2>Tell us how you speak</h2>
        <p>Enter 5-10 common English phrases you use in daily life. We'll analyze your speaking style to create personalized Spanish lessons.</p>
      </div>

      <form onSubmit={handleSubmit} className="phrase-form">
        <div className="phrases-list">
          {displayPhrases.map((phrase, index) => (
            <div key={index} className="phrase-input-group">
              <label htmlFor={`phrase-${index}`} className="phrase-label">
                Phrase {index + 1}
                {index >= 5 && (
                  <span className="optional-label">(optional)</span>
                )}
              </label>
              <div className="input-with-remove">
                <input
                  id={`phrase-${index}`}
                  type="text"
                  value={phrase}
                  onChange={(e) => handlePhraseChange(index, e.target.value)}
                  placeholder={getPhrasePrompt(index)}
                  maxLength={500}
                  className="phrase-input"
                  disabled={isLoading}
                />
                {index > 0 && showAllInputs && (
                  <button
                    type="button"
                    onClick={() => removePhrase(index)}
                    className="remove-phrase-btn"
                    disabled={isLoading}
                  >
                    ×
                  </button>
                )}
              </div>
              <div className="char-count">
                {phrase.length}/500
              </div>
            </div>
          ))}
        </div>

        {!showAllInputs && phrases.length < 10 && (
          <button
            type="button"
            onClick={addMoreInputs}
            className="add-more-btn"
            disabled={isLoading}
          >
            Add more phrases (optional)
          </button>
        )}

        {showAllInputs && phrases.length < 10 && (
          <button
            type="button"
            onClick={addMoreInputs}
            className="add-phrase-btn"
            disabled={isLoading}
          >
            + Add another phrase
          </button>
        )}

        <div className="form-footer">
          <div className="phrase-count">
            {filledPhrases.length} phrase{filledPhrases.length !== 1 ? 's' : ''} entered
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="analyze-btn"
            disabled={isLoading || filledPhrases.length === 0}
          >
            {isLoading ? 'Analyzing your style...' : 'Analyze My Speaking Style'}
          </button>
        </div>
      </form>

      <style jsx>{`
        .phrase-input-container {
          max-width: 600px;
          margin: 0 auto;
          padding: 2rem;
        }

        .header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .header h2 {
          color: #2d3748;
          margin-bottom: 0.5rem;
        }

        .header p {
          color: #718096;
          line-height: 1.5;
        }

        .phrase-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .phrases-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .phrase-input-group {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .phrase-label {
          font-weight: 500;
          color: #4a5568;
          font-size: 0.9rem;
        }

        .optional-label {
          color: #a0aec0;
          font-weight: normal;
          margin-left: 0.5rem;
        }

        .input-with-remove {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .phrase-input {
          flex: 1;
          padding: 0.75rem;
          border: 2px solid #e2e8f0;
          border-radius: 0.5rem;
          font-size: 1rem;
          transition: border-color 0.2s;
        }

        .phrase-input:focus {
          outline: none;
          border-color: #4299e1;
        }

        .phrase-input:disabled {
          background-color: #f7fafc;
          cursor: not-allowed;
        }

        .remove-phrase-btn {
          width: 2rem;
          height: 2rem;
          border: none;
          background-color: #fed7d7;
          color: #e53e3e;
          border-radius: 50%;
          cursor: pointer;
          font-size: 1.2rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .remove-phrase-btn:hover {
          background-color: #feb2b2;
        }

        .char-count {
          font-size: 0.75rem;
          color: #a0aec0;
          text-align: right;
        }

        .add-more-btn, .add-phrase-btn {
          padding: 0.5rem 1rem;
          border: 2px dashed #cbd5e0;
          background: none;
          color: #718096;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .add-more-btn:hover, .add-phrase-btn:hover {
          border-color: #4299e1;
          color: #4299e1;
        }

        .form-footer {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          align-items: center;
          margin-top: 1rem;
        }

        .phrase-count {
          font-size: 0.9rem;
          color: #718096;
        }

        .error-message {
          color: #e53e3e;
          background-color: #fed7d7;
          padding: 0.75rem;
          border-radius: 0.5rem;
          text-align: center;
          width: 100%;
        }

        .analyze-btn {
          padding: 1rem 2rem;
          background-color: #4299e1;
          color: white;
          border: none;
          border-radius: 0.5rem;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
          min-width: 200px;
        }

        .analyze-btn:hover:not(:disabled) {
          background-color: #3182ce;
        }

        .analyze-btn:disabled {
          background-color: #cbd5e0;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

// Helper function for placeholder text
function getPhrasePrompt(index: number): string {
  const prompts = [
    "e.g., Could you take a look at this when you get a chance?",
    "e.g., Hang on, I'm just finishing something up",
    "e.g., No worries, take your time",
    "e.g., I totally forgot to send that email, my bad",
    "e.g., Let me know if you need anything else",
    "e.g., Thanks for getting back to me so quickly",
    "e.g., I'll circle back with you on this",
    "e.g., Does that make sense to you?",
    "e.g., I'm running a bit behind schedule",
    "e.g., Catch you later!"
  ];
  return prompts[index] || "Enter a phrase you commonly use...";
}
