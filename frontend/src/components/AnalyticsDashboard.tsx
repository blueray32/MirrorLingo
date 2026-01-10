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
    averageConfidence: Math.round(phrases.reduce((sum, p) => sum + (p.analysis?.confidence || 0), 0) / (phrases.length || 1) * 100),
    mostCommonIntent: getMostCommonIntent(phrases),
    learningStreak: 7, // Mock data
    masteredPhrases: Math.floor(phrases.length * 0.3),
    practiceTime: 45 // minutes
  }

  return (
    <div className="analytics-dashboard fade-in">
      <div className="dashboard-header-card glass-card">
        <header className="header-primary">
          <div className="title-group">
            <span className="badge-pill">Analytics Engine</span>
            <h2>Cognitive Roadmap</h2>
            <p>Decoding your linguistic progress and pattern recognition.</p>
          </div>

          <nav className="tab-controller glass-card">
            <button
              onClick={() => setActiveTab('overview')}
              className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('progress')}
              className={`nav-item ${activeTab === 'progress' ? 'active' : ''}`}
            >
              Progress
            </button>
            <button
              onClick={() => setActiveTab('patterns')}
              className={`nav-item ${activeTab === 'patterns' ? 'active' : ''}`}
            >
              Architecture
            </button>
          </nav>
        </header>

        <div className="dashboard-view-area">
          {activeTab === 'overview' && (
            <div className="overview-grid fade-in">
              <div className="stats-strip">
                <div className="stat-pill glass-card">
                  <span className="pill-icon">📚</span>
                  <div className="pill-meta">
                    <span className="pill-val">{stats.totalPhrases}</span>
                    <span className="pill-lab">Phrases</span>
                  </div>
                </div>
                <div className="stat-pill glass-card">
                  <span className="pill-icon">🎯</span>
                  <div className="pill-meta">
                    <span className="pill-val">{stats.averageConfidence}%</span>
                    <span className="pill-lab">Confidence</span>
                  </div>
                </div>
                <div className="stat-pill glass-card">
                  <span className="pill-icon">🔥</span>
                  <div className="pill-meta">
                    <span className="pill-val">{stats.learningStreak}d</span>
                    <span className="pill-lab">Streak</span>
                  </div>
                </div>
                <div className="stat-pill glass-card">
                  <span className="pill-icon">⭐</span>
                  <div className="pill-meta">
                    <span className="pill-val">{stats.masteredPhrases}</span>
                    <span className="pill-lab">Mastered</span>
                  </div>
                </div>
              </div>

              <div className="insights-cluster">
                <h3>Adaptive Insights</h3>
                <div className="insight-row glass-card">
                  <span className="row-icon accent">💬</span>
                  <div className="row-body">
                    <p>Most active linguistic context identified as <strong className="highlight">{stats.mostCommonIntent}</strong></p>
                  </div>
                </div>
                <div className="insight-row glass-card">
                  <span className="row-icon secondary">🗣️</span>
                  <div className="row-body">
                    <p>Current vocal persona mapped to <strong className="highlight">{profile.overallTone}</strong> & <strong className="highlight">{profile.overallFormality}</strong></p>
                  </div>
                </div>
                <div className="insight-row glass-card">
                  <span className="row-icon primary">⏱️</span>
                  <div className="row-body">
                    <p>Total cognitive immersion: <strong className="highlight">{stats.practiceTime} minutes</strong> this cycle</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'progress' && (
            <div className="progress-layer fade-in">
              <div className="chart-container glass-card">
                <h3>Proficiency Distribution</h3>
                <div className="distribution-list">
                  {[
                    { label: 'Foundational Spanish', value: 85, color: 'var(--accent)' },
                    { label: 'Work & Professional', value: 70, color: 'var(--secondary)' },
                    { label: 'Daily Social Flow', value: 60, color: 'var(--primary)' }
                  ].map(item => (
                    <div key={item.label} className="chart-row">
                      <div className="row-meta">
                        <span className="row-label">{item.label}</span>
                        <span className="row-val" style={{ color: item.color }}>{item.value}%</span>
                      </div>
                      <div className="track-bg">
                        <div className="track-fill" style={{ width: `${item.value}%`, background: item.color }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="chronicle-section">
                <h3>Recent Milestones</h3>
                <div className="milestone-timeline">
                  <div className="milestone-card glass-card done">
                    <span className="m-icon">✅</span>
                    <div className="m-body">
                      <p className="m-text">Linguistic baseline established</p>
                      <span className="m-date">3h ago</span>
                    </div>
                  </div>
                  <div className="milestone-card glass-card done">
                    <span className="m-icon">🔥</span>
                    <div className="m-body">
                      <p className="m-text">Vocal pattern synchronized</p>
                      <span className="m-date">Yesterday</span>
                    </div>
                  </div>
                  <div className="milestone-card glass-card future">
                    <span className="m-icon shadow">⭐</span>
                    <div className="m-body">
                      <p className="m-text">Mastery Level 1 (In Progress)</p>
                      <span className="m-date">3 phrases remaining</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'patterns' && (
            <div className="architecture-grid fade-in">
              <div className="pattern-analysis">
                <h3>Fingerprint Analysis</h3>
                <div className="p-grid">
                  {profile.commonPatterns.map((pattern, index) => (
                    <div key={index} className="pattern-cell glass-card">
                      <span className="p-label">Pattern {index + 1}</span>
                      <p className="p-desc">{pattern.description}</p>
                      <div className="p-impact">
                        <span className="i-dot"></span>
                        High Affinity
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="recs-panel">
                <h3>Growth Directives</h3>
                <div className="directive-item glass-card">
                  <div className="d-icon-wrap">🎯</div>
                  <div className="d-info">
                    <h5>Dialect Narrowing</h5>
                    <p>Synchronize your "Neutral" accent tokens with higher Mexican Spanish density.</p>
                  </div>
                </div>
                <div className="directive-item glass-card">
                  <div className="d-icon-wrap">🚀</div>
                  <div className="d-info">
                    <h5>Inversive Practice</h5>
                    <p>Engage in 5 more Work Context sessions to unlock Advanced Professional tier.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{styles}</style>
    </div>
  )
}

function getMostCommonIntent(phrases: Phrase[]): string {
  if (!phrases.length) return 'calculating...';
  const intentCounts = phrases.reduce((acc, phrase) => {
    acc[phrase.intent] = (acc[phrase.intent] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return Object.entries(intentCounts)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || 'casual'
}

const styles = `
  .analytics-dashboard {
    max-width: 900px;
    margin: 0 auto;
  }

  .dashboard-header-card {
      padding: 0 !important;
      overflow: hidden;
      display: flex;
      flex-direction: column;
  }

  .header-primary {
      padding: var(--space-xl) var(--space-xl) var(--space-lg);
      background: rgba(255, 255, 255, 0.02);
      border-bottom: 1px solid var(--border-glass);
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
  }

  .title-group h2 { font-size: 2.2rem; margin: 0.5rem 0; color: var(--text-primary); }
  .title-group p { color: var(--text-secondary); opacity: 0.7; font-size: 0.95rem; }

  .badge-pill {
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

  .tab-controller {
      padding: 0.4rem !important;
      background: rgba(0, 0, 0, 0.2) !important;
      display: flex;
      gap: 0.25rem;
  }

  .nav-item {
      padding: 0.5rem 1.2rem;
      background: transparent;
      border: none;
      color: var(--text-secondary);
      font-weight: 700;
      font-size: 0.85rem;
      cursor: pointer;
      border-radius: var(--radius-md);
      transition: all 0.2s;
  }

  .nav-item.active { background: var(--primary); color: white; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3); }

  .dashboard-view-area { padding: var(--space-xl); }

  /* Overview Tab */
  .stats-strip { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-md); margin-bottom: var(--space-xl); }
  .stat-pill { padding: var(--space-md) !important; display: flex; align-items: center; gap: var(--space-md); background: rgba(255, 255, 255, 0.02) !important; }
  .pill-icon { font-size: 1.5rem; }
  .pill-meta { display: flex; flex-direction: column; }
  .pill-val { font-size: 1.4rem; font-weight: 800; color: var(--text-primary); line-height: 1.2; }
  .pill-lab { font-size: 0.7rem; color: var(--text-secondary); font-weight: 700; text-transform: uppercase; }

  .insights-cluster h3 { font-size: 1rem; text-transform: uppercase; color: var(--text-secondary); margin-bottom: var(--space-lg); letter-spacing: 0.1em; }
  .insight-row { margin-bottom: var(--space-md); padding: var(--space-md) !important; display: flex; align-items: center; gap: var(--space-lg); }
  .row-icon { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; }
  .row-icon.accent { background: rgba(16, 185, 129, 0.1); color: var(--accent); }
  .row-icon.secondary { background: rgba(236, 72, 153, 0.1); color: var(--secondary); }
  .row-icon.primary { background: rgba(99, 102, 241, 0.1); color: var(--primary); }
  .highlight { color: var(--primary); }

  /* Progress Tab */
  .progress-layer { display: grid; grid-template-columns: 1.5fr 1fr; gap: var(--space-xl); }
  .distribution-list { display: flex; flex-direction: column; gap: var(--space-lg); margin-top: var(--space-lg); }
  .chart-row { display: flex; flex-direction: column; gap: 0.5rem; }
  .row-meta { display: flex; justify-content: space-between; font-weight: 700; font-size: 0.9rem; }
  .row-label { color: var(--text-secondary); }
  .track-bg { height: 8px; background: rgba(255, 255, 255, 0.05); border-radius: 4px; overflow: hidden; }
  .track-fill { height: 100%; border-radius: 4px; transition: width 1s ease-out; }

  .milestone-timeline { display: flex; flex-direction: column; gap: var(--space-md); margin-top: var(--space-lg); }
  .milestone-card { padding: var(--space-md) !important; display: flex; gap: var(--space-md); align-items: center; }
  .milestone-card.done { border-left: 3px solid var(--accent) !important; }
  .milestone-card.future { opacity: 0.6; grayscale: 1; }
  .m-body p { margin: 0; font-weight: 700; font-size: 0.9rem; color: var(--text-primary); }
  .m-date { font-size: 0.75rem; color: var(--text-secondary); }

  /* Architecture Tab */
  .architecture-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-xl); }
  .p-grid { display: grid; grid-template-columns: 1fr; gap: var(--space-md); margin-top: var(--space-lg); }
  .pattern-cell { padding: var(--space-md) !important; border-left: 3px solid var(--primary) !important; }
  .p-label { font-size: 0.7rem; font-weight: 800; color: var(--primary); text-transform: uppercase; }
  .p-desc { margin: 0.3rem 0; font-size: 0.95rem; line-height: 1.4; color: var(--text-primary); }
  .p-impact { font-size: 0.75rem; color: var(--text-secondary); display: flex; align-items: center; gap: 0.4rem; }
  .i-dot { width: 6px; height: 6px; background: var(--accent); border-radius: 50%; }

  .directive-item { display: flex; gap: var(--space-md); padding: var(--space-md) !important; margin-bottom: var(--space-md); border-right: 3px solid var(--primary) !important; text-align: right; }
  .d-icon-wrap { font-size: 1.8rem; }
  .d-info h5 { margin: 0 0 0.2rem 0; color: var(--text-primary); font-size: 1rem; }
  .d-info p { margin: 0; font-size: 0.85rem; color: var(--text-secondary); line-height: 1.4; }

  @media (max-width: 800px) {
      .header-primary { flex-direction: column; align-items: flex-start; gap: var(--space-lg); }
      .stats-strip { grid-template-columns: repeat(2, 1fr); }
      .progress-layer, .architecture-grid { grid-template-columns: 1fr; }
  }
`;
