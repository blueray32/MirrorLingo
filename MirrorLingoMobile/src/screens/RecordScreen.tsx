import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { VoiceRecorder } from '../components/VoiceRecorder';
import { Theme } from '../styles/designSystem';
import { StatusBar } from 'react-native';

type RecordScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Record'>;

interface Props {
  navigation: RecordScreenNavigationProp;
}

export const RecordScreen: React.FC<Props> = ({ navigation }) => {
  const [recordings, setRecordings] = useState<Array<{
    id: string;
    audioPath: string;
    transcript: string;
    timestamp: Date;
  }>>([]);

  const handleRecordingComplete = useCallback(async (audioPath: string, transcript: string) => {
    const newRecording = {
      id: Date.now().toString(),
      audioPath,
      transcript,
      timestamp: new Date(),
    };

    setRecordings(prev => [...prev, newRecording]);

    // Show success message
    Alert.alert(
      'Recording Complete!',
      `Transcript: "${transcript}"`,
      [
        {
          text: 'Record Another',
          style: 'default',
        },
        {
          text: 'Analyze & Practice',
          style: 'default',
          onPress: () => {
            // Navigate to practice with recorded phrases
            const transcripts = [...recordings, newRecording].map(r => r.transcript);
            navigation.navigate('Practice', { phrases: transcripts });
          },
        },
      ]
    );
  }, [navigation, recordings]);

  const handleRecordingError = useCallback((error: string) => {
    Alert.alert('Recording Error', error);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.instructions}>
          Record yourself speaking naturally about your daily activities.
          Say phrases you actually use in conversations.
        </Text>

        <VoiceRecorder
          onRecordingComplete={handleRecordingComplete}
          onError={handleRecordingError}
        />

        {recordings.length > 0 && (
          <View style={styles.recordingsSection}>
            <Text style={styles.recordingsTitle}>
              Recorded Phrases ({recordings.length})
            </Text>

            {recordings.map((recording) => (
              <View key={recording.id} style={styles.recordingItem}>
                <Text style={styles.transcript}>"{recording.transcript}"</Text>
                <Text style={styles.timestamp}>
                  {recording.timestamp.toLocaleTimeString()}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.tips}>
          <Text style={styles.tipsTitle}>Recording Tips:</Text>
          <Text style={styles.tip}>• Speak naturally, as you would in conversation</Text>
          <Text style={styles.tip}>• Include phrases you use at work, home, or errands</Text>
          <Text style={styles.tip}>• Try: "Could you take a look at this?"</Text>
          <Text style={styles.tip}>• Try: "No worries, take your time"</Text>
          <Text style={styles.tip}>• Try: "I'll be there in about 10 minutes"</Text>
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
  content: {
    padding: Theme.spacing.md,
  },
  instructions: {
    fontSize: Theme.typography.sizes.md,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Theme.spacing.lg,
    backgroundColor: Theme.colors.card,
    padding: Theme.spacing.md,
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  recordingsSection: {
    marginTop: Theme.spacing.xl,
    backgroundColor: Theme.colors.card,
    padding: Theme.spacing.md,
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  recordingsTitle: {
    fontSize: Theme.typography.sizes.lg,
    fontWeight: 'bold',
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.md,
  },
  recordingItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: Theme.spacing.md,
    borderRadius: Theme.radius.sm,
    marginBottom: Theme.spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: Theme.colors.primary,
  },
  transcript: {
    fontSize: Theme.typography.sizes.md,
    color: Theme.colors.textPrimary,
    marginBottom: 4,
    fontStyle: 'italic',
  },
  timestamp: {
    fontSize: 10,
    color: Theme.colors.textMuted,
    textTransform: 'uppercase',
  },
  tips: {
    marginTop: Theme.spacing.xl,
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    padding: Theme.spacing.md,
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.1)',
  },
  tipsTitle: {
    fontSize: Theme.typography.sizes.md,
    fontWeight: 'bold',
    color: Theme.colors.accent,
    marginBottom: Theme.spacing.sm,
  },
  tip: {
    fontSize: Theme.typography.sizes.sm,
    color: Theme.colors.textSecondary,
    marginBottom: 4,
  },
});
