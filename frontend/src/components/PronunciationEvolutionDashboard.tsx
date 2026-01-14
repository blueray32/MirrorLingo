import React from 'react';

interface PhonemeProgress {
  phoneme: string;
  category: string;
  difficulty: string;
  currentAccuracy: number;
  improvementRate: number;
  masteryLevel: string;
  practiceCount: number;
  targetAccuracy: number;
  personalizedTips: string[];
}

interface CoachingProgram {
  currentFocus: string[];
  recommendedExercises: Exercise[];
  nextMilestone: Milestone;
  adaptiveSchedule: PracticeSchedule[];
}

interface Exercise {
  id: string;
  type: string;
  targetPhonemes: string[];
  difficulty: number;
  estimatedDuration: number;
  description: string;
  examples: string[];
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  targetPhonemes: string[];
  requiredAccuracy: number;
  achieved: boolean;
}

interface PracticeSchedule {
  phoneme: string;
  frequency: number;
  duration: number;
  priority: string;
}

interface PronunciationEvolutionDashboardProps {
  phonemeProgress: PhonemeProgress[];
  coachingProgram: CoachingProgram | null;
  isLoading?: boolean;
}

const MASTERY_COLORS: Record<string, string> = {
  beginner: '#ef4444',
  developing: '#f59e0b',
  proficient: '#3b82f6',
  advanced: '#10b981',
  mastered: '#059669'
};

const MASTERY_LABELS: Record<string, string> = {
  beginner: 'Beginner',
  developing: 'Developing',
  proficient: 'Proficient',
  advanced: 'Advanced',
  mastered: 'Mastered'
};

const DIFFICULTY_ICONS: Record<string, string> = {
  easy: '🟢',
  medium: '🟡',
  hard: '🔴',
  very_hard: '🟣'
};

export const PronunciationEvolutionDashboard: React.FC<PronunciationEvolutionDashboardProps> = ({
  phonemeProgress,
  coachingProgram,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="evolution-dashboard loading">
        <div className="loading-spinner"></div>
        <p>Loading pronunciation evolution...</p>
      </div>
    );
  }

  const focusPhonemes = phonemeProgress.filter(p => 
    coachingProgram?.currentFocus.includes(p.phoneme)
  );

  const strugglingPhonemes = phonemeProgress
    .filter(p => p.currentAccuracy < 70)
    .sort((a, b) => a.currentAccuracy - b.currentAccuracy);

  const masteredPhonemes = phonemeProgress.filter(p => p.masteryLevel === 'mastered');

  return (
    <div className="evolution-dashboard">
      <div className="dashboard-header">
        <h2>🎯 Pronunciation Evolution</h2>
        <p>Track your Spanish pronunciation journey over time</p>
      </div>

      {/* Current Focus */}
      {coachingProgram && (
        <div className="focus-section">
          <h3>🔥 Current Focus</h3>
          <div className="focus-phonemes">
            {focusPhonemes.map(phoneme => (
              <div key={phoneme.phoneme} className="focus-phoneme-card">
                <div className="phoneme-header">
                  <span className="phoneme-symbol">/{phoneme.phoneme}/</span>
                  <span className="difficulty-badge">
                    {DIFFICULTY_ICONS[phoneme.difficulty]} {phoneme.difficulty}
                  </span>
                </div>
                
                <div className="accuracy-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${phoneme.currentAccuracy}%`,
                        backgroundColor: MASTERY_COLORS[phoneme.masteryLevel]
                      }}
                    ></div>
                  </div>
                  <span className="accuracy-text">{phoneme.currentAccuracy}%</span>
                </div>

                <div className="improvement-indicator">
                  {phoneme.improvementRate > 0 ? (
                    <span className="improving">📈 +{phoneme.improvementRate.toFixed(1)}%</span>
                  ) : phoneme.improvementRate < 0 ? (
                    <span className="declining">📉 {phoneme.improvementRate.toFixed(1)}%</span>
                  ) : (
                    <span className="stable">➡️ Stable</span>
                  )}
                </div>

                <div className="personalized-tips">
                  <strong>Tips:</strong>
                  <ul>
                    {phoneme.personalizedTips.slice(0, 2).map((tip, index) => (
                      <li key={index}>{tip}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Milestone */}
      {coachingProgram?.nextMilestone && !coachingProgram.nextMilestone.achieved && (
        <div className="milestone-section">
          <h3>🎯 Next Milestone</h3>
          <div className="milestone-card">
            <div className="milestone-header">
              <h4>{coachingProgram.nextMilestone.title}</h4>
              <span className="target-accuracy">{coachingProgram.nextMilestone.requiredAccuracy}% target</span>
            </div>
            <p>{coachingProgram.nextMilestone.description}</p>
            
            <div className="milestone-progress">
              {coachingProgram.nextMilestone.targetPhonemes.map((phoneme: string) => {
                const progress = phonemeProgress.find(p => p.phoneme === phoneme);
                const currentAccuracy = progress?.currentAccuracy || 0;
                const progressPercent = Math.min(100, (currentAccuracy / coachingProgram.nextMilestone.requiredAccuracy) * 100);
                
                return (
                  <div key={phoneme} className="phoneme-milestone-progress">
                    <span>/{phoneme}/</span>
                    <div className="mini-progress-bar">
                      <div 
                        className="mini-progress-fill"
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>
                    <span>{currentAccuracy}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Recommended Exercises */}
      {coachingProgram?.recommendedExercises && (
        <div className="exercises-section">
          <h3>💪 Recommended Exercises</h3>
          <div className="exercises-grid">
            {coachingProgram.recommendedExercises.slice(0, 3).map(exercise => (
              <div key={exercise.id} className="exercise-card">
                <div className="exercise-header">
                  <h4>{exercise.type.replace('_', ' ')}</h4>
                  <span className="duration">{exercise.estimatedDuration} min</span>
                </div>
                
                <p>{exercise.description}</p>
                
                <div className="exercise-examples">
                  <strong>Examples:</strong>
                  <div className="examples-list">
                    {exercise.examples.slice(0, 3).map((example, index) => (
                      <span key={index} className="example-word">{example}</span>
                    ))}
                  </div>
                </div>

                <div className="target-phonemes">
                  <strong>Focus:</strong>
                  {exercise.targetPhonemes.map(phoneme => (
                    <span key={phoneme} className="target-phoneme">/{phoneme}/</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Overall Progress */}
      <div className="progress-overview">
        <div className="progress-stats">
          <div className="stat-card">
            <h4>🏆 Mastered</h4>
            <span className="stat-number">{masteredPhonemes.length}</span>
            <span className="stat-label">phonemes</span>
          </div>
          
          <div className="stat-card">
            <h4>📈 Improving</h4>
            <span className="stat-number">
              {phonemeProgress.filter(p => p.improvementRate > 0).length}
            </span>
            <span className="stat-label">phonemes</span>
          </div>
          
          <div className="stat-card">
            <h4>🎯 Practicing</h4>
            <span className="stat-number">
              {phonemeProgress.reduce((sum, p) => sum + p.practiceCount, 0)}
            </span>
            <span className="stat-label">sessions</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .evolution-dashboard {
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

        .focus-section, .milestone-section, .exercises-section {
          margin-bottom: 30px;
        }

        .focus-section h3, .milestone-section h3, .exercises-section h3 {
          margin-bottom: 16px;
          color: #374151;
        }

        .focus-phonemes {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 16px;
        }

        .focus-phoneme-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .phoneme-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .phoneme-symbol {
          font-size: 24px;
          font-weight: bold;
          color: #1f2937;
        }

        .difficulty-badge {
          font-size: 12px;
          padding: 4px 8px;
          background: #f3f4f6;
          border-radius: 6px;
          text-transform: capitalize;
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

        .accuracy-text {
          font-weight: 600;
          color: #374151;
        }

        .improvement-indicator {
          margin-bottom: 12px;
          font-size: 14px;
        }

        .improving { color: #059669; }
        .declining { color: #dc2626; }
        .stable { color: #6b7280; }

        .personalized-tips ul {
          margin: 4px 0 0 0;
          padding-left: 16px;
        }

        .personalized-tips li {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 2px;
        }

        .milestone-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .milestone-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .milestone-header h4 {
          margin: 0;
          color: #1f2937;
        }

        .target-accuracy {
          background: #dbeafe;
          color: #1d4ed8;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
        }

        .milestone-progress {
          display: flex;
          gap: 16px;
          margin-top: 12px;
        }

        .phoneme-milestone-progress {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
        }

        .mini-progress-bar {
          width: 60px;
          height: 4px;
          background: #e5e7eb;
          border-radius: 2px;
          overflow: hidden;
        }

        .mini-progress-fill {
          height: 100%;
          background: #3b82f6;
          transition: width 0.3s ease;
        }

        .exercises-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 16px;
        }

        .exercise-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 16px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .exercise-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .exercise-header h4 {
          margin: 0;
          color: #1f2937;
          text-transform: capitalize;
        }

        .duration {
          background: #f3f4f6;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 12px;
          color: #6b7280;
        }

        .examples-list {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 4px;
        }

        .example-word {
          background: #f0f9ff;
          color: #0369a1;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 12px;
        }

        .target-phonemes {
          margin-top: 8px;
          font-size: 14px;
        }

        .target-phoneme {
          background: #fef3c7;
          color: #92400e;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 12px;
          margin-left: 4px;
        }

        .progress-overview {
          margin-top: 30px;
        }

        .progress-stats {
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
