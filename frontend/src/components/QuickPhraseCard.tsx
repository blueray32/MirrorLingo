import React, { useState } from 'react';
import { Phrase } from '../types/phrases';

interface QuickPhraseCardProps {
  phrase: Phrase;
  onAudioClick?: () => void;
}

export const QuickPhraseCard: React.FC<QuickPhraseCardProps> = ({
  phrase,
  onAudioClick
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className={`phrase-card ${isFlipped ? 'flipped' : ''}`}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className="card-inner">
        <div className="card-front glass-card">
          <div className="card-content">
            <span className="language-badge english">English</span>
            <p className="primary-text">{phrase.englishText}</p>
            <div className="card-footer">
              <span className="tap-hint">Tap to see Spanish 🔄</span>
            </div>
          </div>
        </div>
        <div className="card-back glass-card gradient-bg">
          <div className="card-content">
            <span className="language-badge spanish">Spanish</span>
            <p className="primary-text">{phrase.spanishText}</p>
            <div className="card-footer">
              <button
                className="action-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onAudioClick?.();
                }}
              >
                🔊 Listen
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .phrase-card {
          perspective: 1200px;
          width: 100%;
          height: 220px;
          cursor: pointer;
          margin: var(--space-md) 0;
        }

        .card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          text-align: center;
          transition: transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1);
          transform-style: preserve-3d;
        }

        .phrase-card.flipped .card-inner {
          transform: rotateY(180deg);
        }

        .card-front, .card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-lg);
          border: 1px solid var(--border-glass);
        }

        .card-front {
          background: rgba(255, 255, 255, 0.05);
        }

        .card-back {
          transform: rotateY(180deg);
        }

        .gradient-bg {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%);
          border-color: var(--primary);
        }

        .card-content {
          display: flex;
          flex-direction: column;
          height: 100%;
          justify-content: space-between;
          width: 100%;
        }

        .language-badge {
          align-self: flex-start;
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          padding: 0.3rem 0.8rem;
          border-radius: var(--radius-full);
        }

        .language-badge.english {
          background: rgba(255, 255, 255, 0.1);
          color: var(--text-secondary);
        }

        .language-badge.spanish {
          background: var(--primary);
          color: white;
        }

        .primary-text {
          font-size: 1.3rem;
          font-weight: 700;
          line-height: 1.4;
          margin: var(--space-md) 0;
          flex-grow: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-primary);
        }

        .card-footer {
          margin-top: auto;
        }

        .action-btn {
          background: white;
          border: none;
          color: var(--primary);
          padding: 0.6rem 1.2rem;
          border-radius: var(--radius-full);
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0 auto;
          cursor: pointer;
          transition: all var(--transition-fast);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        }

        .action-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 15px rgba(0, 0, 0, 0.3);
        }

        .tap-hint {
          font-size: 0.85rem;
          color: var(--text-secondary);
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};
