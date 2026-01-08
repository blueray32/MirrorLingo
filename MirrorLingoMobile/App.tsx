import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeScreen } from './src/screens/HomeScreen';
import { RecordScreen } from './src/screens/RecordScreen';
import { PracticeScreen } from './src/screens/PracticeScreen';
import { ProgressScreen } from './src/screens/ProgressScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { TranslationsScreen } from './src/screens/TranslationsScreen';
import { ConversationScreen } from './src/screens/ConversationScreen';
import { TrainingMixerScreen } from './src/screens/TrainingMixerScreen';

export type RootStackParamList = {
  Home: undefined;
  Record: undefined;
  Practice: { phrases?: string[] };
  Progress: undefined;
  Settings: undefined;
  Translations: { phrases: any[]; profile: any };
  Conversation: { profile?: any };
  TrainingMixer: { phrases: any[]; profile: any };
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App(): React.JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#667eea',
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
          },
          cardStyle: { backgroundColor: '#f8fafc' },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ 
            title: 'MirrorLingo',
            headerTitleStyle: {
              fontWeight: 'bold',
              fontSize: 20,
            }
          }}
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
          name="Progress" 
          component={ProgressScreen}
          options={{ title: 'Your Progress' }}
        />
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen}
          options={{ title: 'Settings' }}
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
