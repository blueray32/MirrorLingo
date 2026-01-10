import React from 'react';
import {
  IdiolectProfile,
  Phrase,
  getToneDisplayName,
  getFormalityDisplayName,
  getIntentDisplayName,
  getPatternDisplayName
} from '../types/phrases';

interface IdiolectAnalysisProps {
  phrases: Phrase[];
  profile: IdiolectProfile | null;
  isLoading?: boolean;
}

export const IdiolectAnalysis: React.FC<IdiolectAnalysisProps> = ({
  phrases,
  profile,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="analysis-container">
        <div className="loading-state glass-card">
          <div className="themed-spinner"></div>
          <h3>Analyzing your <span className="highlight">Speaking Style</span></h3>
          <p>Extracting unique patterns from your speech...</p>
        </div>
        <style jsx>{`
          .analysis-container {
            max-width: 1000px;
            margin: 2rem auto;
            padding: var(--space-lg);
          }
          .loading-state {
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
            border-bottom: 3px solid var(--secondary);
            border-radius: 50%;
            animation: spin 1s cubic-bezier(0.5, 0, 0.5, 1) infinite;
            margin: 0 auto var(--space-md);
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!profile || phrases.length === 0) {
    return null;
  }

  const intentCounts = phrases.reduce((acc, phrase) => {
    acc[phrase.intent] = (acc[phrase.intent] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="analysis-container fade-in">
      <div className="analysis-header">
        <h2>Your <span className="highlight">Mirror Analysis</span></h2>
        <p>Synthesized from {phrases.length} recorded phrase{phrases.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="analysis-grid">
        {/* Overall Style */}
        <div className="analysis-card glass-card">
          <h3>Core Identity</h3>
          <div className="style-metrics">
            <div className="metric">
              <span className="metric-label">Vibe</span>
              <span className="badge primary-badge">
                {profile.overallTone}
              </span>
            </div>
            <div className="metric">
              <span className="metric-label">Formality</span>
              <span className="badge secondary-badge">
                {profile.overallFormality}
              </span>
            </div>
            <div className="metric">
              <span className="metric-label">Complexity</span>
              <span className="metric-value">
                {profile.analysisCount > 5 ? 'Elevated' : 'Developing'}
              </span>
            </div>
          </div>
        </div>

        {/* Intent Distribution */}
        <div className="analysis-card glass-card">
          <h3>Topic Focus</h3>
          <div className="intent-distribution">
            {Object.entries(intentCounts)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 4)
              .map(([intent, count]) => (
                <div key={intent} className="intent-item">
                  <div className="intent-label">
                    <span className="intent-name">{intent}</span>
                    <span className="intent-percentage">{Math.round((count / phrases.length) * 100)}%</span>
                  </div>
                  <div className="intent-bar">
                    <div
                      className="intent-fill"
                      style={{
                        width: `${(count / phrases.length) * 100}%`,
                        background: `linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)`
                      }}
                    ></div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Language Patterns */}
        <div className="analysis-card glass-card pattern-card">
          <h3>Signature Patterns</h3>
          <div className="patterns-list">
            {profile.commonPatterns.slice(0, 2).map((pattern, index) => (
              <div key={index} className="pattern-item">
                <div className="pattern-header">
                  <span className="pattern-name">
                    {pattern.type.replace('_', ' ')}
                  </span>
                  <span className="pattern-badge accent-badge">
                    {pattern.frequency > 0.7 ? 'High' : 'Frequent'}
                  </span>
                </div>
                <p className="pattern-description">{pattern.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Captures */}
        <div className="analysis-card glass-card phrases-card">
          <h3>Recent Style Captures</h3>
          <div className="phrases-list">
            {phrases.slice(0, 5).map((phrase, index) => (
              <div key={phrase.phraseId} className="phrase-item">
                <div className="phrase-text">"{phrase.englishText}"</div>
                <div className="phrase-meta">
                  <span className={`mini-badge intent-tag`}>
                    {phrase.intent}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .analysis-container {
          max-width: 1000px;
          margin: 3rem auto;
          padding: 0 var(--space-lg);
        }

        .analysis-header {
          text-align: center;
          margin-bottom: var(--space-xl);
        }

        .highlight {
          background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .analysis-header h2 {
          font-size: 2.25rem;
          margin-bottom: 0.5rem;
          color: var(--text-primary);
        }

        .analysis-header p {
          color: var(--text-secondary);
          font-weight: 500;
        }

        .analysis-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-lg);
        }

        .analysis-card {
          padding: var(--space-lg);
          display: flex;
          flex-direction: column;
        }

        .analysis-card h3 {
          color: var(--text-primary);
          margin-bottom: var(--space-lg);
          font-size: 1.1rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          opacity: 0.8;
        }

        .style-metrics {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .metric {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 0;
          border-bottom: 1px solid var(--border-glass);
        }

        .metric:last-child {
            border-bottom: none;
        }

        .metric-label {
          color: var(--text-secondary);
          font-weight: 600;
          font-size: 0.95rem;
        }

        .metric-value {
          font-weight: 700;
          color: var(--text-primary);
        }

        .badge {
          padding: 0.4rem 1rem;
          border-radius: var(--radius-full);
          font-size: 0.85rem;
          font-weight: 700;
          text-transform: capitalize;
        }

        .primary-badge { 
            background: rgba(99, 102, 241, 0.15); 
            color: var(--primary);
            border: 1px solid rgba(99, 102, 241, 0.3);
        }
        .secondary-badge { 
            background: rgba(236, 72, 153, 0.15); 
            color: var(--secondary);
            border: 1px solid rgba(236, 72, 153, 0.3);
        }
        .accent-badge { 
            background: rgba(16, 185, 129, 0.15); 
            color: var(--accent);
            border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .intent-distribution {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .intent-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .intent-label {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
          font-weight: 600;
        }

        .intent-name { color: var(--text-primary); text-transform: capitalize; }
        .intent-percentage { color: var(--text-secondary); }

        .intent-bar {
          height: 0.6rem;
          background-color: rgba(255, 255, 255, 0.05);
          border-radius: var(--radius-full);
          overflow: hidden;
        }

        .intent-fill {
          height: 100%;
          border-radius: var(--radius-full);
          transition: width 1s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .patterns-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .pattern-item {
          padding: var(--space-md);
          background: rgba(255, 255, 255, 0.03);
          border-radius: var(--radius-md);
          border-left: 3px solid var(--accent);
        }

        .pattern-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .pattern-name {
          font-weight: 700;
          color: var(--text-primary);
          text-transform: capitalize;
        }

        .pattern-badge {
            font-size: 0.7rem;
            padding: 0.2rem 0.5rem;
            border-radius: var(--radius-full);
            background: rgba(16, 185, 129, 0.1);
            color: var(--accent);
        }

        .pattern-description {
          color: var(--text-secondary);
          font-size: 0.85rem;
          line-height: 1.5;
        }

        .phrases-card {
          grid-column: 1 / -1;
        }

        .phrases-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: var(--space-md);
        }

        .phrase-item {
          padding: 1.25rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: var(--radius-md);
          border: 1px solid var(--border-glass);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .phrase-text {
          color: var(--text-primary);
          margin-bottom: var(--space-sm);
          font-weight: 500;
          font-style: italic;
          font-size: 0.95rem;
        }

        .mini-badge {
            align-self: flex-start;
            font-size: 0.75rem;
            color: var(--text-secondary);
            background: rgba(255, 255, 255, 0.1);
            padding: 0.2rem 0.6rem;
            border-radius: var(--radius-sm);
            text-transform: capitalize;
        }

        @media (max-width: 768px) {
          .analysis-grid {
            grid-template-columns: 1fr;
          }
          
          .phrases-list {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};
