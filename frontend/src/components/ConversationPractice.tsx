import React, { useState, useRef, useEffect } from 'react';
import { useConversationApi } from '../hooks/useConversationApi';
import { ConversationTopic, TOPIC_LABELS } from '../types/conversation';

interface ConversationPracticeProps {
  userProfile?: {
    tone: string;
    formality: string;
    patterns: string[];
  };
  onSessionComplete?: (session?: { messageCount: number }) => void;
}

export const ConversationPractice: React.FC<ConversationPracticeProps> = ({
  userProfile,
  onSessionComplete
}) => {
  const [inputText, setInputText] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<ConversationTopic | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    messages,
    isLoading,
    error,
    currentTopic,
    sendMessage,
    startConversation,
    clearConversation
  } = useConversationApi();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;
    await sendMessage(inputText);
    setInputText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTopicSelect = (topic: ConversationTopic) => {
    setSelectedTopic(topic);
    startConversation(topic);
  };

  const handleEndSession = () => {
    const session = { messageCount: messages.length };
    clearConversation();
    setSelectedTopic(null);
    onSessionComplete?.(session);
  };

  // Topic selection screen
  if (!selectedTopic) {
    return (
      <div className="conversation-practice">
        <div className="topic-selection">
          <h2>🗣️ Spanish Conversation Practice</h2>
          <p>Choose a topic to start practicing Spanish with your AI tutor</p>
          
          <div className="topics-grid">
            {(Object.keys(TOPIC_LABELS) as ConversationTopic[]).map(topic => (
              <button
                key={topic}
                className="topic-btn"
                onClick={() => handleTopicSelect(topic)}
              >
                {TOPIC_LABELS[topic]}
              </button>
            ))}
          </div>
        </div>

        <style jsx>{`
          .conversation-practice {
            max-width: 600px;
            margin: 0 auto;
            padding: 2rem;
          }
          .topic-selection {
            background: white;
            border-radius: 1rem;
            padding: 2rem;
            text-align: center;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          }
          .topic-selection h2 {
            color: #2d3748;
            margin-bottom: 0.5rem;
          }
          .topic-selection p {
            color: #718096;
            margin-bottom: 2rem;
          }
          .topics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
            gap: 1rem;
          }
          .topic-btn {
            padding: 1rem;
            border: 2px solid #e2e8f0;
            border-radius: 0.75rem;
            background: white;
            cursor: pointer;
            font-size: 1rem;
            transition: all 0.2s;
          }
          .topic-btn:hover {
            border-color: #4299e1;
            background: #ebf8ff;
            transform: translateY(-2px);
          }
        `}</style>
      </div>
    );
  }

  // Conversation screen
  return (
    <div className="conversation-practice">
      <div className="conversation-container">
        <div className="conversation-header">
          <span className="topic-badge">{TOPIC_LABELS[currentTopic]}</span>
          <button className="end-btn" onClick={handleEndSession}>End Session</button>
        </div>

        <div className="messages-container">
          {messages.map(msg => (
            <div key={msg.id} className={`message ${msg.role}`}>
              <div className="message-content">
                {msg.content}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="message assistant">
              <div className="message-content typing">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {error && <div className="error-banner">{error}</div>}

        <div className="input-container">
          <textarea
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe en español..."
            rows={2}
            disabled={isLoading}
          />
          <button 
            onClick={handleSend} 
            disabled={!inputText.trim() || isLoading}
            className="send-btn"
          >
            Send
          </button>
        </div>

        <div className="tips">
          💡 Try responding in Spanish! The AI will gently correct any mistakes.
        </div>
      </div>

      <style jsx>{`
        .conversation-practice {
          max-width: 600px;
          margin: 0 auto;
          padding: 1rem;
        }
        .conversation-container {
          background: white;
          border-radius: 1rem;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        .conversation-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: #f7fafc;
          border-bottom: 1px solid #e2e8f0;
        }
        .topic-badge {
          background: #4299e1;
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 1rem;
          font-size: 0.875rem;
        }
        .end-btn {
          background: none;
          border: 1px solid #e53e3e;
          color: #e53e3e;
          padding: 0.25rem 0.75rem;
          border-radius: 0.5rem;
          cursor: pointer;
          font-size: 0.875rem;
        }
        .end-btn:hover {
          background: #e53e3e;
          color: white;
        }
        .messages-container {
          height: 400px;
          overflow-y: auto;
          padding: 1rem;
        }
        .message {
          margin-bottom: 1rem;
          display: flex;
        }
        .message.user {
          justify-content: flex-end;
        }
        .message.assistant {
          justify-content: flex-start;
        }
        .message-content {
          max-width: 80%;
          padding: 0.75rem 1rem;
          border-radius: 1rem;
          line-height: 1.4;
        }
        .message.user .message-content {
          background: #4299e1;
          color: white;
          border-bottom-right-radius: 0.25rem;
        }
        .message.assistant .message-content {
          background: #f7fafc;
          color: #2d3748;
          border-bottom-left-radius: 0.25rem;
        }
        .typing {
          display: flex;
          gap: 4px;
          padding: 1rem;
        }
        .typing span {
          width: 8px;
          height: 8px;
          background: #a0aec0;
          border-radius: 50%;
          animation: bounce 1.4s infinite ease-in-out;
        }
        .typing span:nth-child(1) { animation-delay: -0.32s; }
        .typing span:nth-child(2) { animation-delay: -0.16s; }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
        .error-banner {
          background: #fed7d7;
          color: #c53030;
          padding: 0.5rem 1rem;
          text-align: center;
        }
        .input-container {
          display: flex;
          gap: 0.5rem;
          padding: 1rem;
          border-top: 1px solid #e2e8f0;
        }
        .input-container textarea {
          flex: 1;
          padding: 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          resize: none;
          font-size: 1rem;
        }
        .input-container textarea:focus {
          outline: none;
          border-color: #4299e1;
        }
        .send-btn {
          padding: 0.75rem 1.5rem;
          background: #48bb78;
          color: white;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          font-weight: 600;
        }
        .send-btn:disabled {
          background: #a0aec0;
          cursor: not-allowed;
        }
        .send-btn:not(:disabled):hover {
          background: #38a169;
        }
        .tips {
          padding: 0.75rem 1rem;
          background: #f0fff4;
          color: #276749;
          font-size: 0.875rem;
          text-align: center;
        }
      `}</style>
    </div>
  );
};
