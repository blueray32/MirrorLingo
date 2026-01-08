import React, { useState, useRef } from 'react'

interface PronunciationFeedbackProps {
  spanishPhrase: string
  englishPhrase: string
  onComplete: (score: number) => void
}

export const PronunciationFeedback: React.FC<PronunciationFeedbackProps> = ({
  spanishPhrase,
  englishPhrase,
  onComplete
}) => {
  const [isRecording, setIsRecording] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [feedback, setFeedback] = useState<PronunciationFeedback | null>(null)
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        const url = URL.createObjectURL(audioBlob)
        setPlaybackUrl(url)
        
        setIsAnalyzing(true)
        // Simulate pronunciation analysis
        setTimeout(() => {
          const mockFeedback = generateMockFeedback(spanishPhrase)
          setFeedback(mockFeedback)
          setIsAnalyzing(false)
          onComplete(mockFeedback.overallScore)
        }, 2000)

        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
    } catch {
      alert('Could not access microphone')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const playExample = () => {
    // Text-to-speech for Spanish phrase
    const utterance = new SpeechSynthesisUtterance(spanishPhrase)
    utterance.lang = 'es-ES'
    utterance.rate = 0.8
    speechSynthesis.speak(utterance)
  }

  const playRecording = () => {
    if (playbackUrl) {
      const audio = new Audio(playbackUrl)
      audio.play()
    }
  }

  if (isAnalyzing) {
    return (
      <div className="pronunciation-feedback analyzing">
        <div className="analyzing-animation">
          <div className="sound-waves">
            <div className="wave"></div>
            <div className="wave"></div>
            <div className="wave"></div>
          </div>
          <h3>Analyzing Your Pronunciation...</h3>
          <p>Comparing your speech to native Spanish patterns</p>
        </div>

        <style jsx>{`
          .pronunciation-feedback.analyzing {
            background: white;
            border-radius: 1rem;
            padding: 3rem 2rem;
            text-align: center;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          }

          .sound-waves {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 0.25rem;
            margin-bottom: 2rem;
          }

          .wave {
            width: 4px;
            height: 40px;
            background: linear-gradient(to top, #667eea, #764ba2);
            border-radius: 2px;
            animation: wave 1.5s ease-in-out infinite;
          }

          .wave:nth-child(2) {
            animation-delay: 0.2s;
          }

          .wave:nth-child(3) {
            animation-delay: 0.4s;
          }

          @keyframes wave {
            0%, 100% { height: 20px; }
            50% { height: 60px; }
          }

          .analyzing-animation h3 {
            color: #2d3748;
            margin-bottom: 0.5rem;
          }

          .analyzing-animation p {
            color: #718096;
          }
        `}</style>
      </div>
    )
  }

  if (feedback) {
    return (
      <div className="pronunciation-feedback results">
        <div className="feedback-header">
          <h3>🎯 Pronunciation Analysis</h3>
          <div className="overall-score">
            <div className="score-circle">
              <span className="score-value">{feedback.overallScore}</span>
              <span className="score-max">/100</span>
            </div>
            <div className="score-label">Overall Score</div>
          </div>
        </div>

        <div className="feedback-details">
          <div className="phrase-comparison">
            <div className="target-phrase">
              <h4>Target Phrase</h4>
              <p>{spanishPhrase}</p>
              <button onClick={playExample} className="play-btn">
                🔊 Play Example
              </button>
            </div>
            <div className="your-pronunciation">
              <h4>Your Pronunciation</h4>
              <p>{feedback.transcription}</p>
              <button onClick={playRecording} className="play-btn" disabled={!playbackUrl}>
                🎤 Play Recording
              </button>
            </div>
          </div>

          <div className="detailed-scores">
            <div className="score-item">
              <span className="score-label">Accuracy</span>
              <div className="score-bar">
                <div className="score-fill" style={{ width: `${feedback.accuracy}%` }}></div>
              </div>
              <span className="score-percent">{feedback.accuracy}%</span>
            </div>
            <div className="score-item">
              <span className="score-label">Fluency</span>
              <div className="score-bar">
                <div className="score-fill" style={{ width: `${feedback.fluency}%` }}></div>
              </div>
              <span className="score-percent">{feedback.fluency}%</span>
            </div>
            <div className="score-item">
              <span className="score-label">Pronunciation</span>
              <div className="score-bar">
                <div className="score-fill" style={{ width: `${feedback.pronunciation}%` }}></div>
              </div>
              <span className="score-percent">{feedback.pronunciation}%</span>
            </div>
          </div>

          <div className="improvement-tips">
            <h4>💡 Improvement Tips</h4>
            <ul>
              {feedback.tips.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>

        <style jsx>{`
          .pronunciation-feedback.results {
            background: white;
            border-radius: 1rem;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          }

          .feedback-header {
            background: linear-gradient(135deg, #48bb78, #38a169);
            color: white;
            padding: 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .feedback-header h3 {
            margin: 0;
            font-size: 1.5rem;
          }

          .overall-score {
            text-align: center;
          }

          .score-circle {
            width: 80px;
            height: 80px;
            border: 3px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            margin-bottom: 0.5rem;
          }

          .score-value {
            font-size: 1.5rem;
            font-weight: 700;
          }

          .score-max {
            font-size: 0.875rem;
            opacity: 0.8;
          }

          .score-label {
            font-size: 0.875rem;
            opacity: 0.9;
          }

          .feedback-details {
            padding: 2rem;
          }

          .phrase-comparison {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
            margin-bottom: 2rem;
          }

          .target-phrase, .your-pronunciation {
            background: #f8fafc;
            padding: 1.5rem;
            border-radius: 0.75rem;
          }

          .target-phrase h4, .your-pronunciation h4 {
            color: #2d3748;
            margin-bottom: 0.5rem;
            font-size: 1rem;
          }

          .target-phrase p, .your-pronunciation p {
            color: #4a5568;
            font-size: 1.1rem;
            margin-bottom: 1rem;
            font-style: italic;
          }

          .play-btn {
            background: #4299e1;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 0.5rem;
            cursor: pointer;
            font-size: 0.875rem;
          }

          .play-btn:disabled {
            background: #a0aec0;
            cursor: not-allowed;
          }

          .detailed-scores {
            margin-bottom: 2rem;
          }

          .score-item {
            display: grid;
            grid-template-columns: 100px 1fr auto;
            align-items: center;
            gap: 1rem;
            margin-bottom: 1rem;
          }

          .score-item .score-label {
            color: #4a5568;
            font-weight: 500;
          }

          .score-bar {
            height: 8px;
            background: #e2e8f0;
            border-radius: 4px;
            overflow: hidden;
          }

          .score-fill {
            height: 100%;
            background: linear-gradient(90deg, #48bb78, #38a169);
            transition: width 0.5s ease;
          }

          .score-percent {
            color: #38a169;
            font-weight: 600;
            font-size: 0.875rem;
          }

          .improvement-tips h4 {
            color: #2d3748;
            margin-bottom: 1rem;
          }

          .improvement-tips ul {
            color: #4a5568;
            line-height: 1.6;
          }

          .improvement-tips li {
            margin-bottom: 0.5rem;
          }

          @media (max-width: 768px) {
            .feedback-header {
              flex-direction: column;
              gap: 1rem;
            }

            .phrase-comparison {
              grid-template-columns: 1fr;
            }

            .score-item {
              grid-template-columns: 1fr;
              gap: 0.5rem;
            }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="pronunciation-feedback">
      <div className="practice-header">
        <h3>🎤 Pronunciation Practice</h3>
        <p>Practice saying this Spanish phrase and get instant feedback</p>
      </div>

      <div className="phrase-display">
        <div className="english-phrase">
          <h4>English:</h4>
          <p>{englishPhrase}</p>
        </div>
        <div className="spanish-phrase">
          <h4>Spanish:</h4>
          <p>{spanishPhrase}</p>
          <button onClick={playExample} className="example-btn">
            🔊 Hear Example
          </button>
        </div>
      </div>

      <div className="recording-controls">
        {!isRecording ? (
          <button onClick={startRecording} className="record-btn start">
            🎤 Start Recording
          </button>
        ) : (
          <button onClick={stopRecording} className="record-btn stop">
            ⏹️ Stop Recording
          </button>
        )}
      </div>

      <div className="practice-tips">
        <h4>💡 Pronunciation Tips</h4>
        <ul>
          <li>Speak clearly and at a natural pace</li>
          <li>Try to match the rhythm and intonation</li>
          <li>Don't worry about perfection - practice makes progress!</li>
        </ul>
      </div>

      <style jsx>{`
        .pronunciation-feedback {
          background: white;
          border-radius: 1rem;
          padding: 2rem;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }

        .practice-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .practice-header h3 {
          color: #2d3748;
          margin-bottom: 0.5rem;
        }

        .practice-header p {
          color: #718096;
        }

        .phrase-display {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .english-phrase, .spanish-phrase {
          background: #f8fafc;
          padding: 1.5rem;
          border-radius: 0.75rem;
        }

        .spanish-phrase {
          background: #e6fffa;
          border-left: 4px solid #38b2ac;
        }

        .english-phrase h4, .spanish-phrase h4 {
          color: #2d3748;
          margin-bottom: 0.5rem;
          font-size: 1rem;
        }

        .english-phrase p, .spanish-phrase p {
          color: #4a5568;
          font-size: 1.2rem;
          margin-bottom: 1rem;
          font-weight: 500;
        }

        .example-btn {
          background: #38b2ac;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          cursor: pointer;
          font-size: 0.875rem;
        }

        .recording-controls {
          text-align: center;
          margin-bottom: 2rem;
        }

        .record-btn {
          padding: 1rem 2rem;
          font-size: 1.1rem;
          font-weight: 600;
          border: none;
          border-radius: 0.75rem;
          cursor: pointer;
          transition: all 0.2s;
          min-width: 200px;
        }

        .record-btn.start {
          background: linear-gradient(135deg, #48bb78, #38a169);
          color: white;
        }

        .record-btn.stop {
          background: linear-gradient(135deg, #e53e3e, #c53030);
          color: white;
        }

        .record-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
        }

        .practice-tips {
          background: #f0f9ff;
          padding: 1.5rem;
          border-radius: 0.75rem;
        }

        .practice-tips h4 {
          color: #1e40af;
          margin-bottom: 1rem;
        }

        .practice-tips ul {
          color: #1e3a8a;
          line-height: 1.6;
        }

        .practice-tips li {
          margin-bottom: 0.5rem;
        }

        @media (max-width: 768px) {
          .phrase-display {
            grid-template-columns: 1fr;
          }

          .record-btn {
            min-width: 150px;
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  )
}

interface PronunciationFeedback {
  overallScore: number
  accuracy: number
  fluency: number
  pronunciation: number
  transcription: string
  tips: string[]
}

function generateMockFeedback(spanishPhrase: string): PronunciationFeedback {
  const baseScore = 70 + Math.random() * 25 // 70-95 range
  
  return {
    overallScore: Math.round(baseScore),
    accuracy: Math.round(baseScore + Math.random() * 10 - 5),
    fluency: Math.round(baseScore + Math.random() * 10 - 5),
    pronunciation: Math.round(baseScore + Math.random() * 10 - 5),
    transcription: spanishPhrase, // In real app, this would be the recognized speech
    tips: [
      "Focus on rolling your R's more clearly",
      "Try to emphasize the correct syllables",
      "Practice the vowel sounds - they're more distinct in Spanish"
    ]
  }
}
