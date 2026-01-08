import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { usePhrasesApi } from '../hooks/usePhrasesApi';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { phrases, profile, isLoading, loadPhrases } = usePhrasesApi();
  const [showAnalysis, setShowAnalysis] = useState(false);

  useEffect(() => {
    loadPhrases().then((success) => {
      if (success && phrases.length > 0) {
        setShowAnalysis(true);
      }
    });
  }, []);

  const handleStartOver = () => {
    setShowAnalysis(false);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Loading your phrases...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>MirrorLingo</Text>
          <Text style={styles.subtitle}>Your Personal Spanish Learning Coach</Text>
          
          {showAnalysis && (
            <TouchableOpacity
              style={styles.startOverButton}
              onPress={handleStartOver}
            >
              <Text style={styles.startOverButtonText}>Analyze New Phrases</Text>
            </TouchableOpacity>
          )}
        </View>

        {!showAnalysis ? (
          <View style={styles.content}>
            <Text style={styles.description}>
              Learn Spanish that matches how you actually speak. Record your daily phrases 
              and get personalized Spanish lessons with AI-powered analysis.
            </Text>

            <View style={styles.inputModeSection}>
              <Text style={styles.sectionTitle}>Choose Your Input Method:</Text>
              
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={() => navigation.navigate('Record')}
              >
                <Text style={styles.buttonEmoji}>🎤</Text>
                <Text style={styles.primaryButtonText}>Record Voice</Text>
                <Text style={styles.buttonDescription}>Speak naturally and let AI analyze your patterns</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={() => navigation.navigate('Conversation')}
              >
                <Text style={styles.buttonEmoji}>🗣️</Text>
                <Text style={styles.secondaryButtonText}>Try AI Conversation</Text>
                <Text style={styles.buttonDescription}>Practice Spanish with personalized AI tutor</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.features}>
              <Text style={styles.featureTitle}>Key Features:</Text>
              <Text style={styles.feature}>🎤 Voice & Text Analysis</Text>
              <Text style={styles.feature}>🧠 AI-Powered Personalization</Text>
              <Text style={styles.feature}>🇪🇸 Dual Spanish Translations</Text>
              <Text style={styles.feature}>🗣️ AI Conversation Practice</Text>
              <Text style={styles.feature}>🎓 Training Mixer Exercises</Text>
              <Text style={styles.feature}>📚 Spaced Repetition Learning</Text>
              <Text style={styles.feature}>📊 Progress Tracking</Text>
            </View>
          </View>
        ) : (
          <View style={styles.analysisSection}>
            <View style={styles.analysisHeader}>
              <Text style={styles.analysisTitle}>Your Analysis Results</Text>
              <Text style={styles.analysisSubtitle}>
                {phrases.length} phrases analyzed • {profile?.tone || 'Casual'} tone detected
              </Text>
            </View>

            <View style={styles.nextStepsGrid}>
              <TouchableOpacity
                style={styles.stepCard}
                onPress={() => navigation.navigate('Translations', { phrases, profile })}
              >
                <Text style={styles.stepEmoji}>🎯</Text>
                <Text style={styles.stepTitle}>Spanish Translations</Text>
                <Text style={styles.stepDescription}>
                  Get personalized Spanish versions with literal and natural translations
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.stepCard}
                onPress={() => navigation.navigate('Conversation', { profile })}
              >
                <Text style={styles.stepEmoji}>🗣️</Text>
                <Text style={styles.stepTitle}>AI Conversation</Text>
                <Text style={styles.stepDescription}>
                  Practice real Spanish conversations with an AI tutor that adapts to your style
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.stepCard}
                onPress={() => navigation.navigate('Practice', { phrases })}
              >
                <Text style={styles.stepEmoji}>🔄</Text>
                <Text style={styles.stepTitle}>Spaced Practice</Text>
                <Text style={styles.stepDescription}>
                  Review your phrases with adaptive scheduling to build long-term memory
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.stepCard}
                onPress={() => navigation.navigate('TrainingMixer', { phrases, profile })}
              >
                <Text style={styles.stepEmoji}>🎓</Text>
                <Text style={styles.stepTitle}>Training Mixer</Text>
                <Text style={styles.stepDescription}>
                  Practice with mixed exercises generated from your own phrases
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.progressButton}
              onPress={() => navigation.navigate('Progress')}
            >
              <Text style={styles.progressButtonText}>📊 View Detailed Progress</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#4a5568',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
    marginBottom: 16,
  },
  startOverButton: {
    backgroundColor: '#4299e1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  startOverButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  description: {
    fontSize: 16,
    color: '#4a5568',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  inputModeSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButton: {
    backgroundColor: '#667eea',
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#667eea',
  },
  buttonEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  secondaryButtonText: {
    color: '#667eea',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  buttonDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    textAlign: 'center',
  },
  features: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 16,
  },
  feature: {
    fontSize: 16,
    color: '#4a5568',
    marginBottom: 8,
  },
  analysisSection: {
    padding: 20,
  },
  analysisHeader: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  analysisTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 8,
  },
  analysisSubtitle: {
    fontSize: 16,
    color: '#718096',
  },
  nextStepsGrid: {
    marginBottom: 24,
  },
  stepCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stepEmoji: {
    fontSize: 32,
    marginBottom: 12,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 14,
    color: '#718096',
    lineHeight: 20,
  },
  progressButton: {
    backgroundColor: '#48bb78',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
