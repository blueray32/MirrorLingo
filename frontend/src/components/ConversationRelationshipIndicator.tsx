import React from 'react';

interface RelationshipStatus {
  level: string;
  progressToNext: number;
  daysSinceFirstMeeting: number;
  totalConversations: number;
  favoriteTopics: string[];
  recentMemories: string[];
}

interface ConversationRelationshipIndicatorProps {
  relationshipStatus: RelationshipStatus | null;
  tutorName?: string;
  isLoading?: boolean;
}

const RELATIONSHIP_LABELS: Record<string, string> = {
  stranger: '👋 Getting to know each other',
  acquaintance: '🤝 Building rapport',
  friend: '😊 Good friends',
  close_friend: '💫 Close friends',
  family_like: '❤️ Like family'
};

const RELATIONSHIP_COLORS: Record<string, string> = {
  stranger: '#94a3b8',
  acquaintance: '#60a5fa',
  friend: '#34d399',
  close_friend: '#f59e0b',
  family_like: '#ef4444'
};

export const ConversationRelationshipIndicator: React.FC<ConversationRelationshipIndicatorProps> = ({
  relationshipStatus,
  tutorName = 'María',
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="relationship-indicator loading">
        <div className="relationship-avatar">
          <div className="avatar-placeholder"></div>
        </div>
        <div className="relationship-info">
          <div className="loading-text"></div>
        </div>
      </div>
    );
  }

  if (!relationshipStatus) {
    return (
      <div className="relationship-indicator">
        <div className="relationship-avatar">
          <span className="avatar-emoji">👋</span>
        </div>
        <div className="relationship-info">
          <div className="relationship-level">Getting to know {tutorName}</div>
          <div className="relationship-subtitle">Start your first conversation!</div>
        </div>
      </div>
    );
  }

  const { level, progressToNext, totalConversations, favoriteTopics } = relationshipStatus;
  const relationshipColor = RELATIONSHIP_COLORS[level] || '#94a3b8';

  return (
    <div className="relationship-indicator">
      <div className="relationship-avatar">
        <span className="avatar-emoji">👩‍🏫</span>
        <div 
          className="relationship-ring" 
          style={{ 
            borderColor: relationshipColor,
            background: `conic-gradient(${relationshipColor} ${progressToNext * 3.6}deg, #e2e8f0 0deg)`
          }}
        ></div>
      </div>
      
      <div className="relationship-info">
        <div className="relationship-level" style={{ color: relationshipColor }}>
          {RELATIONSHIP_LABELS[level] || 'Building relationship'}
        </div>
        <div className="relationship-subtitle">
          {totalConversations} conversations with {tutorName}
        </div>
        
        {favoriteTopics.length > 0 && (
          <div className="favorite-topics">
            <span className="topics-label">Loves talking about:</span>
            <span className="topics-list">{favoriteTopics.slice(0, 2).join(', ')}</span>
          </div>
        )}
      </div>

      <style jsx>{`
        .relationship-indicator {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          backdrop-filter: blur(10px);
          margin-bottom: 16px;
        }

        .relationship-indicator.loading {
          opacity: 0.6;
        }

        .relationship-avatar {
          position: relative;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .avatar-emoji {
          font-size: 24px;
          z-index: 2;
        }

        .avatar-placeholder {
          width: 32px;
          height: 32px;
          background: #e2e8f0;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        .relationship-ring {
          position: absolute;
          top: 0;
          left: 0;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: 3px solid transparent;
          z-index: 1;
        }

        .relationship-info {
          flex: 1;
          min-width: 0;
        }

        .relationship-level {
          font-weight: 600;
          font-size: 14px;
          margin-bottom: 2px;
        }

        .relationship-subtitle {
          font-size: 12px;
          color: #64748b;
          margin-bottom: 4px;
        }

        .favorite-topics {
          font-size: 11px;
          color: #64748b;
        }

        .topics-label {
          margin-right: 4px;
        }

        .topics-list {
          color: #3b82f6;
          font-weight: 500;
        }

        .loading-text {
          width: 120px;
          height: 12px;
          background: #e2e8f0;
          border-radius: 6px;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};
