import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

type ConversationScreenRouteProp = RouteProp<RootStackParamList, 'Conversation'>;
type ConversationScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Conversation'>;

interface Props {
  route: ConversationScreenRouteProp;
  navigation: ConversationScreenNavigationProp;
}

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  correction?: {
    original: string;
    corrected: string;
    explanation: string;
  };
}

interface SessionStats {
  messageCount: number;
  startTime: Date;
}

const CONVERSATION_TOPICS = [
  { id: 'daily', name: 'Daily Life', emoji: '🏠' },
  { id: 'work', name: 'Work', emoji: '💼' },
  { id: 'travel', name: 'Travel', emoji: '✈️' },
  { id: 'food', name: 'Food', emoji: '🍽️' },
  { id: 'family', name: 'Family', emoji: '👨‍👩‍👧‍👦' },
  { id: 'hobbies', name: 'Hobbies', emoji: '🎨' },
  { id: 'shopping', name: 'Shopping', emoji: '🛍️' },
  { id: 'health', name: 'Health', emoji: '🏥' },
  { id: 'weather', name: 'Weather', emoji: '🌤️' },
];

export const ConversationScreen: React.FC<Props> = ({ route, navigation }) => {
  const { profile } = route.params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionStats, setSessionStats] = useState<SessionStats | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [currentTips, setCurrentTips] = useState<string[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);

  // Initialize user ID
  useEffect(() => {
    const initUserId = async () => {
      const stored = await AsyncStorage.getItem('user_id');
      if (stored) {
        setUserId(stored);
      } else {
        const newId = `mobile-${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`;
        await AsyncStorage.setItem('user_id', newId);
        setUserId(newId);
      }
    };
    initUserId();
  }, []);

  useEffect(() => {
    // Add welcome message
    setMessages([{
      id: '1',
      text: '¡Hola! I\'m your Spanish conversation partner. Choose a topic to start practicing!',
      isUser: false,
      timestamp: new Date(),
    }]);
  }, []);

  const selectTopic = (topicId: string) => {
    setSelectedTopic(topicId);
    const topic = CONVERSATION_TOPICS.find(t => t.id === topicId);
    
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      text: `Great! Let's talk about ${topic?.name.toLowerCase()}. I'll adapt to your speaking style. Start with any question or comment in Spanish!`,
      isUser: false,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, welcomeMessage]);
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    // Update session stats
    if (!sessionStats) {
      setSessionStats({ messageCount: 1, startTime: new Date() });
    } else {
      setSessionStats(prev => prev ? { ...prev, messageCount: prev.messageCount + 1 } : null);
    }

    try {
      // Generate AI response
      const result = await generateAIResponse(inputText, selectedTopic, profile);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: result.response,
        isUser: false,
        timestamp: new Date(),
        correction: result.correction,
      };

      setMessages(prev => [...prev, aiMessage]);

      // Store tips for display
      if (result.tips && result.tips.length > 0) {
        setCurrentTips(result.tips);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to get AI response');
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIResponse = async (
    userInput: string,
    topic: string | null,
    userProfile: any
  ): Promise<{ response: string; correction?: { original: string; corrected: string; explanation: string }; tips?: string[] }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/conversation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify({
          message: userInput,
          context: {
            topic: topic || 'general',
            profile: userProfile,
            previousMessages: messages.slice(-6).map(m => ({
              role: m.isUser ? 'user' : 'assistant',
              content: m.text,
            })),
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.data) {
        return {
          response: data.data.response,
          correction: data.data.correction,
          tips: data.data.tips,
        };
      }

      throw new Error('Invalid API response');
    } catch (error) {
      console.error('Conversation API Error:', error);
      // Fallback to mock responses
      const responses = getTopicResponses(topic || 'daily');
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      return { response: personalizeResponse(randomResponse, userProfile) };
    }
  };

  const getTopicResponses = (topic: string): string[] => {
    const responseMap: Record<string, string[]> = {
      daily: [
        '¿Qué tal tu día? Tell me about your morning routine.',
        'Me gusta hablar de la vida diaria. ¿Qué haces normalmente por las tardes?',
        '¿Cómo es un día típico para ti?',
      ],
      work: [
        '¿En qué trabajas? I\'d love to hear about your job.',
        'El trabajo puede ser interesante. ¿Qué es lo que más te gusta de tu trabajo?',
        '¿Cómo es tu oficina o lugar de trabajo?',
      ],
      travel: [
        '¡Me encanta viajar! ¿Cuál ha sido tu viaje favorito?',
        '¿Adónde te gustaría viajar próximamente?',
        'Cuéntame sobre un lugar interesante que hayas visitado.',
      ],
      food: [
        '¡La comida es mi pasión! ¿Cuál es tu plato favorito?',
        '¿Te gusta cocinar? ¿Qué sabes preparar?',
        '¿Has probado comida española o latinoamericana?',
      ],
    };

    return responseMap[topic] || responseMap.daily;
  };

  const personalizeResponse = (response: string, profile: any): string => {
    if (!profile) return response;

    // Add casual markers if user is casual
    if (profile.tone === 'casual') {
      return response.replace('¿Qué tal', '¿Qué tal, amigo/a,');
    }

    return response;
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {!selectedTopic ? (
        <View style={styles.topicSelection}>
          <Text style={styles.topicTitle}>Choose a conversation topic:</Text>
          <View style={styles.topicsGrid}>
            {CONVERSATION_TOPICS.map((topic) => (
              <TouchableOpacity
                key={topic.id}
                style={styles.topicButton}
                onPress={() => selectTopic(topic.id)}
              >
                <Text style={styles.topicEmoji}>{topic.emoji}</Text>
                <Text style={styles.topicName}>{topic.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : (
        <>
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.map((message) => (
              <View key={message.id}>
                <View
                  style={[
                    styles.messageContainer,
                    message.isUser ? styles.userMessage : styles.aiMessage,
                  ]}
                >
                  <Text style={[
                    styles.messageText,
                    message.isUser ? styles.userMessageText : styles.aiMessageText,
                  ]}>
                    {message.text}
                  </Text>
                  <Text style={styles.timestamp}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                {message.correction && (
                  <View style={styles.correctionContainer}>
                    <Text style={styles.correctionTitle}>Grammar Tip</Text>
                    <Text style={styles.correctionOriginal}>
                      Original: {message.correction.original}
                    </Text>
                    <Text style={styles.correctionFixed}>
                      Better: {message.correction.corrected}
                    </Text>
                    <Text style={styles.correctionExplanation}>
                      {message.correction.explanation}
                    </Text>
                  </View>
                )}
              </View>
            ))}
            {isLoading && (
              <View style={[styles.messageContainer, styles.aiMessage]}>
                <Text style={styles.loadingText}>AI is typing...</Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type your message in Spanish..."
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
              onPress={sendMessage}
              disabled={!inputText.trim() || isLoading}
            >
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>

          {currentTips.length > 0 && (
            <View style={styles.tipsContainer}>
              <Text style={styles.tipsTitle}>Learning Tips</Text>
              {currentTips.map((tip, index) => (
                <Text key={index} style={styles.tipText}>• {tip}</Text>
              ))}
            </View>
          )}

          <View style={styles.bottomButtons}>
            <TouchableOpacity
              style={styles.changeTopic}
              onPress={() => setSelectedTopic(null)}
            >
              <Text style={styles.changeTopicText}>Change Topic</Text>
            </TouchableOpacity>

            {sessionStats && sessionStats.messageCount >= 3 && (
              <TouchableOpacity
                style={styles.endSessionButton}
                onPress={() => {
                  const duration = Math.round((Date.now() - sessionStats.startTime.getTime()) / 1000 / 60);
                  Alert.alert(
                    'Session Complete!',
                    `Great practice!\n\nMessages: ${sessionStats.messageCount}\nDuration: ${duration} minutes`,
                    [{ text: 'OK', onPress: () => navigation.goBack() }]
                  );
                }}
              >
                <Text style={styles.endSessionText}>End Session</Text>
              </TouchableOpacity>
            )}
          </View>
        </>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  topicSelection: {
    flex: 1,
    padding: 20,
  },
  topicTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3748',
    textAlign: 'center',
    marginBottom: 30,
  },
  topicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 15,
  },
  topicButton: {
    width: '48%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  topicEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  topicName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#667eea',
    borderRadius: 18,
    borderBottomRightRadius: 4,
    padding: 12,
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'white',
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: 'white',
  },
  aiMessageText: {
    color: '#2d3748',
  },
  timestamp: {
    fontSize: 12,
    color: '#a0aec0',
    marginTop: 4,
    textAlign: 'right',
  },
  loadingText: {
    fontSize: 16,
    color: '#718096',
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  sendButtonDisabled: {
    backgroundColor: '#a0aec0',
  },
  sendButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  changeTopic: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  changeTopicText: {
    color: '#667eea',
    fontWeight: '600',
  },
  correctionContainer: {
    marginLeft: 16,
    marginRight: 60,
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#fff3cd',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  correctionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400e',
    marginBottom: 8,
  },
  correctionOriginal: {
    fontSize: 14,
    color: '#78350f',
    marginBottom: 4,
    textDecorationLine: 'line-through',
  },
  correctionFixed: {
    fontSize: 14,
    color: '#166534',
    fontWeight: '600',
    marginBottom: 8,
  },
  correctionExplanation: {
    fontSize: 13,
    color: '#78350f',
    fontStyle: 'italic',
  },
  tipsContainer: {
    padding: 12,
    backgroundColor: '#e0f2fe',
    borderTopWidth: 1,
    borderTopColor: '#bae6fd',
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0369a1',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 13,
    color: '#0c4a6e',
    marginBottom: 4,
    lineHeight: 18,
  },
  bottomButtons: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  endSessionButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#48bb78',
  },
  endSessionText: {
    color: 'white',
    fontWeight: '600',
  },
});
