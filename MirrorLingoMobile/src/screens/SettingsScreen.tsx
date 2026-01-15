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
  Platform,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme } from '../styles/designSystem';

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
      <StatusBar barStyle="light-content" />
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Practice Reminders</Text>
            <Switch
              value={notifications}
              onValueChange={handleNotificationToggle}
              trackColor={{ false: '#334155', true: Theme.colors.primary }}
              thumbColor={Platform.OS === 'ios' ? '#fff' : notifications ? Theme.colors.secondary : '#94a3b8'}
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
              trackColor={{ false: '#334155', true: Theme.colors.primary }}
              thumbColor={Platform.OS === 'ios' ? '#fff' : autoSync ? Theme.colors.secondary : '#94a3b8'}
            />
          </View>
          <Text style={styles.settingDescription}>
            Automatically sync your progress when connected to internet
          </Text>

          <View style={[styles.settingRow, { marginTop: Theme.spacing.md }]}>
            <Text style={styles.settingLabel}>Offline Mode</Text>
            <Switch
              value={offlineMode}
              onValueChange={handleOfflineModeToggle}
              trackColor={{ false: '#334155', true: Theme.colors.primary }}
              thumbColor={Platform.OS === 'ios' ? '#fff' : offlineMode ? Theme.colors.secondary : '#94a3b8'}
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
            <Text style={styles.infoValue}>2026.01.15</Text>
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
    backgroundColor: Theme.colors.background,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: Theme.spacing.md,
    paddingBottom: Theme.spacing.xl,
  },
  section: {
    backgroundColor: Theme.colors.card,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  sectionTitle: {
    fontSize: Theme.typography.sizes.lg,
    fontWeight: 'bold',
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.xs,
  },
  settingLabel: {
    fontSize: Theme.typography.sizes.md,
    color: Theme.colors.textPrimary,
    fontWeight: '600',
  },
  settingDescription: {
    fontSize: Theme.typography.sizes.sm,
    color: Theme.colors.textMuted,
    marginTop: 2,
    lineHeight: 18,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  infoLabel: {
    fontSize: Theme.typography.sizes.md,
    color: Theme.colors.textSecondary,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: Theme.typography.sizes.md,
    color: Theme.colors.primary,
    fontWeight: '600',
  },
  dangerButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    borderRadius: Theme.radius.md,
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  dangerButtonText: {
    color: Theme.colors.error,
    fontSize: Theme.typography.sizes.md,
    fontWeight: 'bold',
  },
});
