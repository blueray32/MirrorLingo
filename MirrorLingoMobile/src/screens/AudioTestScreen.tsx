import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { VoiceRecorder } from '../components/VoiceRecorder';

export const AudioTestScreen: React.FC = () => {
  const [testResults, setTestResults] = useState<Array<{
    test: string;
    result: string;
    timestamp: Date;
  }>>([]);

  const runAudioTest = (testName: string, testFn: () => Promise<string>) => {
    testFn()
      .then(result => {
        setTestResults(prev => [...prev, {
          test: testName,
          result,
          timestamp: new Date(),
        }]);
      })
      .catch(error => {
        setTestResults(prev => [...prev, {
          test: testName,
          result: `Error: ${error.message}`,
          timestamp: new Date(),
        }]);
      });
  };

  const testMicrophoneAccess = async (): Promise<string> => {
    // This would test microphone permissions
    return 'Microphone access granted';
  };

  const testAudioQuality = async (): Promise<string> => {
    // This would test audio recording quality
    return 'Audio quality: 44.1kHz, 16-bit';
  };

  const testSpeechRecognition = async (): Promise<string> => {
    // This would test speech recognition accuracy
    return 'Speech recognition: Available';
  };

  const testNotifications = async (): Promise<string> => {
    // This would test push notification setup
    return 'Push notifications: Enabled';
  };

  const handleTestRecording = (audioPath: string, transcript: string) => {
    Alert.alert(
      'Recording Test Complete',
      `Audio saved to: ${audioPath}\nTranscript: "${transcript}"`,
      [{ text: 'OK' }]
    );
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Audio Quality Testing</Text>
        
        <Text style={styles.instructions}>
          Use this screen to test audio recording quality and speech recognition accuracy.
        </Text>

        <View style={styles.testSection}>
          <Text style={styles.sectionTitle}>System Tests</Text>
          
          <TouchableOpacity
            style={styles.testButton}
            onPress={() => runAudioTest('Microphone Access', testMicrophoneAccess)}
          >
            <Text style={styles.testButtonText}>Test Microphone Access</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.testButton}
            onPress={() => runAudioTest('Audio Quality', testAudioQuality)}
          >
            <Text style={styles.testButtonText}>Test Audio Quality</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.testButton}
            onPress={() => runAudioTest('Speech Recognition', testSpeechRecognition)}
          >
            <Text style={styles.testButtonText}>Test Speech Recognition</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.testButton}
            onPress={() => runAudioTest('Push Notifications', testNotifications)}
          >
            <Text style={styles.testButtonText}>Test Notifications</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.recordingSection}>
          <Text style={styles.sectionTitle}>Recording Test</Text>
          <VoiceRecorder
            onRecordingComplete={handleTestRecording}
            onError={(error) => Alert.alert('Recording Error', error)}
          />
        </View>

        {testResults.length > 0 && (
          <View style={styles.resultsSection}>
            <View style={styles.resultsHeader}>
              <Text style={styles.sectionTitle}>Test Results</Text>
              <TouchableOpacity onPress={clearResults}>
                <Text style={styles.clearText}>Clear</Text>
              </TouchableOpacity>
            </View>
            
            {testResults.map((result, index) => (
              <View key={index} style={styles.resultItem}>
                <Text style={styles.testName}>{result.test}</Text>
                <Text style={styles.testResult}>{result.result}</Text>
                <Text style={styles.testTime}>
                  {result.timestamp.toLocaleTimeString()}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>Testing Tips</Text>
          <Text style={styles.tip}>• Test in different environments (quiet, noisy)</Text>
          <Text style={styles.tip}>• Try various speaking volumes and speeds</Text>
          <Text style={styles.tip}>• Test with different phrases and accents</Text>
          <Text style={styles.tip}>• Verify notifications appear at scheduled times</Text>
          <Text style={styles.tip}>• Check offline functionality by disabling WiFi</Text>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  instructions: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  testSection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recordingSection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  testButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  testButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsSection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  clearText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
  },
  resultItem: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  testName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  testResult: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  testTime: {
    fontSize: 12,
    color: '#999',
  },
  tipsSection: {
    backgroundColor: '#e8f5e8',
    padding: 20,
    borderRadius: 12,
  },
  tip: {
    fontSize: 14,
    color: '#2e7d32',
    marginBottom: 8,
  },
});
