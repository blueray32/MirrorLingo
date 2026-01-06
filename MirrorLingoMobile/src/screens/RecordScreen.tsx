import React, { useState } from 'react';
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

  const handleRecordingComplete = async (audioPath: string, transcript: string) => {
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
  };

  const handleRecordingError = (error: string) => {
    Alert.alert('Recording Error', error);
  };

  return (
    <SafeAreaView style={styles.container}>
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
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  instructions: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
  },
  recordingsSection: {
    marginTop: 30,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
  },
  recordingsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  recordingItem: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
  },
  transcript: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  tips: {
    marginTop: 30,
    backgroundColor: '#e8f5e8',
    padding: 15,
    borderRadius: 8,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 10,
  },
  tip: {
    fontSize: 14,
    color: '#2e7d32',
    marginBottom: 5,
  },
});
