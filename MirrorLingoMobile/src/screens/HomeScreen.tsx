import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { usePhrasesApi } from '../hooks/usePhrasesApi';

import { Theme } from '../styles/designSystem';
import { backgroundCaptureService, CaptureState } from '../services/backgroundCapture';
import { Alert } from 'react-native';

type HomeScreenNavigationProp = any;

interface Props {
  navigation: HomeScreenNavigationProp;
}

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { phrases, profile, isLoading, loadPhrases } = usePhrasesApi();
  const [activeMode, setActiveMode] = useState<'voice' | 'text' | 'background'>('voice');
  const [manualPhrases, setManualPhrases] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isBackgroundMonitoring, setIsBackgroundMonitoring] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [capturedPhrases, setCapturedPhrases] = useState<Array<{ id: string; text: string; timestamp: Date; synced: boolean }>>([]);
  const [captureState, setCaptureState] = useState<CaptureState>('idle');
  const [isSyncing, setIsSyncing] = useState(false);

  // Initialize persistence
  useEffect(() => {
    const loadSettings = async () => {
      const stored = await AsyncStorage.getItem('background_monitoring');
      if (stored === 'true') {
        setIsBackgroundMonitoring(true);
        setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    };
    loadSettings();
  }, []);

  // Background capture service integration
  useEffect(() => {
    // Subscribe to phrase captures
    const unsubPhrase = backgroundCaptureService.onPhraseCaptured((phrase) => {
      setCapturedPhrases(prev => [...prev, phrase]);
      setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    });

    // Subscribe to state changes
    const unsubState = backgroundCaptureService.onStateChange((state) => {
      setCaptureState(state);
    });

    return () => {
      unsubPhrase();
      unsubState();
    };
  }, []);

  const toggleBackgroundMonitoring = async (value: boolean) => {
    try {
      if (value) {
        await backgroundCaptureService.startCapture();
        setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      } else {
        await backgroundCaptureService.stopCapture();
      }
      setIsBackgroundMonitoring(value);
      await AsyncStorage.setItem('background_monitoring', value.toString());
    } catch (error) {
      console.error('Failed to toggle background monitoring:', error);
      Alert.alert('Microphone Error', 'Could not access the microphone. Please check your permissions.');
    }
  };

  const handleSyncNow = async () => {
    if (capturedPhrases.filter(p => !p.synced).length === 0) {
      Alert.alert('Nothing to Sync', 'Speak some phrases first, then sync them to your Tutor.');
      return;
    }
    setIsSyncing(true);
    try {
      const count = await backgroundCaptureService.syncPhrases();
      // Update local state to mark as synced
      setCapturedPhrases(backgroundCaptureService.getCapturedPhrases());
      Alert.alert('Synced!', `Successfully analyzed ${count} new phrase${count !== 1 ? 's' : ''}. Check your Tutor!`);
    } catch (error) {
      Alert.alert('Sync Failed', 'Could not send phrases. Please try again.');
    } finally {
      setIsSyncing(false);
    }
  };

  const addPhrase = () => {
    if (currentInput.trim()) {
      setManualPhrases([...manualPhrases, currentInput.trim()]);
      setCurrentInput('');
    }
  };

  const removePhrase = (index: number) => {
    const newList = [...manualPhrases];
    newList.splice(index, 1);
    setManualPhrases(newList);
  };

  useEffect(() => {
    loadPhrases();
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
          <Text style={styles.loadingText}>Loading your profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Acoustic Input</Text>
          <Text style={styles.heroSubtitle}>Capture exactly how you speak</Text>
          {isBackgroundMonitoring && (
            <View style={styles.monitoringBadge}>
              <View style={styles.monitoringDot} />
              <Text style={styles.monitoringText}>Monitoring</Text>
            </View>
          )}
        </View>

        <View style={styles.modeTabs}>
          {(['voice', 'text', 'background'] as const).map((mode) => (
            <TouchableOpacity
              key={mode}
              style={[
                styles.modeTab,
                activeMode === mode && styles.activeModeTab
              ]}
              onPress={() => setActiveMode(mode)}
            >
              <Text style={[
                styles.modeTabText,
                activeMode === mode && styles.activeModeTabText
              ]}>
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.mainCard}>
          {activeMode === 'voice' && (
            <View style={styles.modeContent}>
              <Text style={styles.modeEmoji}>🎤</Text>
              <Text style={styles.modeTitle}>Natural Voice Acquisition</Text>
              <Text style={styles.modeDescription}>
                Speak naturally. Our AI will analyze your tone, syntax, and patterns to create your MirrorLingo profile.
              </Text>
              <TouchableOpacity
                style={styles.primaryAction}
                onPress={() => navigation.navigate('Record')}
              >
                <Text style={styles.primaryActionText}>Start Recording</Text>
              </TouchableOpacity>
            </View>
          )}

          {activeMode === 'text' && (
            <View style={styles.modeContent}>
              <Text style={styles.modeEmoji}>⌨️</Text>
              <Text style={styles.modeTitle}>Manual Phrase Entry</Text>
              <Text style={styles.modeDescription}>
                Type phrases you use often in English. We'll translate them into perfect Spanish that matches your style.
              </Text>

              <View style={styles.inputRow}>
                <TextInput
                  style={styles.manualInput}
                  placeholder="Enter a phrase..."
                  placeholderTextColor={Theme.colors.textMuted}
                  value={currentInput}
                  onChangeText={setCurrentInput}
                  onSubmitEditing={addPhrase}
                />
                <TouchableOpacity style={styles.addButton} onPress={addPhrase}>
                  <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
              </View>

              {manualPhrases.length > 0 && (
                <View style={styles.phraseList}>
                  {manualPhrases.map((phrase, index) => (
                    <View key={index} style={styles.phraseItem}>
                      <Text style={styles.phraseItemText} numberOfLines={1}>{phrase}</Text>
                      <TouchableOpacity onPress={() => removePhrase(index)}>
                        <Text style={styles.removeText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              <TouchableOpacity
                style={[
                  styles.primaryAction,
                  manualPhrases.length === 0 && styles.primaryActionDisabled
                ]}
                onPress={() => navigation.navigate('Practice', { phrases: manualPhrases })}
                disabled={manualPhrases.length === 0}
              >
                <Text style={styles.primaryActionText}>
                  {manualPhrases.length > 0 ? `Analyze ${manualPhrases.length} Phrases` : 'Enter Phrases'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {activeMode === 'background' && (
            <View style={styles.modeContent}>
              <Text style={styles.modeEmoji}>📻</Text>
              <Text style={styles.modeTitle}>Background Sync</Text>
              <Text style={styles.modeDescription}>
                Enable background mode to capture natural speech throughout the day efficiently.
              </Text>

              <View style={styles.monitoringCard}>
                <View style={styles.toggleRow}>
                  <View>
                    <Text style={styles.toggleLabel}>Background Monitoring</Text>
                    <Text style={styles.toggleStatus}>
                      {captureState === 'listening' ? '🔴 Listening...' : captureState === 'processing' ? '⏳ Processing...' : 'Inactive'}
                    </Text>
                  </View>
                  <Switch
                    value={isBackgroundMonitoring}
                    onValueChange={toggleBackgroundMonitoring}
                    trackColor={{ false: '#334155', true: Theme.colors.primary }}
                    thumbColor={Platform.OS === 'ios' ? '#fff' : isBackgroundMonitoring ? Theme.colors.secondary : '#94a3b8'}
                  />
                </View>

                {isBackgroundMonitoring && (
                  <View style={styles.syncStatusRow}>
                    <Text style={styles.syncStatusLabel}>Last Capture:</Text>
                    <Text style={styles.syncStatusValue}>{lastSyncTime || 'Waiting...'}</Text>
                  </View>
                )}
              </View>

              {/* Captured Phrases List */}
              {capturedPhrases.length > 0 && (
                <View style={styles.capturedSection}>
                  <Text style={styles.capturedTitle}>
                    Captured Phrases ({capturedPhrases.filter(p => !p.synced).length} unsynced)
                  </Text>
                  {capturedPhrases.slice(-5).reverse().map((phrase) => (
                    <View key={phrase.id} style={[styles.capturedItem, phrase.synced && styles.capturedItemSynced]}>
                      <Text style={styles.capturedText} numberOfLines={2}>"{phrase.text}"</Text>
                      <Text style={styles.capturedMeta}>
                        {phrase.synced ? '✅ Synced' : '⏳ Pending'}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Sync Button */}
              <TouchableOpacity
                style={[styles.primaryAction, isSyncing && styles.primaryActionDisabled]}
                onPress={handleSyncNow}
                disabled={isSyncing}
              >
                {isSyncing ? (
                  <ActivityIndicator size="small" color={Theme.colors.textPrimary} />
                ) : (
                  <Text style={styles.primaryActionText}>Sync Now</Text>
                )}
              </TouchableOpacity>

              <Text style={styles.disclaimer}>
                * Speak naturally. Phrases are captured when you pause.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.proTipBox}>
          <Text style={styles.proTipTitle}>💡 Pro Tip</Text>
          <Text style={styles.proTipText}>
            The more you record, the better your Spanish Tutor becomes. Try to record at least 5 phrases today!
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: Theme.spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Theme.spacing.md,
    fontSize: Theme.typography.sizes.md,
    color: Theme.colors.textSecondary,
  },
  heroSection: {
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
    alignItems: 'center',
  },
  monitoringBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  monitoringDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
    marginRight: 6,
  },
  monitoringText: {
    color: '#10b981',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: Theme.typography.sizes.xxl,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.textPrimary,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: Theme.typography.sizes.md,
    color: Theme.colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  modeTabs: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.card,
    borderRadius: Theme.radius.md,
    padding: 4,
    marginBottom: Theme.spacing.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  modeTab: {
    flex: 1,
    paddingVertical: Theme.spacing.sm,
    alignItems: 'center',
    borderRadius: Theme.radius.sm,
  },
  activeModeTab: {
    backgroundColor: Theme.colors.primary,
  },
  modeTabText: {
    color: Theme.colors.textSecondary,
    fontWeight: Theme.typography.weights.medium,
    fontSize: Theme.typography.sizes.sm,
  },
  activeModeTabText: {
    color: Theme.colors.textPrimary,
  },
  mainCard: {
    backgroundColor: Theme.colors.card,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.xl,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    minHeight: 300,
  },
  modeContent: {
    alignItems: 'center',
  },
  modeEmoji: {
    fontSize: 48,
    marginBottom: Theme.spacing.md,
  },
  modeTitle: {
    fontSize: Theme.typography.sizes.lg,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.sm,
    textAlign: 'center',
  },
  modeDescription: {
    fontSize: Theme.typography.sizes.md,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Theme.spacing.xl,
  },
  primaryAction: {
    backgroundColor: Theme.colors.primary,
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.xl,
    borderRadius: Theme.radius.md,
    width: '100%',
    alignItems: 'center',
  },
  primaryActionText: {
    color: Theme.colors.textPrimary,
    fontSize: Theme.typography.sizes.md,
    fontWeight: Theme.typography.weights.bold,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  toggleLabel: {
    color: Theme.colors.textPrimary,
    fontSize: Theme.typography.sizes.md,
    fontWeight: '600',
  },
  toggleStatus: {
    color: Theme.colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  monitoringCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: Theme.radius.md,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  syncStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Theme.spacing.md,
    paddingTop: Theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  syncStatusLabel: {
    color: Theme.colors.textSecondary,
    fontSize: 13,
  },
  syncStatusValue: {
    color: Theme.colors.primary,
    fontWeight: 'bold',
    fontSize: 13,
  },
  disclaimer: {
    color: Theme.colors.textMuted,
    fontSize: Theme.typography.sizes.xs,
    fontStyle: 'italic',
    marginTop: Theme.spacing.md,
    textAlign: 'center',
  },
  proTipBox: {
    marginTop: Theme.spacing.xl,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: Theme.radius.md,
    padding: Theme.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: Theme.colors.primary,
  },
  proTipTitle: {
    color: Theme.colors.primary,
    fontWeight: Theme.typography.weights.bold,
    marginBottom: 4,
  },
  proTipText: {
    color: Theme.colors.textSecondary,
    fontSize: Theme.typography.sizes.sm,
    lineHeight: 20,
  },
  inputRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 8,
    marginBottom: Theme.spacing.md,
  },
  manualInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: Theme.colors.textPrimary,
    fontSize: 14,
  },
  addButton: {
    backgroundColor: Theme.colors.secondary,
    paddingHorizontal: Theme.spacing.md,
    justifyContent: 'center',
    borderRadius: Theme.radius.sm,
  },
  addButtonText: {
    color: Theme.colors.textPrimary,
    fontWeight: 'bold',
  },
  phraseList: {
    width: '100%',
    maxHeight: 150,
    marginBottom: Theme.spacing.lg,
  },
  phraseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: 8,
    borderRadius: 6,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  phraseItemText: {
    color: Theme.colors.textPrimary,
    fontSize: 13,
    flex: 1,
    marginRight: 8,
  },
  removeText: {
    color: Theme.colors.textMuted,
    fontSize: 16,
    paddingHorizontal: 4,
  },
  primaryActionDisabled: {
    opacity: 0.5,
  },
  capturedSection: {
    marginTop: Theme.spacing.md,
    width: '100%',
  },
  capturedTitle: {
    color: Theme.colors.textSecondary,
    fontSize: Theme.typography.sizes.xs,
    fontWeight: 'bold',
    marginBottom: Theme.spacing.sm,
    textTransform: 'uppercase',
  },
  capturedItem: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    padding: Theme.spacing.sm,
    borderRadius: Theme.radius.sm,
    marginBottom: Theme.spacing.xs,
    borderLeftWidth: 3,
    borderLeftColor: Theme.colors.primary,
  },
  capturedItemSynced: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderLeftColor: Theme.colors.accent,
  },
  capturedText: {
    color: Theme.colors.textPrimary,
    fontSize: Theme.typography.sizes.sm,
    fontStyle: 'italic',
    marginBottom: 2,
  },
  capturedMeta: {
    color: Theme.colors.textMuted,
    fontSize: 10,
  },
});
