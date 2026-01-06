import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { notificationService } from '../services/notifications';
import { offlineService } from '../services/offline';

export const SettingsScreen: React.FC = () => {
  const [settings, setSettings] = useState({
    notificationsEnabled: true,
    dailyReminderEnabled: true,
    dailyReminderTime: { hour: 19, minute: 0 },
  });
  const [storageInfo, setStorageInfo] = useState({
    phrasesCount: 0,
    progressCount: 0,
    unsyncedPhrases: 0,
    unsyncedProgress: 0,
  });

  useEffect(() => {
    loadSettings();
    loadStorageInfo();
  }, []);

  const loadSettings = async () => {
    const savedSettings = await offlineService.getSettings();
    setSettings(savedSettings);
  };

  const loadStorageInfo = async () => {
    const info = await offlineService.getStorageInfo();
    setStorageInfo(info);
  };

  const updateSetting = async (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await offlineService.saveSettings(newSettings);

    // Handle notification settings
    if (key === 'notificationsEnabled') {
      if (value) {
        await notificationService.requestPermissions();
      }
    }

    if (key === 'dailyReminderEnabled') {
      if (value && settings.notificationsEnabled) {
        notificationService.scheduleDaily(
          settings.dailyReminderTime.hour,
          settings.dailyReminderTime.minute
        );
      } else {
        notificationService.cancelDailyReminder();
      }
    }
  };

  const clearOfflineData = () => {
    Alert.alert(
      'Clear Offline Data',
      'This will remove all cached phrases and progress. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await offlineService.clearAllData();
            await loadStorageInfo();
            Alert.alert('Success', 'Offline data cleared');
          },
        },
      ]
    );
  };

  const testNotification = () => {
    notificationService.scheduleSpacedRepetition({
      phraseId: 'test-123',
      phrase: 'Could you take a look at this?',
      nextReview: new Date(Date.now() + 5000), // 5 seconds from now
      interval: 1,
      easeFactor: 2.5,
      repetitions: 0,
    });
    Alert.alert('Test Notification', 'A test notification will appear in 5 seconds');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Settings</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Enable Notifications</Text>
            <Switch
              value={settings.notificationsEnabled}
              onValueChange={(value) => updateSetting('notificationsEnabled', value)}
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Daily Reminder</Text>
            <Switch
              value={settings.dailyReminderEnabled}
              onValueChange={(value) => updateSetting('dailyReminderEnabled', value)}
              disabled={!settings.notificationsEnabled}
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={testNotification}>
            <Text style={styles.buttonText}>Test Notification</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Offline Storage</Text>
          
          <View style={styles.storageInfo}>
            <Text style={styles.storageText}>Phrases: {storageInfo.phrasesCount}</Text>
            <Text style={styles.storageText}>Progress Records: {storageInfo.progressCount}</Text>
            <Text style={styles.storageText}>Unsynced Phrases: {storageInfo.unsyncedPhrases}</Text>
            <Text style={styles.storageText}>Unsynced Progress: {storageInfo.unsyncedProgress}</Text>
          </View>

          <TouchableOpacity 
            style={[styles.button, styles.dangerButton]} 
            onPress={clearOfflineData}
          >
            <Text style={styles.buttonText}>Clear Offline Data</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.aboutText}>
            MirrorLingo Mobile v1.0.0{'\n'}
            Your Personal Spanish Learning Coach{'\n\n'}
            Built with React Native and AWS
          </Text>
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
    marginBottom: 30,
  },
  section: {
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
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  dangerButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  storageInfo: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  storageText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  aboutText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
