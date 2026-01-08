import React, { useState, useEffect } from 'react'
import { Phrase, IdiolectProfile } from '../types/phrases'

interface AnalyticsDashboardProps {
  phrases: Phrase[]
  profile: IdiolectProfile
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  phrases,
  profile
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'progress' | 'patterns'>('overview')

  const stats = {
    totalPhrases: phrases.length,
    averageConfidence: Math.round(phrases.reduce((sum, p) => sum + (p.analysis?.confidence || 0), 0) / phrases.length * 100),
    mostCommonIntent: getMostCommonIntent(phrases),
    learningStreak: 7, // Mock data
    masteredPhrases: Math.floor(phrases.length * 0.3),
    practiceTime: 45 // minutes
  }

  return (
    <div className="analytics-dashboard">
      <div className="dashboard-header">
        <h2>📊 Your Learning Analytics</h2>
        <div className="tab-navigation">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('progress')}
            className={`tab-btn ${activeTab === 'progress' ? 'active' : ''}`}
          >
            Progress
          </button>
          <button 
            onClick={() => setActiveTab('patterns')}
            className={`tab-btn ${activeTab === 'patterns' ? 'active' : ''}`}
          >
            Patterns
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📚</div>
                <div className="stat-value">{stats.totalPhrases}</div>
                <div className="stat-label">Total Phrases</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🎯</div>
                <div className="stat-value">{stats.averageConfidence}%</div>
                <div className="stat-label">Avg Confidence</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🔥</div>
                <div className="stat-value">{stats.learningStreak}</div>
                <div className="stat-label">Day Streak</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⭐</div>
                <div className="stat-value">{stats.masteredPhrases}</div>
                <div className="stat-label">Mastered</div>
              </div>
            </div>

            <div className="quick-insights">
              <h3>Quick Insights</h3>
              <div className="insight-item">
                <span className="insight-icon">💬</span>
                <span>Your most common context is <strong>{stats.mostCommonIntent}</strong></span>
              </div>
              <div className="insight-item">
                <span className="insight-icon">🗣️</span>
                <span>Your speaking style is <strong>{profile.overallTone}</strong> and <strong>{profile.overallFormality}</strong></span>
              </div>
              <div className="insight-item">
                <span className="insight-icon">⏱️</span>
                <span>You've practiced for <strong>{stats.practiceTime} minutes</strong> this week</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="progress-tab">
            <div className="progress-chart">
              <h3>Learning Progress</h3>
              <div className="progress-bars">
                <div className="progress-item">
                  <span className="progress-label">Beginner Phrases</span>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: '85%' }}></div>
                  </div>
                  <span className="progress-percent">85%</span>
                </div>
                <div className="progress-item">
                  <span className="progress-label">Work Context</span>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: '70%' }}></div>
                  </div>
                  <span className="progress-percent">70%</span>
                </div>
                <div className="progress-item">
                  <span className="progress-label">Casual Conversation</span>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: '60%' }}></div>
                  </div>
                  <span className="progress-percent">60%</span>
                </div>
              </div>
            </div>

            <div className="milestones">
              <h3>Recent Milestones</h3>
              <div className="milestone-item completed">
                <span className="milestone-icon">🎉</span>
                <span>Completed first practice session</span>
                <span className="milestone-date">Today</span>
              </div>
              <div className="milestone-item completed">
                <span className="milestone-icon">🔥</span>
                <span>7-day learning streak</span>
                <span className="milestone-date">Yesterday</span>
              </div>
              <div className="milestone-item upcoming">
                <span className="milestone-icon">⭐</span>
                <span>Master 10 phrases</span>
                <span className="milestone-date">3 more to go</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'patterns' && (
          <div className="patterns-tab">
            <div className="pattern-analysis">
              <h3>Your Speaking Patterns</h3>
              <div className="pattern-grid">
                {profile.commonPatterns.map((pattern, index) => (
                  <div key={index} className="pattern-card">
                    <div className="pattern-text">{pattern.description}</div>
                    <div className="pattern-impact">
                      Impact: <span className="impact-level">Medium</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="recommendations">
              <h3>Personalized Recommendations</h3>
              <div className="recommendation-item">
                <span className="rec-icon">💡</span>
                <div className="rec-content">
                  <div className="rec-title">Focus on Formal Phrases</div>
                  <div className="rec-description">Your casual style could benefit from more formal Spanish expressions for professional contexts.</div>
                </div>
              </div>
              <div className="recommendation-item">
                <span className="rec-icon">🎯</span>
                <div className="rec-content">
                  <div className="rec-title">Practice Pronunciation</div>
                  <div className="rec-description">Try recording yourself saying Spanish phrases to improve accent and fluency.</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .analytics-dashboard {
          background: white;
          border-radius: 1rem;
          overflow: hidden;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }

        .dashboard-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 2rem;
        }

        .dashboard-header h2 {
          margin: 0 0 1.5rem 0;
          font-size: 1.5rem;
        }

        .tab-navigation {
          display: flex;
          gap: 1rem;
        }

        .tab-btn {
          padding: 0.5rem 1rem;
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .tab-btn.active {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }

        .dashboard-content {
          padding: 2rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: #f8fafc;
          padding: 1.5rem;
          border-radius: 0.75rem;
          text-align: center;
          border: 2px solid transparent;
          transition: all 0.2s;
        }

        .stat-card:hover {
          border-color: #667eea;
          transform: translateY(-2px);
        }

        .stat-icon {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: #2d3748;
          margin-bottom: 0.25rem;
        }

        .stat-label {
          color: #718096;
          font-size: 0.875rem;
        }

        .quick-insights h3 {
          color: #2d3748;
          margin-bottom: 1rem;
        }

        .insight-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 0;
          border-bottom: 1px solid #e2e8f0;
        }

        .insight-item:last-child {
          border-bottom: none;
        }

        .insight-icon {
          font-size: 1.25rem;
        }

        .progress-chart h3 {
          color: #2d3748;
          margin-bottom: 1.5rem;
        }

        .progress-item {
          display: grid;
          grid-template-columns: 1fr 2fr auto;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .progress-label {
          color: #4a5568;
          font-weight: 500;
        }

        .progress-bar {
          height: 8px;
          background: #e2e8f0;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #48bb78, #38a169);
          transition: width 0.3s ease;
        }

        .progress-percent {
          color: #38a169;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .milestones {
          margin-top: 2rem;
        }

        .milestones h3 {
          color: #2d3748;
          margin-bottom: 1rem;
        }

        .milestone-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border-radius: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .milestone-item.completed {
          background: #f0fff4;
          border-left: 4px solid #38a169;
        }

        .milestone-item.upcoming {
          background: #fffaf0;
          border-left: 4px solid #ed8936;
        }

        .milestone-icon {
          font-size: 1.25rem;
        }

        .milestone-date {
          margin-left: auto;
          color: #718096;
          font-size: 0.875rem;
        }

        .pattern-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .pattern-card {
          background: #f8fafc;
          padding: 1.5rem;
          border-radius: 0.75rem;
          border-left: 4px solid #667eea;
        }

        .pattern-text {
          color: #2d3748;
          margin-bottom: 0.5rem;
        }

        .pattern-impact {
          color: #718096;
          font-size: 0.875rem;
        }

        .impact-level {
          color: #ed8936;
          font-weight: 600;
        }

        .recommendation-item {
          display: flex;
          gap: 1rem;
          padding: 1.5rem;
          background: #f0f9ff;
          border-radius: 0.75rem;
          margin-bottom: 1rem;
        }

        .rec-icon {
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .rec-title {
          color: #2d3748;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .rec-description {
          color: #4a5568;
          font-size: 0.875rem;
          line-height: 1.5;
        }

        @media (max-width: 768px) {
          .dashboard-header {
            padding: 1rem;
          }

          .dashboard-content {
            padding: 1rem;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .tab-navigation {
            flex-direction: column;
            gap: 0.5rem;
          }

          .progress-item {
            grid-template-columns: 1fr;
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  )
}

function getMostCommonIntent(phrases: Phrase[]): string {
  const intentCounts = phrases.reduce((acc, phrase) => {
    acc[phrase.intent] = (acc[phrase.intent] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return Object.entries(intentCounts)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'casual'
}
