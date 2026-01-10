import React, { useState, useEffect } from 'react'

interface TypingAnimationProps {
  text: string
  speed?: number
  onComplete?: () => void
}

export const TypingAnimation: React.FC<TypingAnimationProps> = ({
  text,
  speed = 50,
  onComplete
}) => {
  const [displayText, setDisplayText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, speed)

      return () => clearTimeout(timer)
    } else if (onComplete) {
      onComplete()
    }
  }, [currentIndex, text, speed, onComplete])

  return (
    <span className="typing-animation">
      {displayText}
      {currentIndex < text.length && <span className="cursor"></span>}

      <style jsx>{`
        .typing-animation {
          font-family: inherit;
          display: inline-flex;
          align-items: center;
        }
        
        .cursor {
          display: inline-block;
          width: 8px;
          height: 1.2em;
          background: var(--primary);
          margin-left: 4px;
          border-radius: 2px;
          animation: blink 0.8s step-end infinite;
          box-shadow: 0 0 10px var(--primary);
        }
        
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </span>
  )
}

interface ProgressBarProps {
  progress: number
  label?: string
  color?: string
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  label,
  color
}) => {
  return (
    <div className="progress-container">
      <div className="progress-info">
        {label && <span className="progress-label">{label}</span>}
        <span className="progress-text">{Math.round(progress)}%</span>
      </div>
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{
            width: `${Math.min(progress, 100)}%`,
            background: color || 'linear-gradient(90deg, var(--primary), var(--secondary))'
          }}
        />
      </div>

      <style jsx>{`
        .progress-container {
          width: 100%;
          margin: 1rem 0;
        }
        
        .progress-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .progress-label {
          color: var(--text-secondary);
        }
        
        .progress-text {
          color: var(--primary);
        }
        
        .progress-track {
          width: 100%;
          height: 8px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: var(--radius-full);
          overflow: hidden;
          border: 1px solid var(--border-glass);
        }
        
        .progress-fill {
          height: 100%;
          transition: width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
          border-radius: var(--radius-full);
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.2);
        }
      `}</style>
    </div>
  )
}

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large'
  color?: string
  text?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color,
  text
}) => {
  const sizeValue = size === 'small' ? '24px' : size === 'large' ? '64px' : '40px';

  return (
    <div className="spinner-wrap">
      <div className="modern-spinner">
        <div className="spinner-ring"></div>
        <div className="spinner-core"></div>
      </div>
      {text && <div className="spinner-msg">{text}</div>}

      <style jsx>{`
        .spinner-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          padding: 2rem;
        }
        
        .modern-spinner {
          position: relative;
          width: ${sizeValue};
          height: ${sizeValue};
        }

        .spinner-ring {
          position: absolute;
          width: 100%;
          height: 100%;
          border: 3px solid var(--border-glass);
          border-top-color: ${color || 'var(--primary)'};
          border-radius: 50%;
          animation: premium-spin 1s cubic-bezier(0.5, 0, 0.5, 1) infinite;
        }

        .spinner-core {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 40%;
          height: 40%;
          background: ${color || 'var(--secondary)'};
          border-radius: 50%;
          transform: translate(-50%, -50%);
          opacity: 0.5;
          animation: pulse-core 1.5s ease-in-out infinite;
        }
        
        .spinner-msg {
          color: var(--text-secondary);
          font-size: 0.9rem;
          font-weight: 600;
          letter-spacing: 0.02em;
        }
        
        @keyframes premium-spin {
          to { transform: rotate(360deg); }
        }

        @keyframes pulse-core {
          0%, 100% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.3; }
          50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.6; }
        }
      `}</style>
    </div>
  )
}
