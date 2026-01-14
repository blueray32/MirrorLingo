import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useConversationApi } from '../hooks/useConversationApi';
import { useConversationMemory } from '../hooks/useConversationMemory';
import { useMistakePatterns } from '../hooks/useMistakePatterns';
import { ConversationRelationshipIndicator } from './ConversationRelationshipIndicator';
import { SpanishTextWithTooltips } from './SpanishTextWithTooltips';
import { ConversationTopic, TOPIC_LABELS } from '../types/conversation';

interface ConversationPracticeProps {
  userId: string;
  topic: ConversationTopic;
  userProfile?: {
    tone: string;
    formality: string;
    patterns: string[];
  };
  onSessionComplete?: (session?: { messageCount: number }) => void;
}

// Web Speech API types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

export const ConversationPractice: React.FC<ConversationPracticeProps> = ({
  userId,
  topic,
  userProfile,
  onSessionComplete
}) => {
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Conversation memory hook
  const {
    relationshipStatus,
    conversationMemory,
    isLoading: memoryLoading,
    refreshMemory
  } = useConversationMemory(userId);

  // Mistake patterns hook
  const {
    mistakeCategories,
    personalizedLessons,
    refreshPatterns
  } = useMistakePatterns(userId);

  const {
    messages,
    isLoading,
    error: apiError,
    currentTopic,
    sendMessage,
    startConversation,
    clearConversation
  } = useConversationApi(userId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Start conversation when component mounts with topic
  useEffect(() => {
    startConversation(topic);
  }, [topic, startConversation]);

  // Initialize Web Speech API
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'es-ES'; // Spanish recognition

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setInputText(finalTranscript || interimTranscript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setSpeechError(event.error === 'not-allowed' ? 'Microphone access denied' : 'Speech recognition error');
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;
    await sendMessage(inputText);
    setInputText('');
    setSpeechError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEndSession = () => {
    const session = { messageCount: messages.length };
    clearConversation();
    onSessionComplete?.(session);
  };

  const toggleRecording = useCallback(() => {
    if (!recognitionRef.current) {
      setSpeechError('Speech recognition not supported in this browser');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setSpeechError(null);
      recognitionRef.current.start();
      setIsRecording(true);
    }
  }, [isRecording]);

  const error = apiError || speechError;

  // Conversation screen
  return (
    <div className="conversation-practice chat-mode fade-in">
      <div className="chat-container glass-card">
        <header className="chat-header">
          <div className="header-left">
            <span className="live-status"></span>
            <span className="topic-tag">{TOPIC_LABELS[currentTopic]}</span>
          </div>
          <button className="secondary-btn small end-btn" onClick={handleEndSession}>
            Finish Session
          </button>
        </header>

        {/* Relationship Indicator */}
        <ConversationRelationshipIndicator
          relationshipStatus={relationshipStatus}
          tutorName={conversationMemory?.tutorPersonality?.name}
          isLoading={memoryLoading}
        />

        {/* Grammar Focus Areas */}
        {mistakeCategories.length > 0 && (
          <div className="grammar-focus-indicator">
            <div className="focus-header">
              <span className="focus-icon">🎯</span>
              <span className="focus-title">Grammar Focus</span>
            </div>
            <div className="focus-areas">
              {mistakeCategories
                .filter(cat => cat.focusLevel === 'high')
                .slice(0, 2)
                .map(category => (
                  <span key={category.type} className="focus-area">
                    {category.type.replace('_', ' ')} ({category.currentAccuracy}%)
                  </span>
                ))}
            </div>
          </div>
        )}

        <div className="messages-viewport">
          {messages.length === 0 && !isLoading && (
            <div className="intro-msg">
              <div className="themed-spinner"></div>
              <p>Establishing secure connection to AI Tutor...</p>
            </div>
          )}

          {messages.map(msg => (
            <div key={msg.id} className={`message-bubble ${msg.role}`}>
              <div className="bubble-content">
                {msg.role === 'assistant' || msg.role === 'user' ? (
                  <SpanishTextWithTooltips text={msg.content} />
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="message-bubble assistant loading">
              <div className="bubble-content typing-box">
                <div className="typing-dots">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {error && (
          <div className="error-notice">
            <span className="error-icon">⚠️</span>
            <p>{error}</p>
          </div>
        )}

        <footer className="input-footer">
          <div className="input-wrapper">
            <textarea
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe en español..."
              rows={1}
              disabled={isLoading}
              className="chat-textarea"
            />

            <div className="action-buttons">
              <button
                className={`icon-btn ${isRecording ? 'is-recording' : ''}`}
                onClick={toggleRecording}
                disabled={isLoading}
                title={isRecording ? 'Stop Recording' : 'Start Voice Input'}
              >
                {isRecording ? '⏹️' : '🎤'}
              </button>

              <button
                onClick={handleSend}
                disabled={!inputText.trim() || isLoading}
                className="send-action"
              >
                <span className="send-icon">↗️</span>
              </button>
            </div>
          </div>

          {isRecording && (
            <div className="recording-status">
              <span className="recording-dot"></span>
              <span className="recording-label">Listening to your Spanish...</span>
            </div>
          )}
        </footer>

        <div className="chat-hint">
          💡 Try responding naturally. Focus on your flow, not just grammar.
        </div>
      </div>

      <style jsx>{styles}</style>
    </div>
  );
};

const styles = `
  .conversation-practice {
    max-width: 800px;
    margin: 0 auto;
  }

  .topic-card {
      padding: var(--space-xl) !important;
      text-align: center;
  }

  .topic-header {
      margin-bottom: var(--space-xl);
  }

  .topic-header h2 {
      font-size: 2rem;
      margin: var(--space-md) 0;
      color: var(--text-primary);
  }

  .topic-header p {
      color: var(--text-secondary);
      max-width: 400px;
      margin: 0 auto;
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

  .topics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: var(--space-md);
  }

  .topic-choice-btn {
    padding: var(--space-xl) !important;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-md);
    cursor: pointer;
    transition: all var(--transition-md);
    border: 1px solid var(--border-glass) !important;
    background: rgba(255, 255, 255, 0.02) !important;
  }

  .topic-choice-btn:hover {
    background: rgba(255, 255, 255, 0.05) !important;
    transform: translateY(-5px);
    border-color: var(--primary) !important;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  }

  .topic-icon { font-size: 2.5rem; }
  .topic-label { font-weight: 700; font-size: 1.1rem; color: var(--text-primary); }

  /* Chat Mode */
  .chat-container {
      padding: 0 !important;
      display: flex;
      flex-direction: column;
      height: 700px;
      overflow: hidden;
  }

  .chat-header {
      padding: var(--space-md) var(--space-lg);
      background: rgba(255, 255, 255, 0.03);
      border-bottom: 1px solid var(--border-glass);
      display: flex;
      justify-content: space-between;
      align-items: center;
  }

  .header-left { display: flex; align-items: center; gap: 0.75rem; }
  .live-status { width: 8px; height: 8px; background: var(--accent); border-radius: 50%; box-shadow: 0 0 10px var(--accent); animation: pulse 2s infinite; }
  .topic-tag { font-weight: 800; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.1em; color: var(--text-secondary); }

  .messages-viewport {
      flex: 1;
      overflow-y: auto;
      padding: var(--space-lg);
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
      background: rgba(0, 0, 0, 0.1);
  }

  .intro-msg { text-align: center; margin-top: var(--space-xl); opacity: 0.6; font-size: 0.9rem; color: var(--text-secondary); }
  .themed-spinner { width: 30px; height: 30px; border: 2px solid var(--border-glass); border-top-color: var(--primary); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto var(--space-md); }

  .message-bubble { display: flex; width: 100%; }
  .message-bubble.user { justify-content: flex-end; }
  .message-bubble.assistant { justify-content: flex-start; }

  .bubble-content {
      max-width: 80%;
      padding: 0.8rem 1.2rem;
      border-radius: var(--radius-lg);
      font-size: 1rem;
      line-height: 1.5;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }

  .user .bubble-content {
      background: var(--primary);
      color: white;
      border-bottom-right-radius: 4px;
  }

  .assistant .bubble-content {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(8px);
      border: 1px solid var(--border-glass);
      color: var(--text-primary);
      border-bottom-left-radius: 4px;
      font-weight: 500;
  }

  .typing-dots { display: flex; gap: 4px; }
  .typing-dots span { width: 6px; height: 6px; background: var(--text-secondary); border-radius: 50%; animation: bounce 1.4s infinite ease-in-out; }
  .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
  .typing-dots span:nth-child(3) { animation-delay: 0.4s; }

  .input-footer {
      padding: var(--space-lg);
      background: rgba(255, 255, 255, 0.02);
      border-top: 1px solid var(--border-glass);
  }

  .input-wrapper {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: rgba(0, 0, 0, 0.2);
      border: 1px solid var(--border-glass);
      border-radius: var(--radius-full);
      padding: 0.5rem 0.5rem 0.5rem 1.25rem;
      transition: all 0.2s;
  }

  .input-wrapper:focus-within { border-color: var(--primary); background: rgba(0, 0, 0, 0.3); }

  .chat-textarea {
      flex: 1;
      background: none;
      border: none;
      color: var(--text-primary);
      font-size: 1rem;
      resize: none;
      padding: 0.5rem 0;
      outline: none;
  }

  .action-buttons { display: flex; gap: 0.5rem; }

  .icon-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: none;
      background: rgba(255, 255, 255, 0.05);
      color: var(--text-primary);
      cursor: pointer;
      font-size: 1.2rem;
      transition: all 0.2s;
  }

  .icon-btn.is-recording { background: var(--danger); animation: pulse-red 2s infinite; }

  .send-action {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: none;
      background: var(--primary);
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
  }

  .send-action:disabled { opacity: 0.5; cursor: not-allowed; }
  .send-action:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4); }

  .recording-status {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 0.75rem;
      padding-left: 0.5rem;
  }

  .recording-dot { width: 8px; height: 8px; background: var(--danger); border-radius: 50%; animation: pulse 1s infinite; }
  .recording-label { font-size: 0.8rem; font-weight: 700; color: var(--danger); text-transform: uppercase; }

  .error-notice { padding: 0.75rem var(--space-lg); background: rgba(239, 68, 68, 0.1); color: var(--danger); font-size: 0.85rem; font-weight: 600; display: flex; gap: 0.5rem; }

  .chat-hint { padding: 0.75rem; text-align: center; color: var(--text-secondary); opacity: 0.6; font-size: 0.8rem; }

  .grammar-focus-indicator {
      background: rgba(99, 102, 241, 0.05);
      border: 1px solid rgba(99, 102, 241, 0.2);
      border-radius: 8px;
      padding: 0.75rem;
      margin-bottom: 1rem;
  }

  .focus-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
  }

  .focus-icon { font-size: 1rem; }
  .focus-title { font-size: 0.8rem; font-weight: 600; color: var(--text-primary); }

  .focus-areas {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
  }

  .focus-area {
      background: rgba(99, 102, 241, 0.1);
      color: var(--primary);
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.7rem;
      font-weight: 500;
  }

  @keyframes bounce { 0%, 80%, 100% { transform: scale(0.3); opacity: 0.3; } 40% { transform: scale(1); opacity: 1; } }
  @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes pulse-red { 0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); } 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); } }
`;
