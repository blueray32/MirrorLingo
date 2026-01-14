import React from 'react';
import { useSpacedRepetitionSync } from '../hooks/useSpacedRepetitionSync';
import { useConversationMemory } from '../hooks/useConversationMemory';
import { usePronunciationEvolution } from '../hooks/usePronunciationEvolution';
import { useMistakePatterns } from '../hooks/useMistakePatterns';
import Link from 'next/link';

const DEMO_USER_ID = 'demo-user-123';

export const QuickStatsStrip: React.FC = () => {
  const { syncStatus } = useSpacedRepetitionSync(DEMO_USER_ID);
  const { conversationMemory } = useConversationMemory(DEMO_USER_ID);
  const { phonemeProgress } = usePronunciationEvolution(DEMO_USER_ID);
  const { mistakeCategories } = useMistakePatterns(DEMO_USER_ID);

  const stats = [
    {
      label: 'Practice Items',
      value: syncStatus?.itemCount || 0,
      icon: '🔄',
    },
    {
      label: 'Conversations',
      value: conversationMemory?.totalConversations || 0,
      icon: '💬',
    },
    {
      label: 'Pronunciation',
      value: `${Math.round((phonemeProgress.reduce((acc, p) => acc + (p.currentAccuracy > 1 ? p.currentAccuracy / 100 : p.currentAccuracy), 0) / (phonemeProgress.length || 1)) * 100)}%`,
      icon: '🎵',
    },
    {
      label: 'Grammar',
      value: `${Math.round(mistakeCategories.reduce((acc, c) => acc + c.currentAccuracy, 0) / (mistakeCategories.length || 1))}%`,
      icon: '📚',
    },
  ];

  return (
    <div className="quick-stats-strip fade-in">
      <div className="stats-container">
        {stats.map((stat, index) => (
          <div key={index} className="stat-item glass-card">
            <span className="stat-icon">{stat.icon}</span>
            <div className="stat-meta">
              <span className="stat-value">{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          </div>
        ))}

        <Link href="/analytics" className="view-detailed-btn glass-card">
          <span>Detailed Analytics</span>
          <span className="arrow">→</span>
        </Link>
      </div>

      <style jsx>{`
        .quick-stats-strip {
          width: 100%;
          margin-bottom: 2.5rem;
        }

        .stats-container {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          justify-content: center;
        }

        .stat-item {
          padding: 0.8rem 1.2rem !important;
          display: flex;
          align-items: center;
          gap: 1rem;
          min-width: 180px;
          background: rgba(255, 255, 255, 0.02) !important;
          transition: all 0.3s ease;
        }

        .stat-item:hover {
          transform: translateY(-3px);
          background: rgba(255, 255, 255, 0.05) !important;
          border-color: var(--primary) !important;
        }

        .stat-icon {
          font-size: 1.5rem;
          opacity: 0.8;
        }

        .stat-meta {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-size: 1.4rem;
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1.1;
        }

        .stat-label {
          font-size: 0.7rem;
          color: var(--text-secondary);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .view-detailed-btn {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          padding: 0 1.5rem !important;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1)) !important;
          color: var(--text-primary);
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 1px solid rgba(99, 102, 241, 0.2) !important;
        }

        .view-detailed-btn:hover {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2)) !important;
          transform: translateX(5px);
          border-color: var(--primary) !important;
        }

        .arrow {
          font-size: 1.1rem;
          transition: transform 0.3s ease;
        }

        .view-detailed-btn:hover .arrow {
          transform: translateX(3px);
        }

        @media (max-width: 768px) {
          .stat-item {
            flex: 1 1 140px;
          }
          .view-detailed-btn {
            width: 100%;
            justify-content: center;
            height: 50px;
          }
        }
      `}</style>
    </div>
  );
};
