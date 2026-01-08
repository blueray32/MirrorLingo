import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Switch,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const SettingsScreen: React.FC = () => {
  const [notifications, setNotifications] = useState(true);
  const [autoSync, setAutoSync] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem('userSettings');
      if (settings) {
        const parsed = JSON.parse(settings);
        setNotifications(parsed.notifications ?? true);
        setAutoSync(parsed.autoSync ?? true);
        setOfflineMode(parsed.offlineMode ?? false);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const saveSettings = async (newSettings: any) => {
    try {
      const settings = {
        notifications,
        autoSync,
        offlineMode,
        ...newSettings,
      };
      await AsyncStorage.setItem('userSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const handleNotificationToggle = (value: boolean) => {
    setNotifications(value);
    saveSettings({ notifications: value });
  };

  const handleAutoSyncToggle = (value: boolean) => {
    setAutoSync(value);
    saveSettings({ autoSync: value });
  };

  const handleOfflineModeToggle = (value: boolean) => {
    setOfflineMode(value);
    saveSettings({ offlineMode: value });
  };

  const clearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all your phrases, progress, and settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              Alert.alert('Success', 'All data has been cleared.');
              // Reset settings to defaults
              setNotifications(true);
              setAutoSync(true);
              setOfflineMode(false);
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Practice Reminders</Text>
            <Switch
              value={notifications}
              onValueChange={handleNotificationToggle}
              trackColor={{ false: '#e2e8f0', true: '#667eea' }}
              thumbColor={notifications ? '#ffffff' : '#cbd5e0'}
            />
          </View>
          <Text style={styles.settingDescription}>
            Get daily reminders to practice your Spanish phrases
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Sync</Text>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Auto Sync</Text>
            <Switch
              value={autoSync}
              onValueChange={handleAutoSyncToggle}
              trackColor={{ false: '#e2e8f0', true: '#667eea' }}
              thumbColor={autoSync ? '#ffffff' : '#cbd5e0'}
            />
          </View>
          <Text style={styles.settingDescription}>
            Automatically sync your progress when connected to internet
          </Text>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Offline Mode</Text>
            <Switch
              value={offlineMode}
              onValueChange={handleOfflineModeToggle}
              trackColor={{ false: '#e2e8f0', true: '#667eea' }}
              thumbColor={offlineMode ? '#ffffff' : '#cbd5e0'}
            />
          </View>
          <Text style={styles.settingDescription}>
            Use the app without internet connection (limited features)
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Build</Text>
            <Text style={styles.infoValue}>2026.01.06</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Platform</Text>
            <Text style={styles.infoValue}>React Native</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          <TouchableOpacity style={styles.dangerButton} onPress={clearData}>
            <Text style={styles.dangerButtonText}>Clear All Data</Text>
          </TouchableOpacity>
          <Text style={styles.settingDescription}>
            This will permanently delete all your phrases and progress
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  settingLabel: {
    fontSize: 16,
    color: '#4a5568',
    fontWeight: '600',
  },
  settingDescription: {
    fontSize: 14,
    color: '#718096',
    marginTop: 4,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 16,
    color: '#4a5568',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 16,
    color: '#718096',
  },
  dangerButton: {
    backgroundColor: '#e53e3e',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  dangerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
