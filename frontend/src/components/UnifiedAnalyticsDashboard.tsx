import React, { useState, useEffect } from 'react';
import { useSpacedRepetitionSync } from '../hooks/useSpacedRepetitionSync';
import { useConversationMemory } from '../hooks/useConversationMemory';
import { usePronunciationEvolution } from '../hooks/usePronunciationEvolution';
import { useMistakePatterns } from '../hooks/useMistakePatterns';
import { useSmartLearning } from '../hooks/useSmartLearning';

const DEMO_USER_ID = 'demo-user-123';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
}

interface LearningInsight {
  type: 'strength' | 'improvement' | 'milestone';
  title: string;
  description: string;
  icon: string;
}

interface SimpleRecommendation {
  id: string;
  type: 'conversation' | 'pronunciation' | 'grammar' | 'vocabulary';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action: string;
  estimatedTime: number;
}

export const UnifiedAnalyticsDashboard: React.FC = () => {
  const { syncStatus, isEnabled: syncEnabled, isSyncing } = useSpacedRepetitionSync(DEMO_USER_ID);
  const { conversationMemory, isLoading: memoryLoading } = useConversationMemory(DEMO_USER_ID);
  const { phonemeProgress, isLoading: pronunciationLoading } = usePronunciationEvolution(DEMO_USER_ID);
  const { mistakeCategories, isLoading: mistakeLoading } = useMistakePatterns(DEMO_USER_ID);
  const { recommendations: smartRecommendations, isLoading: smartLoading } = useSmartLearning();

  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'insights' | 'recommendations' | 'smart'>('overview');
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [insights, setInsights] = useState<LearningInsight[]>([]);
  const [recommendations, setRecommendations] = useState<SimpleRecommendation[]>([]);

  useEffect(() => {
    generateAchievements();
    generateInsights();
    generateRecommendations();
  }, [syncStatus, conversationMemory, phonemeProgress, mistakeCategories]);

  const generateAchievements = () => {
    const newAchievements: Achievement[] = [
      {
        id: 'conversation_starter',
        title: 'Conversation Starter',
        description: 'Complete your first AI conversation',
        icon: '💬',
        unlocked: (conversationMemory?.totalConversations || 0) > 0,
        progress: Math.min(conversationMemory?.totalConversations || 0, 1),
        maxProgress: 1
      },
      {
        id: 'pronunciation_master',
        title: 'Pronunciation Master',
        description: 'Achieve 80% accuracy on 5 phonemes',
        icon: '🎯',
        unlocked: phonemeProgress.filter(p => p.currentAccuracy >= 0.8).length >= 5,
        progress: phonemeProgress.filter(p => p.currentAccuracy >= 0.8).length,
        maxProgress: 5
      },
      {
        id: 'grammar_guru',
        title: 'Grammar Guru',
        description: 'Improve 3 grammar categories to 85%+',
        icon: '📚',
        unlocked: mistakeCategories.filter(c => c.currentAccuracy >= 85).length >= 3,
        progress: mistakeCategories.filter(c => c.currentAccuracy >= 85).length,
        maxProgress: 3
      },
      {
        id: 'consistent_learner',
        title: 'Consistent Learner',
        description: 'Practice for 7 consecutive days',
        icon: '🔥',
        unlocked: (syncStatus?.itemCount || 0) >= 7,
        progress: Math.min(syncStatus?.itemCount || 0, 7),
        maxProgress: 7
      },
      {
        id: 'phrase_collector',
        title: 'Phrase Collector',
        description: 'Master 50 Spanish phrases',
        icon: '🏆',
        unlocked: (syncStatus?.itemCount || 0) >= 50,
        progress: Math.min(syncStatus?.itemCount || 0, 50),
        maxProgress: 50
      }
    ];
    setAchievements(newAchievements);
  };

  const generateInsights = () => {
    const newInsights: LearningInsight[] = [];

    // Pronunciation insights
    const strongPhonemes = phonemeProgress.filter(p => p.currentAccuracy >= 0.8);
    const weakPhonemes = phonemeProgress.filter(p => p.currentAccuracy < 0.6);

    if (strongPhonemes.length > 0) {
      newInsights.push({
        type: 'strength',
        title: 'Pronunciation Strengths',
        description: `You excel at ${strongPhonemes.slice(0, 3).map(p => p.phoneme).join(', ')} sounds`,
        icon: '🎵'
      });
    }

    if (weakPhonemes.length > 0) {
      newInsights.push({
        type: 'improvement',
        title: 'Pronunciation Focus',
        description: `Practice ${weakPhonemes[0].phoneme} sounds more - currently ${Math.round(weakPhonemes[0].currentAccuracy * 100)}%`,
        icon: '🎯'
      });
    }

    // Grammar insights
    const improvedGrammar = mistakeCategories.filter(c => c.improvementRate > 0.1);
    if (improvedGrammar.length > 0) {
      newInsights.push({
        type: 'milestone',
        title: 'Grammar Progress',
        description: `${improvedGrammar[0].type.replace('_', ' ')} improved by ${Math.round(improvedGrammar[0].improvementRate * 100)}%`,
        icon: '📈'
      });
    }

    // Conversation insights
    if (conversationMemory?.relationshipLevel) {
      const level = conversationMemory.relationshipLevel;
      const levelValues = {
        'stranger': 1,
        'acquaintance': 2,
        'friend': 3,
        'close_friend': 4,
        'family_like': 5
      };
      const levelValue = levelValues[level as keyof typeof levelValues] || 1;

      if (levelValue >= 3) {
        newInsights.push({
          type: 'milestone',
          title: 'Strong Connection',
          description: `You've built a ${levelValue >= 4 ? 'close' : 'good'} relationship with your AI tutor`,
          icon: '🤝'
        });
      }
    }

    setInsights(newInsights);
  };

  const generateRecommendations = () => {
    const newRecommendations: SimpleRecommendation[] = [];

    // Grammar recommendations
    const highPriorityMistakes = mistakeCategories
      .filter(cat => cat.focusLevel === 'high')
      .sort((a, b) => a.currentAccuracy - b.currentAccuracy);

    if (highPriorityMistakes.length > 0) {
      const category = highPriorityMistakes[0];
      newRecommendations.push({
        id: `grammar-${category.type}`,
        type: 'grammar',
        priority: 'high',
        title: `Improve ${category.type.replace('_', ' ')}`,
        description: `Focus on ${category.type.replace('_', ' ')} - currently at ${category.currentAccuracy}% accuracy`,
        action: `Practice ${category.type.replace('_', ' ')} exercises`,
        estimatedTime: 15
      });
    }

    // Pronunciation recommendations
    const weakPhonemes = phonemeProgress
      .filter(p => p.currentAccuracy < 0.7)
      .sort((a, b) => a.currentAccuracy - b.currentAccuracy);

    if (weakPhonemes.length > 0) {
      const weakest = weakPhonemes[0];
      newRecommendations.push({
        id: `pronunciation-${weakest.phoneme}`,
        type: 'pronunciation',
        priority: 'high',
        title: `Master the "${weakest.phoneme}" sound`,
        description: `Your "${weakest.phoneme}" pronunciation needs attention - currently ${Math.round(weakest.currentAccuracy * 100)}% accurate`,
        action: `Practice "${weakest.phoneme}" pronunciation exercises`,
        estimatedTime: 10
      });
    }

    // Conversation recommendations
    if (!conversationMemory || (conversationMemory.totalConversations || 0) === 0) {
      newRecommendations.push({
        id: 'conversation-start',
        type: 'conversation',
        priority: 'high',
        title: 'Start your first AI conversation',
        description: 'Begin building a relationship with your AI Spanish tutor',
        action: 'Have your first Spanish conversation',
        estimatedTime: 20
      });
    }

    // Vocabulary recommendations
    if (!syncStatus || syncStatus.itemCount < 10) {
      newRecommendations.push({
        id: 'vocabulary-expand',
        type: 'vocabulary',
        priority: 'medium',
        title: 'Build your vocabulary',
        description: 'Start learning Spanish phrases with spaced repetition',
        action: 'Practice vocabulary sessions',
        estimatedTime: 15
      });
    }

    setRecommendations(newRecommendations.slice(0, 6));
  };

  const calculateOverallProgress = () => {
    const levelValues = {
      'stranger': 1,
      'acquaintance': 2,
      'friend': 3,
      'close_friend': 4,
      'family_like': 5
    };

    const normalizeAccuracy = (val: number) => val > 1 ? val / 100 : val;

    const factors = [
      (syncStatus?.itemCount || 0) / 100, // Spaced repetition
      (levelValues[conversationMemory?.relationshipLevel as keyof typeof levelValues] || 0) / 5, // Conversation
      (phonemeProgress.reduce((acc, p) => acc + normalizeAccuracy(p.currentAccuracy), 0) / phonemeProgress.length || 0), // Pronunciation
      (mistakeCategories.reduce((acc, c) => acc + normalizeAccuracy(c.currentAccuracy), 0) / mistakeCategories.length || 0) // Grammar
    ];
    // Cap Overall Progress at 100%
    return Math.min(100, Math.round(factors.reduce((acc, f) => acc + f, 0) / factors.length * 100));
  };

  const isLoading = isSyncing || memoryLoading || pronunciationLoading || mistakeLoading || smartLoading;

  if (isLoading) {
    return (
      <div className="unified-dashboard loading">
        <div className="loading-spinner"></div>
        <p>Loading your learning analytics...</p>
      </div>
    );
  }

  return (
    <div className="unified-dashboard">
      <div className="dashboard-header">
        <h2>Learning Analytics</h2>
        <div className="overall-progress">
          <div className="progress-circle">
            <div className="progress-value">{calculateOverallProgress()}%</div>
            <div className="progress-label">Overall Progress</div>
          </div>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab ${activeTab === 'achievements' ? 'active' : ''}`}
          onClick={() => setActiveTab('achievements')}
        >
          Achievements
        </button>
        <button
          className={`tab ${activeTab === 'insights' ? 'active' : ''}`}
          onClick={() => setActiveTab('insights')}
        >
          Insights
        </button>
        <button
          className={`tab ${activeTab === 'recommendations' ? 'active' : ''}`}
          onClick={() => setActiveTab('recommendations')}
        >
          Basic
        </button>
        <button
          className={`tab ${activeTab === 'smart' ? 'active' : ''}`}
          onClick={() => setActiveTab('smart')}
        >
          Smart Learning
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-grid">
            <div className="metric-card">
              <div className="metric-icon">🔄</div>
              <div className="metric-content">
                <div className="metric-value">{syncStatus?.itemCount || 0}</div>
                <div className="metric-label">Practice Items</div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">💬</div>
              <div className="metric-content">
                <div className="metric-value">{conversationMemory?.totalConversations || 0}</div>
                <div className="metric-label">Conversations</div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">🎵</div>
              <div className="metric-content">
                <div className="metric-value">
                  {Math.round((phonemeProgress.reduce((acc, p) => acc + (p.currentAccuracy > 1 ? p.currentAccuracy / 100 : p.currentAccuracy), 0) / (phonemeProgress.length || 1)) * 100)}%
                </div>
                <div className="metric-label">Pronunciation</div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">📚</div>
              <div className="metric-content">
                <div className="metric-value">
                  {Math.round(mistakeCategories.reduce((acc, c) => acc + c.currentAccuracy, 0) / mistakeCategories.length || 0)}%
                </div>
                <div className="metric-label">Grammar</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="achievements-grid">
            {achievements.map(achievement => (
              <div key={achievement.id} className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}>
                <div className="achievement-icon">{achievement.icon}</div>
                <div className="achievement-content">
                  <h3>{achievement.title}</h3>
                  <p>{achievement.description}</p>
                  <div className="achievement-progress">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">
                      {achievement.progress}/{achievement.maxProgress}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="insights-list">
            {insights.map((insight, index) => (
              <div key={index} className={`insight-card ${insight.type}`}>
                <div className="insight-icon">{insight.icon}</div>
                <div className="insight-content">
                  <h3>{insight.title}</h3>
                  <p>{insight.description}</p>
                </div>
              </div>
            ))}
            {insights.length === 0 && (
              <div className="no-insights">
                <p>Keep practicing to unlock personalized insights!</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="recommendations-section">
            {recommendations.length > 0 ? (
              <>
                <div className="learning-path-header">
                  <div className="path-info">
                    <h3>Personalized Learning Recommendations</h3>
                    <div className="path-meta">
                      <span className="time-estimate">
                        ~{recommendations.reduce((acc, rec) => acc + rec.estimatedTime, 0)} minutes total
                      </span>
                    </div>
                  </div>
                </div>

                <div className="recommendations-grid">
                  {recommendations.map((rec) => (
                    <div key={rec.id} className={`recommendation-card priority-${rec.priority}`}>
                      <div className="rec-header">
                        <div className={`rec-type-badge type-${rec.type}`}>
                          {rec.type}
                        </div>
                        <div className={`rec-priority priority-${rec.priority}`}>
                          {rec.priority} priority
                        </div>
                      </div>

                      <div className="rec-content">
                        <h4>{rec.title}</h4>
                        <p className="rec-description">{rec.description}</p>

                        <div className="rec-action">
                          <button className="action-button">
                            {rec.action}
                          </button>
                          <span className="time-badge">{rec.estimatedTime}min</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="no-recommendations">
                <p>Keep practicing to unlock personalized recommendations!</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'smart' && (
          <div className="smart-recommendations-section">
            {smartRecommendations.length > 0 ? (
              <>
                <div className="smart-header">
                  <h3>🧠 Smart Learning Recommendations</h3>
                  <p>AI-powered suggestions that connect your grammar, pronunciation, and conversation practice</p>
                </div>

                <div className="smart-recommendations-grid">
                  {smartRecommendations.map((rec) => (
                    <div key={rec.id} className={`smart-recommendation-card type-${rec.type} priority-${rec.priority}`}>
                      <div className="smart-rec-header">
                        <div className="smart-type-badge">
                          {rec.type === 'conversation_topic' && '💬'}
                          {rec.type === 'pronunciation_exercise' && '🎵'}
                          {rec.type === 'integrated_practice' && '🔗'}
                          <span>{rec.type.replace('_', ' ')}</span>
                        </div>
                        <div className={`smart-priority priority-${rec.priority}`}>
                          {rec.priority}
                        </div>
                      </div>

                      <div className="smart-rec-content">
                        <h4>{rec.title}</h4>
                        <p className="smart-description">{rec.description}</p>
                        <p className="smart-reasoning">💡 {rec.reasoning}</p>

                        <div className="smart-skills">
                          {rec.targetSkills.map(skill => (
                            <span key={skill} className={`skill-tag skill-${skill}`}>
                              {skill}
                            </span>
                          ))}
                        </div>

                        {rec.conversationTopic && (
                          <div className="conversation-topic">
                            <strong>Topic:</strong> {rec.conversationTopic}
                          </div>
                        )}

                        {rec.targetPhonemes && (
                          <div className="target-phonemes">
                            <strong>Focus sounds:</strong> {rec.targetPhonemes.join(', ')}
                          </div>
                        )}

                        {rec.grammarFocus && (
                          <div className="grammar-focus">
                            <strong>Grammar:</strong> {rec.grammarFocus.map(g => g.replace('_', ' ')).join(', ')}
                          </div>
                        )}

                        <div className="smart-action">
                          <button className="smart-action-button">
                            {rec.action}
                          </button>
                          <span className="smart-time-badge">{rec.estimatedTime}min</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="no-smart-recommendations">
                <h3>🧠 Smart Learning Coming Soon</h3>
                <p>Complete more practice sessions to unlock AI-powered learning recommendations that connect your grammar, pronunciation, and conversation skills!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UnifiedAnalyticsDashboard;

const styles = `
  .unified-dashboard {
    max-width: 1200px;
    margin: 0 auto;
    padding: var(--space-lg);
  }

  .unified-dashboard.loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    gap: 1rem;
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(99, 102, 241, 0.2);
    border-top: 3px solid var(--primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  .dashboard-header h2 {
    margin: 0;
    color: var(--text-primary);
    font-size: 1.8rem;
    font-weight: 700;
  }

  .overall-progress {
    text-align: center;
  }

  .progress-circle {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: conic-gradient(var(--primary) 0deg, var(--primary) calc(var(--progress, 0) * 3.6deg), rgba(99, 102, 241, 0.1) calc(var(--progress, 0) * 3.6deg));
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .progress-circle::before {
    content: '';
    position: absolute;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: var(--bg-primary);
  }

  .progress-value {
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--text-primary);
    z-index: 1;
  }

  .progress-label {
    font-size: 0.7rem;
    color: var(--text-secondary);
    z-index: 1;
  }

  .dashboard-tabs {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 2rem;
    border-bottom: 1px solid var(--border-color);
  }

  .tab {
    padding: 0.75rem 1.5rem;
    border: none;
    background: none;
    color: var(--text-secondary);
    font-weight: 500;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: all 0.2s;
  }

  .tab.active {
    color: var(--primary);
    border-bottom-color: var(--primary);
  }

  .tab:hover {
    color: var(--text-primary);
  }

  .overview-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
  }

  .metric-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    transition: transform 0.2s;
  }

  .metric-card:hover {
    transform: translateY(-2px);
  }

  .metric-icon {
    font-size: 2rem;
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(99, 102, 241, 0.1);
    border-radius: 12px;
  }

  .metric-content {
    flex: 1;
  }

  .metric-value {
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-primary);
    line-height: 1;
  }

  .metric-label {
    font-size: 0.9rem;
    color: var(--text-secondary);
    margin-top: 0.25rem;
  }

  .achievements-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
  }

  .achievement-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 1.5rem;
    display: flex;
    gap: 1rem;
    transition: all 0.2s;
  }

  .achievement-card.unlocked {
    border-color: var(--success);
    background: rgba(34, 197, 94, 0.05);
  }

  .achievement-card.locked {
    opacity: 0.6;
  }

  .achievement-icon {
    font-size: 2rem;
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(99, 102, 241, 0.1);
    border-radius: 12px;
    flex-shrink: 0;
  }

  .achievement-card.unlocked .achievement-icon {
    background: rgba(34, 197, 94, 0.1);
  }

  .achievement-content {
    flex: 1;
  }

  .achievement-content h3 {
    margin: 0 0 0.5rem 0;
    color: var(--text-primary);
    font-size: 1.1rem;
    font-weight: 600;
  }

  .achievement-content p {
    margin: 0 0 1rem 0;
    color: var(--text-secondary);
    font-size: 0.9rem;
  }

  .achievement-progress {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .progress-bar {
    flex: 1;
    height: 6px;
    background: rgba(99, 102, 241, 0.1);
    border-radius: 3px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: var(--primary);
    transition: width 0.3s ease;
  }

  .achievement-card.unlocked .progress-fill {
    background: var(--success);
  }

  .progress-text {
    font-size: 0.8rem;
    color: var(--text-secondary);
    font-weight: 500;
  }

  .insights-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .insight-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 1.5rem;
    display: flex;
    gap: 1rem;
    align-items: flex-start;
  }

  .insight-card.strength {
    border-left: 4px solid var(--success);
    background: rgba(34, 197, 94, 0.05);
  }

  .insight-card.improvement {
    border-left: 4px solid var(--warning);
    background: rgba(245, 158, 11, 0.05);
  }

  .insight-card.milestone {
    border-left: 4px solid var(--primary);
    background: rgba(99, 102, 241, 0.05);
  }

  .insight-icon {
    font-size: 1.5rem;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(99, 102, 241, 0.1);
    border-radius: 8px;
    flex-shrink: 0;
  }

  .insight-content h3 {
    margin: 0 0 0.5rem 0;
    color: var(--text-primary);
    font-size: 1rem;
    font-weight: 600;
  }

  .insight-content p {
    margin: 0;
    color: var(--text-secondary);
    font-size: 0.9rem;
  }

  .no-insights {
    text-align: center;
    padding: 3rem;
    color: var(--text-secondary);
  }

  .recommendations-section {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .learning-path-header {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 1.5rem;
  }

  .path-info h3 {
    margin: 0 0 1rem 0;
    color: var(--text-primary);
    font-size: 1.3rem;
    font-weight: 600;
  }

  .path-meta {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .difficulty-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 500;
    text-transform: capitalize;
  }

  .difficulty-beginner { background: rgba(34, 197, 94, 0.1); color: var(--success); }
  .difficulty-intermediate { background: rgba(245, 158, 11, 0.1); color: var(--warning); }
  .difficulty-advanced { background: rgba(239, 68, 68, 0.1); color: var(--danger); }

  .time-estimate {
    color: var(--text-secondary);
    font-size: 0.9rem;
  }

  .recommendations-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 1.5rem;
  }

  .recommendation-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 1.5rem;
    transition: all 0.2s;
  }

  .recommendation-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .priority-high {
    border-left: 4px solid var(--danger);
    background: rgba(239, 68, 68, 0.02);
  }

  .priority-medium {
    border-left: 4px solid var(--warning);
    background: rgba(245, 158, 11, 0.02);
  }

  .priority-low {
    border-left: 4px solid var(--success);
    background: rgba(34, 197, 94, 0.02);
  }

  .rec-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .rec-type-badge {
    padding: 0.25rem 0.5rem;
    border-radius: 8px;
    font-size: 0.7rem;
    font-weight: 500;
    text-transform: capitalize;
    background: rgba(99, 102, 241, 0.1);
    color: var(--primary);
  }

  .type-grammar { background: rgba(168, 85, 247, 0.1); color: #a855f7; }
  .type-pronunciation { background: rgba(34, 197, 94, 0.1); color: var(--success); }
  .type-conversation { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
  .type-vocabulary { background: rgba(245, 158, 11, 0.1); color: var(--warning); }

  .rec-priority {
    font-size: 0.7rem;
    font-weight: 500;
    text-transform: uppercase;
    opacity: 0.7;
  }

  .rec-content h4 {
    margin: 0 0 0.75rem 0;
    color: var(--text-primary);
    font-size: 1.1rem;
    font-weight: 600;
  }

  .rec-description {
    margin: 0 0 0.5rem 0;
    color: var(--text-primary);
    font-size: 0.9rem;
  }

  .rec-reasoning {
    margin: 0 0 1.5rem 0;
    color: var(--text-secondary);
    font-size: 0.8rem;
    font-style: italic;
  }

  .rec-action {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .action-button {
    background: var(--primary);
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    font-size: 0.8rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .action-button:hover {
    background: var(--primary-dark);
    transform: translateY(-1px);
  }

  .time-badge {
    background: rgba(99, 102, 241, 0.1);
    color: var(--primary);
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
    font-size: 0.7rem;
    font-weight: 500;
  }

  .no-recommendations {
    text-align: center;
    padding: 3rem;
    color: var(--text-secondary);
  }

  .smart-recommendations-section {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .smart-header {
    text-align: center;
    margin-bottom: 1rem;
  }

  .smart-header h3 {
    margin: 0 0 0.5rem 0;
    color: var(--text-primary);
    font-size: 1.4rem;
    font-weight: 600;
  }

  .smart-header p {
    margin: 0;
    color: var(--text-secondary);
    font-size: 0.9rem;
  }

  .smart-recommendations-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 1.5rem;
  }

  .smart-recommendation-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 1.5rem;
    transition: all 0.2s;
    position: relative;
  }

  .smart-recommendation-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }

  .type-conversation_topic {
    border-left: 4px solid #3b82f6;
    background: rgba(59, 130, 246, 0.02);
  }

  .type-pronunciation_exercise {
    border-left: 4px solid var(--success);
    background: rgba(34, 197, 94, 0.02);
  }

  .type-integrated_practice {
    border-left: 4px solid var(--primary);
    background: rgba(99, 102, 241, 0.02);
  }

  .smart-rec-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .smart-type-badge {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 500;
    background: rgba(99, 102, 241, 0.1);
    color: var(--primary);
  }

  .smart-priority {
    font-size: 0.7rem;
    font-weight: 500;
    text-transform: uppercase;
    padding: 0.25rem 0.5rem;
    border-radius: 8px;
  }

  .smart-priority.priority-high {
    background: rgba(239, 68, 68, 0.1);
    color: var(--danger);
  }

  .smart-priority.priority-medium {
    background: rgba(245, 158, 11, 0.1);
    color: var(--warning);
  }

  .smart-priority.priority-low {
    background: rgba(34, 197, 94, 0.1);
    color: var(--success);
  }

  .smart-rec-content h4 {
    margin: 0 0 0.75rem 0;
    color: var(--text-primary);
    font-size: 1.1rem;
    font-weight: 600;
  }

  .smart-description {
    margin: 0 0 0.75rem 0;
    color: var(--text-primary);
    font-size: 0.9rem;
  }

  .smart-reasoning {
    margin: 0 0 1rem 0;
    color: var(--text-secondary);
    font-size: 0.8rem;
    font-style: italic;
    background: rgba(99, 102, 241, 0.05);
    padding: 0.5rem;
    border-radius: 6px;
  }

  .smart-skills {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .skill-tag {
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
    font-size: 0.7rem;
    font-weight: 500;
    text-transform: capitalize;
  }

  .skill-grammar { background: rgba(168, 85, 247, 0.1); color: #a855f7; }
  .skill-pronunciation { background: rgba(34, 197, 94, 0.1); color: var(--success); }
  .skill-conversation { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
  .skill-vocabulary { background: rgba(245, 158, 11, 0.1); color: var(--warning); }

  .conversation-topic,
  .target-phonemes,
  .grammar-focus {
    margin-bottom: 0.5rem;
    font-size: 0.8rem;
    color: var(--text-secondary);
  }

  .conversation-topic strong,
  .target-phonemes strong,
  .grammar-focus strong {
    color: var(--text-primary);
  }

  .smart-action {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1.5rem;
  }

  .smart-action-button {
    background: linear-gradient(135deg, var(--primary), #7c3aed);
    color: white;
    border: none;
    padding: 0.75rem 1.25rem;
    border-radius: 8px;
    font-size: 0.8rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    flex: 1;
    margin-right: 1rem;
  }

  .smart-action-button:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  }

  .smart-time-badge {
    background: rgba(99, 102, 241, 0.1);
    color: var(--primary);
    padding: 0.5rem 0.75rem;
    border-radius: 12px;
    font-size: 0.7rem;
    font-weight: 600;
  }

  .no-smart-recommendations {
    text-align: center;
    padding: 4rem 2rem;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
  }

  .no-smart-recommendations h3 {
    margin: 0 0 1rem 0;
    color: var(--text-primary);
    font-size: 1.3rem;
  }

  .no-smart-recommendations p {
    margin: 0;
    color: var(--text-secondary);
    font-size: 0.9rem;
    line-height: 1.5;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @media (max-width: 768px) {
    .unified-dashboard {
      padding: var(--space-md);
    }

    .dashboard-header {
      flex-direction: column;
      gap: 1rem;
      text-align: center;
    }

    .overview-grid {
      grid-template-columns: 1fr;
    }

    .achievements-grid {
      grid-template-columns: 1fr;
    }

    .achievement-card,
    .insight-card {
      flex-direction: column;
      text-align: center;
    }

    .metric-card {
      flex-direction: column;
      text-align: center;
    }
  }
`;

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
