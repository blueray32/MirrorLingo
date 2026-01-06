import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeScreen } from './src/screens/HomeScreen';
import { RecordScreen } from './src/screens/RecordScreen';
import { PracticeScreen } from './src/screens/PracticeScreen';
import { ProgressScreen } from './src/screens/ProgressScreen';

export type RootStackParamList = {
  Home: undefined;
  Record: undefined;
  Practice: { phrases?: string[] };
  Progress: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App(): React.JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#4CAF50',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ title: 'MirrorLingo' }}
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}
