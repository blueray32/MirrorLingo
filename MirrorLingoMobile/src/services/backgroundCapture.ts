import Voice, { SpeechResultsEvent, SpeechErrorEvent } from '@react-native-voice/voice';
import { PermissionsAndroid, Platform, Alert } from 'react-native';
import { mirrorLingoAPI } from './api';

export type CaptureState = 'idle' | 'listening' | 'processing';

interface CapturedPhrase {
    id: string;
    text: string;
    timestamp: Date;
    synced: boolean;
}

type PhraseCallback = (phrase: CapturedPhrase) => void;
type StateCallback = (state: CaptureState) => void;

class BackgroundCaptureService {
    private state: CaptureState = 'idle';
    private currentBuffer: string = '';
    private capturedPhrases: CapturedPhrase[] = [];
    private phraseCallbacks: PhraseCallback[] = [];
    private stateCallbacks: StateCallback[] = [];
    private silenceTimer: NodeJS.Timeout | null = null;
    private restartTimer: NodeJS.Timeout | null = null;
    private isInitialized: boolean = false;
    private isPaused: boolean = false;

    // How long to wait after speech ends before considering it a complete phrase
    private readonly SILENCE_THRESHOLD_MS = 1500;
    // How often to restart listening (Voice recognition times out after ~60s)
    private readonly RESTART_INTERVAL_MS = 55000;

    constructor() {
        this.initializeVoice();
    }

    private initializeVoice() {
        console.log('[BackgroundCapture] Initializing Voice listeners...');
        Voice.onSpeechStart = this.onSpeechStart.bind(this);
        Voice.onSpeechEnd = this.onSpeechEnd.bind(this);
        Voice.onSpeechResults = this.onSpeechResults.bind(this);
        Voice.onSpeechPartialResults = this.onSpeechPartialResults.bind(this);
        Voice.onSpeechError = this.onSpeechError.bind(this);
        this.isInitialized = true;
    }

    private onSpeechStart() {
        console.log('[BackgroundCapture] Speech detected');
        this.clearSilenceTimer();
    }

    private onSpeechEnd() {
        console.log('[BackgroundCapture] Speech ended, starting silence timer');
        this.startSilenceTimer();
    }

    private onSpeechResults(event: SpeechResultsEvent) {
        if (event.value && event.value[0]) {
            this.currentBuffer = event.value[0];
            console.log('[BackgroundCapture] Final result:', this.currentBuffer);
            this.processCapturedPhrase();
        }
    }

    private onSpeechPartialResults(event: SpeechResultsEvent) {
        if (event.value && event.value[0]) {
            this.currentBuffer = event.value[0];
            console.log('[BackgroundCapture] Partial:', this.currentBuffer.slice(-50));
        }
    }

    private onSpeechError(event: SpeechErrorEvent) {
        const errorDetail = event.error?.message || event.error?.code || JSON.stringify(event.error) || 'Unknown error';
        const code = event.error?.code || '';

        console.log('[BackgroundCapture] Speech error:', errorDetail);

        // Critical: If it's a service failure (Error 5), stop retrying to avoid the flashing loop
        if (String(code) === '5') {
            console.error('[BackgroundCapture] Fatal service error (5). Stopping background capture.');
            this.setState('idle');
            return;
        }

        // If we're still supposed to be listening, restart
        if (this.state === 'listening' && !this.isPaused) {
            this.scheduleRestart(2000); // Wait longer on error before restart
        }
    }

    private startSilenceTimer() {
        this.clearSilenceTimer();
        this.silenceTimer = setTimeout(() => {
            if (this.currentBuffer.trim().length > 5) {
                this.processCapturedPhrase();
            }
        }, this.SILENCE_THRESHOLD_MS);
    }

    private clearSilenceTimer() {
        if (this.silenceTimer) {
            clearTimeout(this.silenceTimer);
            this.silenceTimer = null;
        }
    }

    private processCapturedPhrase() {
        const text = this.currentBuffer.trim();
        if (text.length < 5) return;

        const phrase: CapturedPhrase = {
            id: `capture-${Date.now()}`,
            text,
            timestamp: new Date(),
            synced: false,
        };

        this.capturedPhrases.push(phrase);
        this.currentBuffer = '';

        console.log('[BackgroundCapture] Phrase captured:', text);

        // Notify all subscribers
        this.phraseCallbacks.forEach(cb => cb(phrase));
    }

    private isFatalError(code: string | number): boolean {
        return String(code) === '5';
    }

    private scheduleRestart(delayMs: number = this.RESTART_INTERVAL_MS) {
        if (this.restartTimer) {
            clearTimeout(this.restartTimer);
        }
        this.restartTimer = setTimeout(async () => {
            if (this.state === 'listening' && !this.isPaused) {
                console.log('[BackgroundCapture] Restarting recognition...');
                try {
                    await Voice.stop();
                    await Voice.start('en-US');
                    this.scheduleRestart();
                } catch (error: any) {
                    const code = error?.code || '';
                    if (this.isFatalError(code)) {
                        console.error('[BackgroundCapture] Fatal error during restart. Stopping.');
                        this.setState('idle');
                        return;
                    }
                    console.error('[BackgroundCapture] Restart failed:', error);
                    this.scheduleRestart(2000);
                }
            }
        }, delayMs);
    }

    private setState(newState: CaptureState) {
        this.state = newState;
        this.stateCallbacks.forEach(cb => cb(newState));
    }

    private async requestPermissions(): Promise<boolean> {
        if (Platform.OS === 'android') {
            try {
                const recordAuth = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
                    {
                        title: 'Microphone Permission',
                        message: 'MirrorLingo needs access to your microphone to analyze your speech in the background.',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
                    }
                );

                if (recordAuth === PermissionsAndroid.RESULTS.GRANTED) {
                    return true;
                } else {
                    Alert.alert('Permissions denied', 'Microphone access is required for background capture.');
                    return false;
                }
            } catch (err) {
                console.warn(err);
                return false;
            }
        }
        return true;
    }

    // Public API

    async startCapture(): Promise<void> {
        if (this.state === 'listening') {
            console.log('[BackgroundCapture] Already listening');
            return;
        }

        const hasPermission = await this.requestPermissions();
        if (!hasPermission) return;

        this.initializeVoice();
        this.setState('listening');

        try {
            await Voice.start('en-US');
            console.log('[BackgroundCapture] Started listening');
            this.scheduleRestart();
        } catch (error) {
            console.error('[BackgroundCapture] Failed to start:', error);
            this.setState('idle');
            throw error;
        }
    }

    async stopCapture(): Promise<void> {
        if (this.state === 'idle') {
            return;
        }

        this.clearSilenceTimer();
        if (this.restartTimer) {
            clearTimeout(this.restartTimer);
            this.restartTimer = null;
        }

        try {
            await Voice.stop();
        } catch (error) {
            console.error('[BackgroundCapture] Stop error:', error);
        }

        // Process any remaining buffer
        if (this.currentBuffer.trim().length > 5) {
            this.processCapturedPhrase();
        }

        this.setState('idle');
        console.log('[BackgroundCapture] Stopped listening');
    }

    async pause(): Promise<void> {
        console.log('[BackgroundCapture] Pausing capture and detaching listeners...');
        this.isPaused = true;

        // Clear all timers immediately to stop the loop
        this.clearSilenceTimer();
        if (this.restartTimer) {
            clearTimeout(this.restartTimer);
            this.restartTimer = null;
        }

        if (this.state === 'listening') {
            try {
                await Voice.stop();
            } catch (e) {
                console.warn('[BackgroundCapture] Pause: Voice.stop failed', e);
            }
        }

        // Release the global singleton listeners so other components can use them safely
        try {
            await Voice.removeAllListeners();
        } catch (e) {
            console.warn('[BackgroundCapture] Failed to remove listeners', e);
        }
    }

    async resume(): Promise<void> {
        console.log('[BackgroundCapture] Resuming capture and re-attaching listeners...');
        this.isPaused = false;

        if (this.state === 'listening') {
            // Re-register listeners because they might have been removed by another component
            this.initializeVoice();

            try {
                await Voice.start('en-US');
                this.scheduleRestart();
            } catch (e: any) {
                const code = e?.code || '';
                if (this.isFatalError(code)) {
                    console.error('[BackgroundCapture] Fatal error during resume. Stopping.');
                    this.setState('idle');
                    return;
                }
                console.warn('[BackgroundCapture] Resume: Voice.start failed', e);
                this.scheduleRestart(2000);
            }
        }
    }

    async syncPhrases(): Promise<number> {
        const unsyncedPhrases = this.capturedPhrases.filter(p => !p.synced);
        if (unsyncedPhrases.length === 0) {
            return 0;
        }

        this.setState('processing');

        try {
            const texts = unsyncedPhrases.map(p => p.text);
            await mirrorLingoAPI.analyzePhrases(texts);

            // Mark as synced
            unsyncedPhrases.forEach(p => {
                p.synced = true;
            });

            console.log(`[BackgroundCapture] Synced ${unsyncedPhrases.length} phrases`);
            return unsyncedPhrases.length;
        } catch (error) {
            console.error('[BackgroundCapture] Sync failed:', error);
            throw error;
        } finally {
            if (this.state === 'processing') {
                this.setState('listening');
            }
        }
    }

    onPhraseCaptured(callback: PhraseCallback): () => void {
        this.phraseCallbacks.push(callback);
        return () => {
            this.phraseCallbacks = this.phraseCallbacks.filter(cb => cb !== callback);
        };
    }

    onStateChange(callback: StateCallback): () => void {
        this.stateCallbacks.push(callback);
        return () => {
            this.stateCallbacks = this.stateCallbacks.filter(cb => cb !== callback);
        };
    }

    getState(): CaptureState {
        return this.state;
    }

    getCapturedPhrases(): CapturedPhrase[] {
        return [...this.capturedPhrases];
    }

    getUnsyncedCount(): number {
        return this.capturedPhrases.filter(p => !p.synced).length;
    }

    clearPhrases(): void {
        this.capturedPhrases = [];
    }
}

export const backgroundCaptureService = new BackgroundCaptureService();
