import React, { useState } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import { ConversationPractice } from '../components/ConversationPractice';
import { ConversationTopic, TOPIC_LABELS } from '../types/conversation';

// Demo user ID - in production, get from auth context
const DEMO_USER_ID = 'demo-user-123';

export default function AIConversation() {
  const [selectedTopic, setSelectedTopic] = useState<ConversationTopic | null>(null);
  const [sessionActive, setSessionActive] = useState(false);
  const [messageCount, setMessageCount] = useState(0);

  const topics: ConversationTopic[] = [
    'daily_life',
    'work',
    'travel',
    'food',
    'hobbies',
    'family',
    'shopping',
    'weather',
    'free_conversation'
  ];

  const handleStartConversation = (topic: ConversationTopic) => {
    setSelectedTopic(topic);
    setSessionActive(true);
  };

  const handleSessionComplete = (session?: { messageCount: number }) => {
    if (session) {
      setMessageCount(session.messageCount);
    }
    setSessionActive(false);
  };

  const handleNewConversation = () => {
    setSelectedTopic(null);
    setSessionActive(false);
    setMessageCount(0);
  };

  return (
    <Layout currentPage="conversation">
      <Head>
        <title>AI Conversation Practice - MirrorLingo</title>
        <meta name="description" content="Practice Spanish conversations with an AI tutor that adapts to your speaking style" />
      </Head>

      <div className="conversation-page">
        {!sessionActive ? (
          <div className="selection-view">
            <header className="page-header">
              <h1>🗣️ Practice <span className="highlight">Speaking</span></h1>
              <p>
                Practice real Spanish conversations with an AI tutor that adapts to your
                speaking style. Choose a topic to begin.
              </p>
            </header>

            <div className="topics-grid">
              {topics.map((topic) => (
                <button
                  key={topic}
                  onClick={() => handleStartConversation(topic)}
                  className="topic-card glass-card"
                >
                  <span className="topic-emoji">{TOPIC_LABELS[topic].split(' ')[0]}</span>
                  <span className="topic-name">{TOPIC_LABELS[topic].split(' ').slice(1).join(' ')}</span>
                </button>
              ))}
            </div>

            {messageCount > 0 && (
              <div className="last-session glass-card">
                <p>Great job! Last session: <strong>{messageCount}</strong> messages exchanged</p>
              </div>
            )}

            <div className="tips-container">
              <div className="tips-section glass-card">
                <h3>💡 Pro Tips</h3>
                <ul>
                  <li>Start with simple phrases and build up complexity</li>
                  <li>Do not worry about perfect grammar - focus on communication</li>
                  <li>Try to use vocabulary from your analyzed phrases</li>
                  <li>Ask questions to keep the conversation flowing</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="active-conversation glass-card">
            <header className="conversation-toolbar">
              <button onClick={handleNewConversation} className="back-btn">
                ← Back to Topics
              </button>
              <div className="topic-indicator">
                <span className="dot"></span>
                {selectedTopic && TOPIC_LABELS[selectedTopic]}
              </div>
            </header>

            <div className="interactive-session">
              <ConversationPractice
                userId={DEMO_USER_ID}
                topic={selectedTopic!}
                onSessionComplete={handleSessionComplete}
              />
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
                .conversation-page {
                    max-width: 1000px;
                    margin: 0 auto;
                }

                .page-header {
                    text-align: center;
                    margin-bottom: var(--space-xl);
                }

                .highlight {
                    background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .page-header p {
                    color: var(--text-secondary);
                    font-size: 1.1rem;
                    max-width: 600px;
                    margin: 0.5rem auto 0;
                }

                .topics-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
                    gap: var(--space-md);
                    margin-bottom: var(--space-xl);
                }

                .topic-card {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    padding: var(--space-lg);
                    transition: all var(--transition-normal);
                    border: 1px solid var(--border-glass);
                    text-align: center;
                }

                .topic-card:hover {
                    border-color: var(--primary);
                    background: rgba(99, 102, 241, 0.1);
                    transform: translateY(-5px);
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
                }

                .topic-emoji {
                    font-size: 2.5rem;
                    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
                }

                .topic-name {
                    font-size: 1rem;
                    font-weight: 700;
                    color: var(--text-primary);
                }

                .last-session {
                    text-align: center;
                    padding: var(--space-md);
                    margin-bottom: var(--space-xl);
                    border-left: 4px solid var(--accent);
                }

                .last-session p {
                    color: var(--text-primary);
                    margin: 0;
                }

                .tips-container {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: var(--space-lg);
                }

                .tips-section h3 {
                    color: var(--text-primary);
                    margin-bottom: var(--space-md);
                    font-size: 1.25rem;
                }

                .tips-section ul {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: var(--space-md);
                }

                .tips-section li {
                    color: var(--text-secondary);
                    padding-left: 1.5rem;
                    position: relative;
                    font-size: 0.95rem;
                    line-height: 1.5;
                }

                .tips-section li::before {
                    content: "✨";
                    position: absolute;
                    left: 0;
                }

                .active-conversation {
                    overflow: hidden;
                    padding: 0 !important;
                }

                .conversation-toolbar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: var(--space-md) var(--space-lg);
                    background: rgba(255, 255, 255, 0.05);
                    border-bottom: 1px solid var(--border-glass);
                }

                .back-btn {
                    padding: 0.6rem 1.2rem;
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid var(--border-glass);
                    border-radius: var(--radius-md);
                    color: var(--text-secondary);
                    font-weight: 600;
                    cursor: pointer;
                    transition: all var(--transition-fast);
                }

                .back-btn:hover {
                    background: rgba(255, 255, 255, 0.2);
                    color: var(--text-primary);
                    border-color: var(--text-secondary);
                }

                .topic-indicator {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-weight: 700;
                    color: var(--primary);
                }

                .dot {
                    width: 8px;
                    height: 8px;
                    background: var(--accent);
                    border-radius: 50%;
                    box-shadow: 0 0 10px var(--accent);
                    animation: pulse 2s infinite;
                }

                @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.5); opacity: 0.6; }
                    100% { transform: scale(1); opacity: 1; }
                }

                .interactive-session {
                   min-height: 500px;
                }

                @media (max-width: 768px) {
                    .topics-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
            `}</style>
    </Layout>
  );
}
