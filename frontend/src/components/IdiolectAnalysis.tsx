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
        <div className="loading-state">
          <div className="spinner"></div>
          <h3>Analyzing your speaking style...</h3>
          <p>This may take a few seconds</p>
        </div>
        <style jsx>{`
          .analysis-container {
            max-width: 800px;
            margin: 2rem auto;
            padding: 2rem;
          }
          .loading-state {
            text-align: center;
            padding: 3rem;
          }
          .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #e2e8f0;
            border-top: 4px solid #4299e1;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 1rem;
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
    <div className="analysis-container">
      <div className="analysis-header">
        <h2>Your Speaking Style Analysis</h2>
        <p>Based on {phrases.length} phrase{phrases.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="analysis-grid">
        {/* Overall Style */}
        <div className="analysis-card">
          <h3>Overall Style</h3>
          <div className="style-metrics">
            <div className="metric">
              <span className="metric-label">Tone:</span>
              <span className="metric-value tone-badge">
                {profile.overallTone}
              </span>
            </div>
            <div className="metric">
              <span className="metric-label">Formality:</span>
              <span className="metric-value formality-badge">
                {profile.overallFormality}
              </span>
            </div>
            <div className="metric">
              <span className="metric-label">Analysis Count:</span>
              <span className="metric-value">
                {profile.analysisCount}
              </span>
            </div>
          </div>
        </div>

        {/* Language Patterns */}
        <div className="analysis-card">
          <h3>Language Patterns</h3>
          <div className="patterns-list">
            {profile.commonPatterns.slice(0, 3).map((pattern, index) => (
              <div key={index} className="pattern-item">
                <div className="pattern-header">
                  <span className="pattern-name">
                    {pattern.type.replace('_', ' ')}
                  </span>
                  <span className="pattern-frequency">
                    {pattern.frequency > 0.7 ? 'High' : pattern.frequency > 0.4 ? 'Medium' : 'Low'}
                  </span>
                </div>
                <p className="pattern-description">{pattern.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Intent Distribution */}
        <div className="analysis-card">
          <h3>Topics You Talk About</h3>
          <div className="intent-distribution">
            {Object.entries(intentCounts)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 4)
              .map(([intent, count]) => (
                <div key={intent} className="intent-item">
                  <div className="intent-bar">
                    <div 
                      className="intent-fill"
                      style={{ width: `${(count / phrases.length) * 100}%` }}
                    ></div>
                  </div>
                  <div className="intent-label">
                    <span>{intent}</span>
                    <span className="intent-count">{count}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Your Phrases */}
        <div className="analysis-card phrases-card">
          <h3>Your Phrases</h3>
          <div className="phrases-list">
            {phrases.map((phrase, index) => (
              <div key={phrase.phraseId} className="phrase-item">
                <div className="phrase-text">"{phrase.englishText}"</div>
                <div className="phrase-meta">
                  <span className={`intent-tag intent-${phrase.intent}`}>
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
          margin: 2rem auto;
          padding: 2rem;
        }

        .analysis-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .analysis-header h2 {
          color: #2d3748;
          margin-bottom: 0.5rem;
        }

        .analysis-header p {
          color: #718096;
        }

        .analysis-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .analysis-card {
          background: white;
          border-radius: 0.75rem;
          padding: 1.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          border: 1px solid #e2e8f0;
        }

        .analysis-card h3 {
          color: #2d3748;
          margin-bottom: 1rem;
          font-size: 1.1rem;
        }

        .style-metrics {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .metric {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .metric-label {
          color: #718096;
          font-weight: 500;
        }

        .metric-value {
          font-weight: 600;
          color: #2d3748;
        }

        .tone-badge, .formality-badge {
          background-color: #ebf8ff;
          color: #2b6cb0;
          padding: 0.25rem 0.75rem;
          border-radius: 1rem;
          font-size: 0.875rem;
        }

        .patterns-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .pattern-item {
          border-left: 3px solid #4299e1;
          padding-left: 1rem;
        }

        .pattern-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .pattern-name {
          font-weight: 600;
          color: #2d3748;
        }

        .pattern-frequency {
          background-color: #f0fff4;
          color: #22543d;
          padding: 0.125rem 0.5rem;
          border-radius: 0.5rem;
          font-size: 0.75rem;
        }

        .pattern-description {
          color: #718096;
          font-size: 0.875rem;
          margin-bottom: 0.5rem;
        }

        .pattern-examples {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .example-tag {
          background-color: #f7fafc;
          color: #4a5568;
          padding: 0.125rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          font-style: italic;
        }

        .intent-distribution {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .intent-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .intent-bar {
          height: 0.5rem;
          background-color: #f1f5f9;
          border-radius: 0.25rem;
          overflow: hidden;
        }

        .intent-fill {
          height: 100%;
          background-color: #4299e1;
          transition: width 0.3s ease;
        }

        .intent-label {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;
        }

        .intent-count {
          color: #718096;
        }

        .phrases-card {
          grid-column: 1 / -1;
        }

        .phrases-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          max-height: 300px;
          overflow-y: auto;
        }

        .phrase-item {
          padding: 1rem;
          background-color: #f8fafc;
          border-radius: 0.5rem;
          border-left: 3px solid #e2e8f0;
        }

        .phrase-text {
          color: #2d3748;
          margin-bottom: 0.5rem;
          font-style: italic;
        }

        .phrase-meta {
          display: flex;
          gap: 0.5rem;
        }

        .intent-tag {
          padding: 0.125rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .intent-work { background-color: #ebf8ff; color: #2b6cb0; }
        .intent-family { background-color: #f0fff4; color: #22543d; }
        .intent-errands { background-color: #fef5e7; color: #c05621; }
        .intent-social { background-color: #fdf2f8; color: #97266d; }
        .intent-casual { background-color: #f0f9ff; color: #0369a1; }
        .intent-formal { background-color: #f8fafc; color: #475569; }
        .intent-other { background-color: #f1f5f9; color: #64748b; }

        @media (max-width: 768px) {
          .analysis-grid {
            grid-template-columns: 1fr;
          }
          
          .analysis-container {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
};
