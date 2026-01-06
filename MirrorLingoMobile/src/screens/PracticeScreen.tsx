import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { mirrorLingoAPI, PhraseAnalysis } from '../services/api';

type PracticeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Practice'>;
type PracticeScreenRouteProp = RouteProp<RootStackParamList, 'Practice'>;

interface Props {
  navigation: PracticeScreenNavigationProp;
  route: PracticeScreenRouteProp;
}

export const PracticeScreen: React.FC<Props> = ({ navigation, route }) => {
  const [phrases, setPhrases] = useState<PhraseAnalysis[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPhrases();
  }, []);

  const loadPhrases = async () => {
    try {
      setLoading(true);
      
      if (route.params?.phrases) {
        // Analyze new phrases from recording
        const analyses = await mirrorLingoAPI.analyzePhrases(route.params.phrases);
        setPhrases(analyses);
      } else {
        // Load existing user phrases
        const userPhrases = await mirrorLingoAPI.getUserPhrases();
        setPhrases(userPhrases);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load phrases');
    } finally {
      setLoading(false);
    }
  };

  const currentPhrase = phrases[currentIndex];

  const handleNext = () => {
    if (currentIndex < phrases.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowTranslation(false);
    } else {
      Alert.alert(
        'Practice Complete!',
        'Great job! You\'ve reviewed all your phrases.',
        [
          { text: 'Practice Again', onPress: () => setCurrentIndex(0) },
          { text: 'Go Home', onPress: () => navigation.navigate('Home') },
        ]
      );
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowTranslation(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Analyzing your phrases...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (phrases.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No phrases to practice yet.</Text>
          <TouchableOpacity
            style={styles.recordButton}
            onPress={() => navigation.navigate('Record')}
          >
            <Text style={styles.recordButtonText}>Record Some Phrases</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {currentIndex + 1} of {phrases.length}
          </Text>
        </View>

        <View style={styles.phraseCard}>
          <Text style={styles.englishPhrase}>"{currentPhrase.phrase}"</Text>
          
          {!showTranslation ? (
            <TouchableOpacity
              style={styles.revealButton}
              onPress={() => setShowTranslation(true)}
            >
              <Text style={styles.revealButtonText}>Show Spanish Translation</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.translationContainer}>
              <View style={styles.translationSection}>
                <Text style={styles.translationLabel}>Natural Spanish:</Text>
                <Text style={styles.naturalTranslation}>
                  "{currentPhrase.translations.natural}"
                </Text>
              </View>

              <View style={styles.translationSection}>
                <Text style={styles.translationLabel}>Literal Translation:</Text>
                <Text style={styles.literalTranslation}>
                  "{currentPhrase.translations.literal}"
                </Text>
              </View>

              <View style={styles.explanationSection}>
                <Text style={styles.explanationLabel}>Why this translation?</Text>
                <Text style={styles.explanation}>
                  {currentPhrase.translations.explanation}
                </Text>
              </View>

              {currentPhrase.translations.culturalNotes && (
                <View style={styles.culturalSection}>
                  <Text style={styles.culturalLabel}>Cultural Note:</Text>
                  <Text style={styles.culturalNote}>
                    {currentPhrase.translations.culturalNotes}
                  </Text>
                </View>
              )}

              <View style={styles.styleMatchSection}>
                <Text style={styles.styleMatchLabel}>Style Match:</Text>
                <View style={styles.styleMatchBar}>
                  <View 
                    style={[
                      styles.styleMatchFill,
                      { width: `${currentPhrase.translations.styleMatch * 100}%` }
                    ]}
                  />
                </View>
                <Text style={styles.styleMatchText}>
                  {Math.round(currentPhrase.translations.styleMatch * 100)}% match to your style
                </Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.navigationContainer}>
          <TouchableOpacity
            style={[styles.navButton, currentIndex === 0 && styles.navButtonDisabled]}
            onPress={handlePrevious}
            disabled={currentIndex === 0}
          >
            <Text style={styles.navButtonText}>Previous</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navButton}
            onPress={handleNext}
          >
            <Text style={styles.navButtonText}>
              {currentIndex === phrases.length - 1 ? 'Finish' : 'Next'}
            </Text>
          </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  recordButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
  },
  recordButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  progressText: {
    fontSize: 16,
    color: '#666',
  },
  phraseCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  englishPhrase: {
    fontSize: 20,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
  },
  revealButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  revealButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  translationContainer: {
    marginTop: 10,
  },
  translationSection: {
    marginBottom: 15,
  },
  translationLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    fontWeight: '600',
  },
  naturalTranslation: {
    fontSize: 18,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  literalTranslation: {
    fontSize: 16,
    color: '#666',
  },
  explanationSection: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  explanationLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    marginBottom: 5,
  },
  explanation: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  culturalSection: {
    marginTop: 10,
    padding: 15,
    backgroundColor: '#e8f5e8',
    borderRadius: 8,
  },
  culturalLabel: {
    fontSize: 14,
    color: '#2e7d32',
    fontWeight: '600',
    marginBottom: 5,
  },
  culturalNote: {
    fontSize: 14,
    color: '#2e7d32',
    lineHeight: 20,
  },
  styleMatchSection: {
    marginTop: 15,
  },
  styleMatchLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    marginBottom: 8,
  },
  styleMatchBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 5,
  },
  styleMatchFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  styleMatchText: {
    fontSize: 12,
    color: '#666',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  navButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  navButtonDisabled: {
    backgroundColor: '#ccc',
  },
  navButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
