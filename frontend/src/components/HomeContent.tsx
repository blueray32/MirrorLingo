import React, { useState, useEffect, useCallback } from 'react';
import styles from '../pages/index.module.css';
import { usePhrasesApi } from '../hooks/usePhrasesApi';
import { VoiceRecorder } from './VoiceRecorder';
import { PhraseInput } from './PhraseInput';
import { BackgroundRecorder } from './BackgroundRecorder';
import { SpanishTranslations } from './SpanishTranslations';
import { QuickStatsStrip } from './QuickStatsStrip';
import Layout from './Layout';

// Demo user ID - in production, get from auth context
const DEMO_USER_ID = 'demo-user-123';

export const HomeContent: React.FC = () => {
    const [inputMode, setInputMode] = useState<'voice' | 'text' | 'background'>('voice');
    const [backgroundRecording, setBackgroundRecording] = useState(false);
    const [isSpeechSupported, setIsSpeechSupported] = useState(true);
    const [showInputMode, setShowInputMode] = useState(false);

    useEffect(() => {
        setIsSpeechSupported('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
    }, []);

    const { phrases, profile, loadPhrases, isLoading } = usePhrasesApi(DEMO_USER_ID);

    useEffect(() => {
        loadPhrases();
    }, [loadPhrases]);

    const handleAnalysisComplete = useCallback(() => {
        loadPhrases();
    }, [loadPhrases]);

    const handlePhraseDetected = useCallback((phrase: string, confidence: number) => {
        console.log('[HomeContent] Phrase detected in background:', phrase, confidence);
    }, []);

    const handleRecordingComplete = useCallback((audioBlob: Blob, duration: number) => {
        console.log('[HomeContent] Recording complete:', { size: audioBlob.size, duration });
    }, []);

    // Determine if we should show the results view
    const hasData = phrases.length > 0 && profile !== null;

    return (
        <Layout currentPage="home" isListening={backgroundRecording}>
            <div className={styles.homeContainer}>
                {/* Hero/Capture Section - Always visible */}
                <section className={styles.heroSection}>
                    <div className={styles.heroText}>
                        <h1 className={styles.mainTitle}>
                            Learn Spanish That Matches How You <span className={styles.highlight}>Actually Speak</span>
                        </h1>
                        <p className={styles.subtitle}>
                            MirrorLingo analyzes your unique style and synchronizes your persona
                            across languages.
                        </p>
                    </div>

                    <div className={styles.inputModeSelector}>
                        <button
                            onClick={() => setInputMode('voice')}
                            className={`${styles.modeBtn} ${inputMode === 'voice' ? styles.modeBtnActive : ''}`}
                        >
                            🎤 Record Voice
                        </button>
                        <button
                            onClick={() => setInputMode('text')}
                            className={`${styles.modeBtn} ${inputMode === 'text' ? styles.modeBtnActive : ''}`}
                        >
                            ✏️ Type Phrases
                        </button>
                        <button
                            onClick={() => setInputMode('background')}
                            className={`${styles.modeBtn} ${inputMode === 'background' ? styles.modeBtnActive : ''}`}
                        >
                            🔄 Background Mode
                        </button>
                    </div>

                    <div className={styles.mainActionArea}>
                        {inputMode === 'voice' && (
                            <div className={styles.inputContainer}>
                                <VoiceRecorder
                                    userId={DEMO_USER_ID}
                                    onRecordingComplete={handleRecordingComplete}
                                    onAnalysisComplete={handleAnalysisComplete}
                                />
                            </div>
                        )}

                        {inputMode === 'text' && (
                            <div className={styles.inputContainer}>
                                <PhraseInput
                                    userId={DEMO_USER_ID}
                                    onAnalysisComplete={handleAnalysisComplete}
                                />
                            </div>
                        )}

                        {inputMode === 'background' && (
                            <div className={styles.inputContainer}>
                                {!isSpeechSupported ? (
                                    <div className={styles.unsupportedNote}>
                                        <div className={styles.iconLarge}>⚠️</div>
                                        <h3>Speech Recognition Unsupported</h3>
                                        <p>Your current browser doesn't support the Web Speech API. For best results with Background Mode, please use <strong>Google Chrome</strong> on desktop.</p>
                                    </div>
                                ) : (
                                    <div className={styles.backgroundInfo}>
                                        <div className={styles.iconLarge}>{backgroundRecording ? '📡' : '🔄'}</div>
                                        <div className={styles.backgroundText}>
                                            <h3>{backgroundRecording ? 'Background Service Active' : 'Background Learning Mode'}</h3>
                                            <p>
                                                {backgroundRecording
                                                    ? 'MirrorLingo is listening. Speak naturally, and we will capture and analyze your style automatically.'
                                                    : 'Enable background mode to capture your natural speech throughout the day without manual input.'}
                                            </p>
                                            <button
                                                onClick={() => setBackgroundRecording(!backgroundRecording)}
                                                className={`${styles.toggleBtn} ${backgroundRecording ? styles.toggleBtnActive : ''}`}
                                            >
                                                {backgroundRecording ? 'Stop Learning' : 'Start Learning'}
                                            </button>
                                            {backgroundRecording && (
                                                <p className={styles.smallHint}>
                                                    Keep this tab open for background listening to continue.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                    </div>
                </section>

                {/* Quick Stats - Only show when there's data */}
                {hasData && (
                    <div className={styles.statsSection}>
                        <div className={styles.dashboardPreview}>
                            <QuickStatsStrip />
                        </div>

                        {/* Persona Synchronization - Select and Translate */}
                        <div className={styles.translationWrap}>
                            <SpanishTranslations
                                phrases={phrases}
                                profile={profile!}
                                userId={DEMO_USER_ID}
                            />
                        </div>

                        <div className={styles.quickActions}>
                            <h3>Ready for the next step?</h3>
                            <div className={styles.actionButtons}>
                                <button onClick={() => window.location.href = '/ai-conversation'} className={styles.secondaryBtn}>🗣️ Conversation Lab</button>
                                <button onClick={() => window.location.href = '/tutor'} className={styles.secondaryBtn}>🎓 AI Tutor</button>
                                <button onClick={() => window.location.href = '/analytics'} className={styles.secondaryBtn}>📊 Analytics</button>
                            </div>
                        </div>
                    </div>
                )}



                {/* Background Recorder Component */}
                <BackgroundRecorder
                    userId={DEMO_USER_ID}
                    isActive={backgroundRecording}
                    onPhraseDetected={handlePhraseDetected}
                    onAnalysisComplete={() => {
                        loadPhrases();
                    }}
                />
            </div>
        </Layout>
    );
};

export default HomeContent;
