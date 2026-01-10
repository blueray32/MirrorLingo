import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { PhraseInput } from './PhraseInput';
import Layout from './Layout';
import styles from '../pages/index.module.css';
import { usePhrasesApi } from '../hooks/usePhrasesApi';

const VoiceRecorder = dynamic(() =>
    import('./VoiceRecorder').then(mod => mod.VoiceRecorder),
    { ssr: false }
);

const BackgroundRecorder = dynamic(() =>
    import('./BackgroundRecorder').then(mod => mod.BackgroundRecorder),
    { ssr: false }
);

// Demo user ID - in production, get from auth context
const DEMO_USER_ID = 'demo-user-123';

export const HomeContent: React.FC = () => {
    const [inputMode, setInputMode] = useState<'voice' | 'text' | 'background'>('voice');
    const [backgroundRecording, setBackgroundRecording] = useState(false);
    const { phrases, loadPhrases } = usePhrasesApi(DEMO_USER_ID);

    // Load existing phrases on component mount
    useEffect(() => {
        loadPhrases();
    }, [loadPhrases]);

    const handleAnalysisComplete = () => {
        loadPhrases(); // Refresh phrases after new ones are added
    };

    const handleRecordingComplete = useCallback(async (_audioBlob: Blob, _duration: number) => {
        // Audio processing handled by useAudioApi hook
    }, []);

    const handlePhraseDetected = useCallback((_phrase: string, _confidence: number) => {
        // Phrase analysis handled by usePhrasesApi hook
    }, []);

    return (
        <Layout currentPage="home">
            <div className={styles.homeContainer}>
                <div className={styles.inputSection}>
                    <div className={styles.heroText}>
                        <h1 className={styles.mainTitle}>Learn Spanish That Matches How You <span className={styles.highlight}>Actually Speak</span></h1>
                        <p className={styles.subtitle}>
                            MirrorLingo analyzes your unique speaking style and creates Spanish lessons
                            perfectly tailored to your personality.
                        </p>
                    </div>

                    <div className={`${styles.inputModeSelector} glass-card`}>
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

                    <div className={`${styles.inputContainer} glass-card`}>
                        {inputMode === 'voice' ? (
                            <VoiceRecorder
                                userId={DEMO_USER_ID}
                                onRecordingComplete={handleRecordingComplete}
                                onAnalysisComplete={handleAnalysisComplete}
                            />
                        ) : inputMode === 'background' ? (
                            <div className={styles.backgroundModeInfo}>
                                <h3>Background Learning Mode</h3>
                                <p>
                                    MirrorLingo will listen in the background and automatically detect
                                    phrases as you speak naturally throughout your day.
                                </p>
                                <div>
                                    <button
                                        onClick={() => setBackgroundRecording(!backgroundRecording)}
                                        className={`${styles.primaryBtn} ${backgroundRecording ? styles.primaryBtnAbort : ''}`}
                                    >
                                        {backgroundRecording ? '⏹️ Stop Learning' : '▶️ Start Learning'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <PhraseInput userId={DEMO_USER_ID} onAnalysisComplete={handleAnalysisComplete} />
                        )}
                    </div>

                    <div className={styles.quickAccess}>
                        <button onClick={() => window.location.href = '/ai-conversation'} className={styles.secondaryBtn}>🗣️ Conversation Practice</button>
                        <button onClick={() => window.location.href = '/tutor'} className={styles.secondaryBtn}>🎯 Pronunciation Practice</button>
                    </div>

                    {phrases.length > 0 && (
                        <div className={styles.phrasesCount}>
                            ✓ {phrases.length} phrase{phrases.length !== 1 ? 's' : ''} captured - View in Analytics tab
                        </div>
                    )}
                </div>
            </div>

            {/* Background Recorder - always rendered when active */}
            <BackgroundRecorder
                userId={DEMO_USER_ID}
                isActive={backgroundRecording}
                onPhraseDetected={handlePhraseDetected}
                onAnalysisComplete={() => {
                    loadPhrases();
                }}
            />
        </Layout>
    );
};

export default HomeContent;
