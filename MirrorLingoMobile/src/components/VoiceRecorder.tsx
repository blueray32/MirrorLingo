import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import Voice from '@react-native-voice/voice';

interface VoiceRecorderProps {
  onRecordingComplete: (audioPath: string, transcript: string) => void;
  onError: (error: string) => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onRecordingComplete,
  onError,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioRecorderPlayer] = useState(new AudioRecorderPlayer());
  const [recordTime, setRecordTime] = useState('00:00');
  const [transcript, setTranscript] = useState('');

  useEffect(() => {
    Voice.onSpeechStart = () => console.log('Speech started');
    Voice.onSpeechEnd = () => console.log('Speech ended');
    Voice.onSpeechResults = (e) => {
      if (e.value?.[0]) {
        setTranscript(e.value[0]);
      }
    };
    Voice.onSpeechError = (e) => {
      console.log('Speech error:', e.error);
      onError(`Speech recognition error: ${e.error}`);
    };

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, [onError]);

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const grants = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);

        if (
          grants['android.permission.WRITE_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED &&
          grants['android.permission.READ_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED &&
          grants['android.permission.RECORD_AUDIO'] === PermissionsAndroid.RESULTS.GRANTED
        ) {
          return true;
        } else {
          Alert.alert('Permissions denied');
          return false;
        }
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const startRecording = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      setIsRecording(true);
      
      // Start audio recording
      const audioPath = await audioRecorderPlayer.startRecorder();
      audioRecorderPlayer.addRecordBackListener((e) => {
        setRecordTime(audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)));
      });

      // Start speech recognition
      await Voice.start('en-US');
      
      console.log('Recording started:', audioPath);
    } catch (error) {
      console.error('Failed to start recording:', error);
      onError('Failed to start recording');
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    try {
      const result = await audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.removeRecordBackListener();
      await Voice.stop();
      
      setIsRecording(false);
      setRecordTime('00:00');
      
      onRecordingComplete(result, transcript);
      setTranscript('');
    } catch (error) {
      console.error('Failed to stop recording:', error);
      onError('Failed to stop recording');
      setIsRecording(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Voice Recording</Text>
      
      <View style={styles.recordingContainer}>
        <TouchableOpacity
          style={[
            styles.recordButton,
            isRecording ? styles.recordingActive : styles.recordingInactive,
          ]}
          onPress={isRecording ? stopRecording : startRecording}
        >
          <Text style={styles.recordButtonText}>
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </Text>
        </TouchableOpacity>
        
        {isRecording && (
          <Text style={styles.recordTime}>{recordTime}</Text>
        )}
      </View>
      
      <Text style={styles.instructions}>
        {isRecording 
          ? 'Speak naturally about your daily phrases...' 
          : 'Tap to record your common English phrases'
        }
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  recordingContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  recordButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  recordingActive: {
    backgroundColor: '#ff4444',
  },
  recordingInactive: {
    backgroundColor: '#4CAF50',
  },
  recordButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  recordTime: {
    fontSize: 18,
    color: '#666',
    fontFamily: 'monospace',
  },
  instructions: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
});
