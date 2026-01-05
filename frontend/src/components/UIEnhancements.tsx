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
      {currentIndex < text.length && <span className="cursor">|</span>}
      
      <style jsx>{`
        .typing-animation {
          font-family: inherit;
        }
        
        .cursor {
          animation: blink 1s infinite;
          color: #4299e1;
        }
        
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
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
  color = '#4299e1'
}) => {
  return (
    <div className="progress-container">
      {label && <div className="progress-label">{label}</div>}
      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ 
            width: `${Math.min(progress, 100)}%`,
            backgroundColor: color
          }}
        />
      </div>
      <div className="progress-text">{Math.round(progress)}%</div>
      
      <style jsx>{`
        .progress-container {
          width: 100%;
          margin: 1rem 0;
        }
        
        .progress-label {
          font-size: 0.875rem;
          color: #718096;
          margin-bottom: 0.5rem;
        }
        
        .progress-bar {
          width: 100%;
          height: 8px;
          background: #e2e8f0;
          border-radius: 4px;
          overflow: hidden;
        }
        
        .progress-fill {
          height: 100%;
          transition: width 0.3s ease;
          border-radius: 4px;
        }
        
        .progress-text {
          font-size: 0.75rem;
          color: #4a5568;
          text-align: center;
          margin-top: 0.25rem;
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
  color = '#4299e1',
  text
}) => {
  const sizeMap = {
    small: '20px',
    medium: '40px',
    large: '60px'
  }

  return (
    <div className="spinner-container">
      <div className="spinner" />
      {text && <div className="spinner-text">{text}</div>}
      
      <style jsx>{`
        .spinner-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }
        
        .spinner {
          width: ${sizeMap[size]};
          height: ${sizeMap[size]};
          border: 3px solid #e2e8f0;
          border-top: 3px solid ${color};
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        .spinner-text {
          color: #718096;
          font-size: 0.875rem;
          text-align: center;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
