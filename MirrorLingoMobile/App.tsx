import React from 'react';
import { Text, Platform, LogBox } from 'react-native';

// Ignore specific warnings that are safe to skip for this demo
LogBox.ignoreLogs([
  'new NativeEventEmitter()',
  'NativeEventEmitter.removeListener',
]);
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from './src/screens/HomeScreen';
import { RecordScreen } from './src/screens/RecordScreen';
import { PracticeScreen } from './src/screens/PracticeScreen';
import { ProgressScreen } from './src/screens/ProgressScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { TranslationsScreen } from './src/screens/TranslationsScreen';
import { ConversationScreen } from './src/screens/ConversationScreen';
import { TrainingMixerScreen } from './src/screens/TrainingMixerScreen';
import { TutorScreen } from './src/screens/TutorScreen';
import { Theme } from './src/styles/designSystem';

export type RootStackParamList = {
  MainTabs: undefined;
  Record: undefined;
  Practice: { phrases?: string[] };
  Translations: { phrases: any[]; profile: any };
  Conversation: { profile?: any };
  TrainingMixer: { phrases: any[]; profile: any };
};

export type TabParamList = {
  Home: undefined;
  Analytics: undefined;
  Chat: undefined;
  Tutor: undefined;
  Settings: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: Theme.colors.background,
          borderBottomWidth: 1,
          borderBottomColor: Theme.colors.border,
        },
        headerTintColor: Theme.colors.textPrimary,
        tabBarStyle: {
          backgroundColor: Theme.colors.background,
          borderTopWidth: 1,
          borderTopColor: Theme.colors.border,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 30 : 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: -2,
        },
        tabBarActiveTintColor: Theme.colors.primary,
        tabBarInactiveTintColor: Theme.colors.textSecondary,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: 22, color }}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Analytics"
        component={ProgressScreen}
        options={{
          title: 'Stats',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: 22, color }}>📊</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ConversationScreen}
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: 22, color }}>💬</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Tutor"
        component={TutorScreen}
        options={{
          title: 'Tutor',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: 22, color }}>🤖</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: 22, color }}>⚙️</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App(): React.JSX.Element {
  return (
    <NavigationContainer theme={DarkTheme}>
      <Stack.Navigator
        initialRouteName="MainTabs"
        screenOptions={{
          headerStyle: {
            backgroundColor: Theme.colors.background,
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTintColor: Theme.colors.textPrimary,
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
          },
          cardStyle: { backgroundColor: Theme.colors.background },
        }}
      >
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Record"
          component={RecordScreen}
          options={{ title: 'Record Phrases' }}
        />
        <Stack.Screen
          name="Practice"
          component={PracticeScreen}
          options={{ title: 'Practice Spanish' }}
        />
        <Stack.Screen
          name="Translations"
          component={TranslationsScreen}
          options={{ title: 'Spanish Translations' }}
        />
        <Stack.Screen
          name="Conversation"
          component={ConversationScreen}
          options={{ title: 'AI Conversation' }}
        />
        <Stack.Screen
          name="TrainingMixer"
          component={TrainingMixerScreen}
          options={{ title: 'Training Mixer' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

