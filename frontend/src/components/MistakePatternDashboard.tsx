import React from 'react';

interface MistakeCategory {
  type: string;
  totalOccurrences: number;
  improvementRate: number;
  masteryLevel: string;
  focusLevel: string;
  currentAccuracy: number;
  targetAccuracy: number;
}

interface MicroLesson {
  id: string;
  title: string;
  targetMistakes: string[];
  difficulty: number;
  estimatedDuration: number;
  content: {
    explanation: string;
    rule: string;
    commonErrors: string[];
    tips: string[];
  };
  completionStatus: string;
}

interface ImprovementTrend {
  mistakeType: string;
  overallTrend: string;
  recentImprovement: boolean;
  plateauDetected: boolean;
}

interface MistakePatternDashboardProps {
  mistakeCategories: MistakeCategory[];
  personalizedLessons: MicroLesson[];
  improvementTrends: ImprovementTrend[];
  isLoading?: boolean;
}

const MISTAKE_TYPE_LABELS: Record<string, string> = {
  verb_conjugation: 'Verb Conjugation',
  gender_agreement: 'Gender Agreement',
  ser_vs_estar: 'Ser vs Estar',
  article_usage: 'Article Usage',
  prepositions: 'Prepositions',
  subjunctive: 'Subjunctive',
  word_order: 'Word Order',
  accent_marks: 'Accent Marks',
  plural_forms: 'Plural Forms',
  reflexive_verbs: 'Reflexive Verbs'
};

const MASTERY_COLORS: Record<string, string> = {
  struggling: '#ef4444',
  developing: '#f59e0b',
  improving: '#3b82f6',
  proficient: '#10b981',
  mastered: '#059669'
};

const FOCUS_LEVEL_COLORS: Record<string, string> = {
  low: '#94a3b8',
  medium: '#f59e0b',
  high: '#ef4444',
  urgent: '#dc2626'
};

const TREND_ICONS: Record<string, string> = {
  improving: '📈',
  stable: '➡️',
  declining: '📉',
  fluctuating: '📊'
};

export const MistakePatternDashboard: React.FC<MistakePatternDashboardProps> = ({
  mistakeCategories,
  personalizedLessons,
  improvementTrends,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="mistake-dashboard loading">
        <div className="loading-spinner"></div>
        <p>Loading mistake patterns...</p>
      </div>
    );
  }

  const strugglingAreas = mistakeCategories
    .filter(cat => cat.focusLevel === 'high' || cat.totalOccurrences > 3)
    .sort((a, b) => b.totalOccurrences - a.totalOccurrences);

  const improvingAreas = mistakeCategories
    .filter(cat => cat.improvementRate > 0)
    .sort((a, b) => b.improvementRate - a.improvementRate);

  return (
    <div className="mistake-dashboard">
      <div className="dashboard-header">
        <h2>🎯 Grammar Coaching</h2>
        <p>Track your Spanish grammar progress and get personalized lessons</p>
      </div>

      {/* Focus Areas */}
      {strugglingAreas.length > 0 && (
        <div className="focus-section">
          <h3>🔥 Areas Needing Attention</h3>
          <div className="mistake-categories">
            {strugglingAreas.slice(0, 3).map(category => (
              <div key={category.type} className="mistake-category-card">
                <div className="category-header">
                  <h4>{MISTAKE_TYPE_LABELS[category.type] || category.type}</h4>
                  <span 
                    className="focus-badge"
                    style={{ backgroundColor: FOCUS_LEVEL_COLORS[category.focusLevel] }}
                  >
                    {category.focusLevel} priority
                  </span>
                </div>

                <div className="mistake-stats">
                  <div className="stat">
                    <span className="stat-label">Mistakes</span>
                    <span className="stat-value">{category.totalOccurrences}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Accuracy</span>
                    <span className="stat-value">{category.currentAccuracy}%</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Target</span>
                    <span className="stat-value">{category.targetAccuracy}%</span>
                  </div>
                </div>

                <div className="accuracy-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${(category.currentAccuracy / category.targetAccuracy) * 100}%`,
                        backgroundColor: MASTERY_COLORS[category.masteryLevel]
                      }}
                    ></div>
                  </div>
                  <span className="mastery-level">{category.masteryLevel}</span>
                </div>

                {category.improvementRate !== 0 && (
                  <div className="improvement-indicator">
                    {category.improvementRate > 0 ? (
                      <span className="improving">📈 +{category.improvementRate.toFixed(1)}% improving</span>
                    ) : (
                      <span className="declining">📉 {category.improvementRate.toFixed(1)}% needs work</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Personalized Lessons */}
      {personalizedLessons.length > 0 && (
        <div className="lessons-section">
          <h3>📚 Personalized Micro-Lessons</h3>
          <div className="lessons-grid">
            {personalizedLessons.slice(0, 3).map(lesson => (
              <div key={lesson.id} className="lesson-card">
                <div className="lesson-header">
                  <h4>{lesson.title}</h4>
                  <div className="lesson-meta">
                    <span className="duration">{lesson.estimatedDuration} min</span>
                    <span className="difficulty">Level {lesson.difficulty}</span>
                  </div>
                </div>

                <p className="lesson-explanation">{lesson.content.explanation}</p>

                <div className="lesson-rule">
                  <strong>Rule:</strong> {lesson.content.rule}
                </div>

                {lesson.content.commonErrors.length > 0 && (
                  <div className="common-errors">
                    <strong>Common Errors:</strong>
                    <div className="error-examples">
                      {lesson.content.commonErrors.slice(0, 2).map((error, index) => (
                        <span key={index} className="error-example">❌ {error}</span>
                      ))}
                    </div>
                  </div>
                )}

                {lesson.content.tips.length > 0 && (
                  <div className="lesson-tips">
                    <strong>Tips:</strong>
                    <ul>
                      {lesson.content.tips.slice(0, 2).map((tip, index) => (
                        <li key={index}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="lesson-targets">
                  <strong>Focuses on:</strong>
                  {lesson.targetMistakes.map(mistake => (
                    <span key={mistake} className="target-mistake">
                      {MISTAKE_TYPE_LABELS[mistake] || mistake}
                    </span>
                  ))}
                </div>

                <div className="lesson-status">
                  <span className={`status-badge ${lesson.completionStatus}`}>
                    {lesson.completionStatus.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Improvement Trends */}
      {improvementTrends.length > 0 && (
        <div className="trends-section">
          <h3>📊 Progress Trends</h3>
          <div className="trends-grid">
            {improvementTrends.slice(0, 4).map(trend => (
              <div key={trend.mistakeType} className="trend-card">
                <div className="trend-header">
                  <span className="trend-icon">{TREND_ICONS[trend.overallTrend]}</span>
                  <h4>{MISTAKE_TYPE_LABELS[trend.mistakeType] || trend.mistakeType}</h4>
                </div>
                
                <div className="trend-status">
                  <span className={`trend-label ${trend.overallTrend}`}>
                    {trend.overallTrend}
                  </span>
                  
                  {trend.recentImprovement && (
                    <span className="recent-improvement">✨ Recent progress!</span>
                  )}
                  
                  {trend.plateauDetected && (
                    <span className="plateau-warning">⚠️ Plateau detected</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Overall Stats */}
      <div className="stats-overview">
        <div className="stats-grid">
          <div className="stat-card">
            <h4>🎯 Focus Areas</h4>
            <span className="stat-number">{strugglingAreas.length}</span>
            <span className="stat-label">grammar points</span>
          </div>
          
          <div className="stat-card">
            <h4>📈 Improving</h4>
            <span className="stat-number">{improvingAreas.length}</span>
            <span className="stat-label">areas</span>
          </div>
          
          <div className="stat-card">
            <h4>📚 Lessons</h4>
            <span className="stat-number">{personalizedLessons.length}</span>
            <span className="stat-label">available</span>
          </div>
          
          <div className="stat-card">
            <h4>✅ Total Corrections</h4>
            <span className="stat-number">
              {mistakeCategories.reduce((sum, cat) => sum + cat.totalOccurrences, 0)}
            </span>
            <span className="stat-label">mistakes learned from</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .mistake-dashboard {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .dashboard-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .dashboard-header h2 {
          margin: 0 0 8px 0;
          color: #1f2937;
        }

        .dashboard-header p {
          color: #6b7280;
          margin: 0;
        }

        .focus-section, .lessons-section, .trends-section {
          margin-bottom: 30px;
        }

        .focus-section h3, .lessons-section h3, .trends-section h3 {
          margin-bottom: 16px;
          color: #374151;
        }

        .mistake-categories {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 16px;
        }

        .mistake-category-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .category-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .category-header h4 {
          margin: 0;
          color: #1f2937;
        }

        .focus-badge {
          color: white;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          text-transform: capitalize;
        }

        .mistake-stats {
          display: flex;
          gap: 16px;
          margin-bottom: 12px;
        }

        .stat {
          text-align: center;
        }

        .stat-label {
          display: block;
          font-size: 12px;
          color: #6b7280;
          margin-bottom: 2px;
        }

        .stat-value {
          display: block;
          font-size: 18px;
          font-weight: bold;
          color: #1f2937;
        }

        .accuracy-progress {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }

        .progress-bar {
          flex: 1;
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          transition: width 0.3s ease;
        }

        .mastery-level {
          font-size: 12px;
          color: #6b7280;
          text-transform: capitalize;
        }

        .improvement-indicator {
          font-size: 14px;
        }

        .improving { color: #059669; }
        .declining { color: #dc2626; }

        .lessons-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 20px;
        }

        .lesson-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .lesson-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .lesson-header h4 {
          margin: 0;
          color: #1f2937;
          flex: 1;
        }

        .lesson-meta {
          display: flex;
          gap: 8px;
        }

        .duration, .difficulty {
          background: #f3f4f6;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 12px;
          color: #6b7280;
        }

        .lesson-explanation {
          color: #374151;
          margin-bottom: 12px;
          line-height: 1.5;
        }

        .lesson-rule {
          background: #f0f9ff;
          padding: 8px 12px;
          border-radius: 6px;
          margin-bottom: 12px;
          font-size: 14px;
          color: #0369a1;
        }

        .common-errors {
          margin-bottom: 12px;
          font-size: 14px;
        }

        .error-examples {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 4px;
        }

        .error-example {
          background: #fef2f2;
          color: #dc2626;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 12px;
        }

        .lesson-tips ul {
          margin: 4px 0 0 0;
          padding-left: 16px;
        }

        .lesson-tips li {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 2px;
        }

        .lesson-targets {
          margin: 12px 0;
          font-size: 14px;
        }

        .target-mistake {
          background: #fef3c7;
          color: #92400e;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 12px;
          margin-left: 4px;
        }

        .lesson-status {
          margin-top: 12px;
        }

        .status-badge {
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          text-transform: capitalize;
        }

        .status-badge.not_started {
          background: #f3f4f6;
          color: #6b7280;
        }

        .status-badge.in_progress {
          background: #dbeafe;
          color: #1d4ed8;
        }

        .status-badge.completed {
          background: #dcfce7;
          color: #166534;
        }

        .trends-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .trend-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 16px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .trend-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .trend-icon {
          font-size: 20px;
        }

        .trend-header h4 {
          margin: 0;
          color: #1f2937;
          font-size: 14px;
        }

        .trend-status {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .trend-label {
          font-size: 12px;
          font-weight: 600;
          text-transform: capitalize;
        }

        .trend-label.improving { color: #059669; }
        .trend-label.stable { color: #6b7280; }
        .trend-label.declining { color: #dc2626; }
        .trend-label.fluctuating { color: #f59e0b; }

        .recent-improvement {
          color: #059669;
          font-size: 11px;
        }

        .plateau-warning {
          color: #f59e0b;
          font-size: 11px;
        }

        .stats-overview {
          margin-top: 30px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 16px;
        }

        .stat-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 20px;
          text-align: center;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .stat-card h4 {
          margin: 0 0 8px 0;
          color: #6b7280;
          font-size: 14px;
        }

        .stat-number {
          display: block;
          font-size: 32px;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 4px;
        }

        .stat-label {
          color: #6b7280;
          font-size: 14px;
        }

        .loading {
          text-align: center;
          padding: 40px;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e5e7eb;
          border-top: 4px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 16px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
