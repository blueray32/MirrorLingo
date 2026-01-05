import React, { useState, useRef, useCallback } from 'react'
import { ConversationPracticeProps, ConversationTopic, getTopicDisplayName } from '../types/conversation'
import { useConversationApi } from '../hooks/useConversationApi'

export const ConversationPractice: React.FC<ConversationPracticeProps> = ({
  userProfile,
  onSessionComplete
}) => {
  const [selectedTopic, setSelectedTopic] = useState<ConversationTopic | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [currentMessage, setCurrentMessage] = useState('')
  
  const {
    isProcessing,
    currentSession,
    messages,
    error,
    startConversation,
    sendMessage,
    endConversation,
    clearError
  } = useConversationApi()

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const handleStartConversation = async (topic: ConversationTopic) => {
    setSelectedTopic(topic)
    const success = await startConversation(topic)
    if (success) {
      scrollToBottom()
    }
  }

  const handleSendTextMessage = async () => {
    if (!currentMessage.trim()) return
    
    const success = await sendMessage(currentMessage)
    if (success) {
      setCurrentMessage('')
      scrollToBottom()
    }
  }

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      
      const chunks: Blob[] = []
      mediaRecorderRef.current.ondataavailable = (event) => {
        chunks.push(event.data)
      }

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' })
        // For demo, we'll use a placeholder message
        await sendMessage('Mensaje de voz grabado', audioBlob)
        stream.getTracks().forEach(track => track.stop())
        scrollToBottom()
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error starting recording:', error)
    }
  }

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const handleEndConversation = async () => {
    if (currentSession) {
      await endConversation()
      onSessionComplete(currentSession)
    }
  }

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const playTextToSpeech = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'es-ES'
    utterance.rate = 0.8
    speechSynthesis.speak(utterance)
  }

  if (!currentSession) {
    return (
      <div className="conversation-practice">
        <div className="topic-selection">
          <h2>🗣️ Práctica de Conversación</h2>
          <p>Elige un tema para comenzar tu conversación en español</p>
          
          <div className="topics-grid">
            {Object.values(ConversationTopic).map(topic => (
              <button
                key={topic}
                onClick={() => handleStartConversation(topic)}
                className="topic-btn"
                disabled={isProcessing}
              >
                {getTopicDisplayName(topic)}
              </button>
            ))}
          </div>

          {error && (
            <div className="error-message">
              <p>❌ {error}</p>
              <button onClick={clearError}>Intentar de nuevo</button>
            </div>
          )}
        </div>

        <style jsx>{`
          .conversation-practice {
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
          }

          .topic-selection {
            text-align: center;
          }

          .topic-selection h2 {
            color: #2d3748;
            margin-bottom: 1rem;
          }

          .topic-selection p {
            color: #718096;
            margin-bottom: 2rem;
          }

          .topics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
          }

          .topic-btn {
            padding: 1rem;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            border: none;
            border-radius: 0.75rem;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.2s;
          }

          .topic-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
          }

          .topic-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .error-message {
            background: #fed7d7;
            color: #c53030;
            padding: 1rem;
            border-radius: 0.5rem;
            margin-top: 1rem;
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="conversation-practice active">
      <div className="conversation-header">
        <h3>Conversación: {selectedTopic ? getTopicDisplayName(selectedTopic) : 'Libre'}</h3>
        <button onClick={handleEndConversation} className="end-btn">
          Terminar Conversación
        </button>
      </div>

      <div className="messages-container">
        {messages.map(message => (
          <div key={message.id} className={`message ${message.sender}`}>
            <div className="message-content">
              <p>{message.content}</p>
              {message.sender === 'ai' && (
                <button 
                  onClick={() => playTextToSpeech(message.content)}
                  className="play-audio-btn"
                >
                  🔊
                </button>
              )}
            </div>
            <div className="message-time">
              {message.timestamp.toLocaleTimeString()}
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className="message ai processing">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-area">
        <div className="text-input">
          <input
            type="text"
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendTextMessage()}
            placeholder="Escribe tu mensaje en español..."
            disabled={isProcessing}
          />
          <button 
            onClick={handleSendTextMessage}
            disabled={!currentMessage.trim() || isProcessing}
            className="send-btn"
          >
            Enviar
          </button>
        </div>

        <div className="voice-input">
          {!isRecording ? (
            <button 
              onClick={handleStartRecording}
              disabled={isProcessing}
              className="record-btn"
            >
              🎤 Grabar Voz
            </button>
          ) : (
            <button 
              onClick={handleStopRecording}
              className="record-btn recording"
            >
              ⏹️ Parar Grabación
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        .conversation-practice.active {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
          height: 80vh;
          display: flex;
          flex-direction: column;
        }

        .conversation-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: #f8fafc;
          border-radius: 0.75rem;
          margin-bottom: 1rem;
        }

        .conversation-header h3 {
          color: #2d3748;
          margin: 0;
        }

        .end-btn {
          background: #e53e3e;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          cursor: pointer;
        }

        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
          background: white;
          border-radius: 0.75rem;
          margin-bottom: 1rem;
          border: 1px solid #e2e8f0;
        }

        .message {
          margin-bottom: 1rem;
          display: flex;
          flex-direction: column;
        }

        .message.user {
          align-items: flex-end;
        }

        .message.ai {
          align-items: flex-start;
        }

        .message-content {
          max-width: 70%;
          padding: 1rem;
          border-radius: 1rem;
          position: relative;
        }

        .message.user .message-content {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
        }

        .message.ai .message-content {
          background: #f0f9ff;
          color: #1e40af;
          border: 1px solid #bfdbfe;
        }

        .message-content p {
          margin: 0;
          line-height: 1.5;
        }

        .play-audio-btn {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 0.875rem;
        }

        .message-time {
          font-size: 0.75rem;
          color: #718096;
          margin-top: 0.25rem;
        }

        .typing-indicator {
          display: flex;
          gap: 0.25rem;
        }

        .typing-indicator span {
          width: 8px;
          height: 8px;
          background: #4299e1;
          border-radius: 50%;
          animation: typing 1.4s infinite;
        }

        .typing-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typing-indicator span:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes typing {
          0%, 60%, 100% { opacity: 0.3; }
          30% { opacity: 1; }
        }

        .input-area {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .text-input {
          flex: 1;
          display: flex;
          gap: 0.5rem;
        }

        .text-input input {
          flex: 1;
          padding: 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          font-size: 1rem;
        }

        .send-btn {
          background: #48bb78;
          color: white;
          border: none;
          padding: 0.75rem 1rem;
          border-radius: 0.5rem;
          cursor: pointer;
        }

        .send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .record-btn {
          background: #4299e1;
          color: white;
          border: none;
          padding: 0.75rem 1rem;
          border-radius: 0.5rem;
          cursor: pointer;
          white-space: nowrap;
        }

        .record-btn.recording {
          background: #e53e3e;
          animation: pulse 1s infinite;
        }

        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.7; }
          100% { opacity: 1; }
        }

        @media (max-width: 768px) {
          .conversation-practice.active {
            padding: 1rem;
            height: 90vh;
          }

          .input-area {
            flex-direction: column;
          }

          .text-input {
            width: 100%;
          }

          .message-content {
            max-width: 85%;
          }
        }
      `}</style>
    </div>
  )
}
