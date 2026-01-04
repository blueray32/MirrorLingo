import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { PhraseInput } from '../components/PhraseInput';
import { IdiolectAnalysis } from '../components/IdiolectAnalysis';
import { usePhrasesApi } from '../hooks/usePhrasesApi';

export default function Home() {
  const [showAnalysis, setShowAnalysis] = useState(false);
  const { phrases, profile, loadPhrases, isLoading } = usePhrasesApi();

  // Load existing phrases on component mount
  useEffect(() => {
    loadPhrases().then((success) => {
      if (success && phrases.length > 0) {
        setShowAnalysis(true);
      }
    });
  }, []);

  const handleAnalysisComplete = () => {
    setShowAnalysis(true);
  };

  const handleStartOver = () => {
    setShowAnalysis(false);
  };

  return (
    <>
      <Head>
        <title>MirrorLingo - Your Personal Spanish Learning Coach</title>
        <meta name="description" content="Learn Spanish based on your unique speaking style and daily phrases" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="main-container">
        <header className="app-header">
          <div className="logo-section">
            <h1>MirrorLingo</h1>
            <p>Your Personal Spanish Learning Coach</p>
          </div>
          
          {showAnalysis && (
            <button 
              onClick={handleStartOver}
              className="start-over-btn"
            >
              Analyze New Phrases
            </button>
          )}
        </header>

        <div className="content-area">
          {!showAnalysis ? (
            <div className="input-section">
              <div className="hero-text">
                <h2>Learn Spanish That Matches How You Actually Speak</h2>
                <p>
                  Unlike generic language apps, MirrorLingo analyzes your personal speaking style 
                  and creates Spanish lessons based on phrases you actually use in daily life.
                </p>
              </div>
              <PhraseInput onAnalysisComplete={handleAnalysisComplete} />
            </div>
          ) : (
            <div className="analysis-section">
              <IdiolectAnalysis 
                phrases={phrases} 
                profile={profile} 
                isLoading={isLoading}
              />
              
              {profile && (
                <div className="next-steps">
                  <h3>What's Next?</h3>
                  <div className="next-steps-grid">
                    <div className="step-card">
                      <h4>🎯 Spanish Translations</h4>
                      <p>Get personalized Spanish versions of your phrases with literal and natural translations</p>
                      <button className="step-btn" disabled>Coming Soon</button>
                    </div>
                    <div className="step-card">
                      <h4>🔄 Spaced Practice</h4>
                      <p>Review your phrases with adaptive scheduling to build long-term memory</p>
                      <button className="step-btn" disabled>Coming Soon</button>
                    </div>
                    <div className="step-card">
                      <h4>🎓 Mistake Coaching</h4>
                      <p>Get targeted lessons on grammar patterns specific to your speaking style</p>
                      <button className="step-btn" disabled>Coming Soon</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <footer className="app-footer">
          <p>Built with Kiro CLI for the Dynamous Hackathon 2026</p>
        </footer>
      </main>

      <style jsx>{`
        .main-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .app-header {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          padding: 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .logo-section h1 {
          color: #2d3748;
          margin: 0;
          font-size: 1.8rem;
          font-weight: 700;
        }

        .logo-section p {
          color: #718096;
          margin: 0;
          font-size: 0.9rem;
        }

        .start-over-btn {
          padding: 0.5rem 1rem;
          background-color: #4299e1;
          color: white;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.2s;
        }

        .start-over-btn:hover {
          background-color: #3182ce;
        }

        .content-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 2rem;
        }

        .input-section {
          width: 100%;
          max-width: 800px;
        }

        .hero-text {
          text-align: center;
          color: white;
          margin-bottom: 3rem;
        }

        .hero-text h2 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
          font-weight: 700;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .hero-text p {
          font-size: 1.2rem;
          line-height: 1.6;
          opacity: 0.9;
          max-width: 600px;
          margin: 0 auto;
        }

        .analysis-section {
          width: 100%;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 1rem;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }

        .next-steps {
          padding: 2rem;
          background: #f8fafc;
          border-top: 1px solid #e2e8f0;
        }

        .next-steps h3 {
          text-align: center;
          color: #2d3748;
          margin-bottom: 2rem;
        }

        .next-steps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .step-card {
          background: white;
          padding: 1.5rem;
          border-radius: 0.75rem;
          text-align: center;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .step-card h4 {
          color: #2d3748;
          margin-bottom: 0.5rem;
          font-size: 1.1rem;
        }

        .step-card p {
          color: #718096;
          margin-bottom: 1rem;
          line-height: 1.5;
        }

        .step-btn {
          padding: 0.5rem 1rem;
          background-color: #e2e8f0;
          color: #a0aec0;
          border: none;
          border-radius: 0.5rem;
          cursor: not-allowed;
          font-size: 0.875rem;
        }

        .app-footer {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          padding: 1rem;
          text-align: center;
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.875rem;
        }

        @media (max-width: 768px) {
          .app-header {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }

          .hero-text h2 {
            font-size: 2rem;
          }

          .hero-text p {
            font-size: 1rem;
          }

          .content-area {
            padding: 1rem;
          }

          .next-steps-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <style jsx global>{`
        * {
          box-sizing: border-box;
          padding: 0;
          margin: 0;
        }

        html,
        body {
          max-width: 100vw;
          overflow-x: hidden;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
            'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
            sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        a {
          color: inherit;
          text-decoration: none;
        }
      `}</style>
    </>
  );
}
