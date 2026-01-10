import React, { useState } from 'react';
import { SpanishAccent, AccentProfile } from '../types/accents';

export { SpanishAccent };

const ACCENT_PROFILES: Record<SpanishAccent, AccentProfile> = {
  [SpanishAccent.NEUTRAL]: {
    accent: SpanishAccent.NEUTRAL,
    name: 'Neutral Spanish',
    region: 'International',
    flag: '🌍',
    characteristics: ['Clear pronunciation', 'Widely understood', 'Standard phonemes'],
    difficulty: 'Beginner'
  },
  [SpanishAccent.MEXICO]: {
    accent: SpanishAccent.MEXICO,
    name: 'Mexican Spanish',
    region: 'Mexico',
    flag: '🇲🇽',
    characteristics: ['Soft consonants', 'Seseo (s sound)', 'Yeísmo (y sound)'],
    difficulty: 'Beginner'
  },
  [SpanishAccent.COLOMBIA]: {
    accent: SpanishAccent.COLOMBIA,
    name: 'Colombian Spanish',
    region: 'Colombia',
    flag: '🇨🇴',
    characteristics: ['Clear articulation', 'Complete consonants', 'Neutral intonation'],
    difficulty: 'Intermediate'
  },
  [SpanishAccent.ARGENTINA]: {
    accent: SpanishAccent.ARGENTINA,
    name: 'Rioplatense Spanish',
    region: 'Argentina/Uruguay',
    flag: '🇦🇷',
    characteristics: ['Sheísmo (sh sound)', 'Voseo usage', 'Italian influence'],
    difficulty: 'Advanced'
  },
  [SpanishAccent.SPAIN]: {
    accent: SpanishAccent.SPAIN,
    name: 'Peninsular Spanish',
    region: 'Spain',
    flag: '🇪🇸',
    characteristics: ['Theta pronunciation', 'C/Z distinction', 'Vosotros usage'],
    difficulty: 'Advanced'
  }
};

interface AccentSelectorProps {
  selectedAccent: SpanishAccent;
  onAccentChange: (accent: SpanishAccent) => void;
  showDetails?: boolean;
}

export const AccentSelector: React.FC<AccentSelectorProps> = ({
  selectedAccent,
  onAccentChange,
  showDetails = true
}) => {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="accent-selector">
      <div className="selector-header">
        <div className="header-text">
          <span className="badge-pill">Accent Profile</span>
          <h3>Choose your target dialect</h3>
        </div>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="info-toggle"
        >
          {showInfo ? 'Close Guide' : 'Learn More'}
        </button>
      </div>

      <div className="accent-grid">
        {(Object.values(ACCENT_PROFILES)).map((profile) => (
          <div
            key={profile.accent}
            className={`accent-card glass-card ${selectedAccent === profile.accent ? 'selected' : ''}`}
            onClick={() => onAccentChange(profile.accent)}
          >
            <div className="accent-header">
              <span className="flag-icon">{profile.flag}</span>
              <div className="accent-meta">
                <h4>{profile.name}</h4>
                <p className="region-path">{profile.region}</p>
              </div>
              <span className={`difficulty-tag ${profile.difficulty.toLowerCase()}`}>
                {profile.difficulty}
              </span>
            </div>

            {showDetails && (
              <div className="accent-details">
                <ul className="char-list">
                  {profile.characteristics.map((char, index) => (
                    <li key={index} className="char-item">
                      <span className="bullet">⚡</span>
                      {char}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="selection-indicator"></div>
          </div>
        ))}
      </div>

      {showInfo && (
        <div className="accent-info-panel glass-card fade-in">
          <h4>Dialect Classification Guide</h4>
          <div className="info-grid">
            <div className="info-section">
              <span className="dot beginner"></span>
              <div className="info-content">
                <h5>Beginner Friendly</h5>
                <p><strong>Neutral & Mexican:</strong> Clear pronunciation, widely understood, and structurally consistent.</p>
              </div>
            </div>
            <div className="info-section">
              <span className="dot intermediate"></span>
              <div className="info-content">
                <h5>Intermediate</h5>
                <p><strong>Colombian:</strong> Crystal clear articulation with melodic intonation curves.</p>
              </div>
            </div>
            <div className="info-section">
              <span className="dot advanced"></span>
              <div className="info-content">
                <h5>Advanced Challenges</h5>
                <p><strong>Spanish & Argentinian:</strong> Distinctive phonic variations like the "th" and "sh" sounds.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .accent-selector {
            margin-bottom: var(--space-xl);
        }

        .selector-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: var(--space-xl);
          padding: 0 var(--space-sm);
        }

        .header-text h3 {
          margin: 0.5rem 0 0 0;
          color: var(--text-primary);
          font-size: 1.8rem;
        }

        .badge-pill {
            background: rgba(99, 102, 241, 0.1);
            color: var(--primary);
            padding: 0.2rem 0.8rem;
            border-radius: var(--radius-full);
            font-size: 0.75rem;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            border: 1px solid rgba(99, 102, 241, 0.2);
        }

        .info-toggle {
          padding: 0.5rem 1.2rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-glass);
          color: var(--text-secondary);
          border-radius: var(--radius-md);
          cursor: pointer;
          font-size: 0.85rem;
          font-weight: 700;
          transition: all 0.2s;
        }

        .info-toggle:hover {
          background: rgba(255, 255, 255, 0.1);
          color: var(--text-primary);
        }

        .accent-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: var(--space-md);
        }

        .accent-card {
          position: relative;
          cursor: pointer;
          transition: all var(--transition-md);
          background: rgba(255, 255, 255, 0.02) !important;
          border: 1px solid var(--border-glass) !important;
        }

        .accent-card:hover {
          transform: translateY(-4px);
          background: rgba(255, 255, 255, 0.05) !important;
          border-color: rgba(255, 255, 255, 0.2) !important;
        }

        .accent-card.selected {
          border-color: var(--primary) !important;
          background: rgba(99, 102, 241, 0.05) !important;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        .accent-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: var(--space-lg);
        }

        .flag-icon {
          font-size: 2rem;
          filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
        }

        .accent-meta { flex: 1; }
        .accent-meta h4 { margin: 0 0 0.2rem 0; color: var(--text-primary); font-size: 1.1rem; }
        .region-path { margin: 0; color: var(--text-secondary); font-size: 0.85rem; opacity: 0.7; }

        .difficulty-tag {
          padding: 0.2rem 0.6rem;
          border-radius: var(--radius-sm);
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
        }

        .difficulty-tag.beginner { background: rgba(16, 185, 129, 0.1); color: var(--accent); }
        .difficulty-tag.intermediate { background: rgba(245, 158, 11, 0.1); color: var(--warning); }
        .difficulty-tag.advanced { background: rgba(239, 68, 68, 0.1); color: var(--danger); }

        .char-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.4rem; }
        .char-item { display: flex; align-items: center; gap: 0.6rem; font-size: 0.85rem; color: var(--text-secondary); }
        .bullet { font-size: 0.6rem; color: var(--primary); opacity: 0.8; }

        .selection-indicator {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 0;
            height: 3px;
            background: var(--primary);
            transition: width 0.3s ease;
        }

        .accent-card.selected .selection-indicator {
            width: 100%;
        }

        .accent-info-panel {
            margin-top: var(--space-xl);
            padding: var(--space-xl) !important;
            background: rgba(0,0,0,0.2) !important;
        }

        .accent-info-panel h4 { margin-bottom: var(--space-lg); color: var(--primary); font-size: 1.1rem; }

        .info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-xl); }
        .info-section { display: flex; gap: 1rem; }
        .dot { width: 12px; height: 12px; border-radius: 50%; shrink: 0; margin-top: 4px; }
        .dot.beginner { background: var(--accent); }
        .dot.intermediate { background: var(--warning); }
        .dot.advanced { background: var(--danger); }

        .info-content h5 { margin: 0 0 0.4rem 0; font-size: 0.9rem; color: var(--text-primary); }
        .info-content p { margin: 0; font-size: 0.85rem; line-height: 1.5; color: var(--text-secondary); }

        @media (max-width: 900px) {
            .info-grid { grid-template-columns: 1fr; gap: var(--space-lg); }
        }

        @media (max-width: 600px) {
            .selector-header { flex-direction: column; align-items: flex-start; gap: var(--space-md); }
            .accent-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};
