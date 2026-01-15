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
  Modal,
  Dimensions,
  TouchableWithoutFeedback,
  StatusBar,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { parseSpanishText } from '../components/TappableWord';
import { Theme } from '../styles/designSystem';
import { mirrorLingoAPI } from '../services/api';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:3002';

type ConversationScreenRouteProp = RouteProp<RootStackParamList, 'Conversation'>;
type ConversationScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Conversation'>;

interface Props {
  route: any;
  navigation: any;
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
  { id: 'free_conversation', name: 'Free Speaking', emoji: '🗣️' },
];

export const ConversationScreen: React.FC<Props> = ({ route, navigation }) => {
  const [profile, setProfile] = useState<any>(route?.params?.profile || null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionStats, setSessionStats] = useState<SessionStats | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [currentTips, setCurrentTips] = useState<string[]>([]);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [translation, setTranslation] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
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

      // Load profile if missing
      if (!profile) {
        const cached = await mirrorLingoAPI.getCachedPhrases();
        if (cached && cached.length > 0) {
          setProfile(cached[0].idiolectProfile);
        }
      }
    };
    initUserId();
  }, []);

  useEffect(() => {
    // Add welcome message in Spanish
    setMessages([{
      id: '1',
      text: '¡Hola! Soy tu compañero de conversación en español. ¡Elige un tema para empezar a practicar!',
      isUser: false,
      timestamp: new Date(),
    }]);
  }, []);

  const selectTopic = (topicId: string) => {
    setSelectedTopic(topicId);
    const topic = CONVERSATION_TOPICS.find(t => t.id === topicId);

    // Topic welcome messages in Spanish
    const topicWelcomes: Record<string, string> = {
      daily: '¡Perfecto! Vamos a hablar de la vida diaria. Me adaptaré a tu estilo. ¡Empieza con cualquier pregunta o comentario!',
      work: '¡Excelente! Hablemos del trabajo. ¿En qué trabajas tú?',
      travel: '¡Me encanta viajar! Cuéntame sobre tus viajes favoritos.',
      food: '¡La comida es mi pasión! ¿Cuál es tu plato favorito?',
      family: '¡La familia es muy importante! Cuéntame sobre tu familia.',
      hobbies: '¡Los pasatiempos son divertidos! ¿Qué te gusta hacer en tu tiempo libre?',
      shopping: '¡Vamos de compras! ¿Te gusta ir de compras?',
      health: '¡La salud es importante! ¿Cómo cuidas tu salud?',
      weather: '¡El clima! ¿Qué tiempo hace hoy donde estás?',
      free_conversation: '¡Me encanta hablar de todo! ¿De qué te gustaría conversar hoy? Tú diriges el camino.',
    };

    const welcomeMessage: Message = {
      id: Date.now().toString(),
      text: topicWelcomes[topicId] || `¡Muy bien! Vamos a hablar de ${topic?.name.toLowerCase()}. ¡Empieza cuando quieras!`,
      isUser: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, welcomeMessage]);
  };

  const handleWordPress = async (word: string) => {
    const cleanWord = word.toLowerCase().replace(/[¿?¡!.,;:'"()]/g, '');
    setSelectedWord(cleanWord);
    setTranslation(null);
    setIsTranslating(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/dictionary/lookup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: cleanWord }),
      });
      const data = await response.json();
      if (data.success && data.data.translation) {
        setTranslation(data.data.translation);
      }
    } catch (error) {
      console.error('Translation lookup failed:', error);
    } finally {
      setIsTranslating(false);
    }
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
        '¿Qué tal tu día? Cuéntame sobre tu rutina de la mañana.',
        'Me gusta hablar de la vida diaria. ¿Qué haces normalmente por las tardes?',
        '¿Cómo es un día típico para ti? ¿A qué hora te levantas?',
        '¿Qué es lo primero que haces cuando te despiertas?',
      ],
      work: [
        '¿En qué trabajas? Me gustaría saber más sobre tu profesión.',
        'El trabajo puede ser muy interesante. ¿Qué es lo que más te gusta de tu trabajo?',
        '¿Cómo es tu oficina o lugar de trabajo? ¿Trabajas desde casa?',
        '¿Cuántas horas trabajas normalmente cada día?',
      ],
      travel: [
        '¡Me encanta viajar! ¿Cuál ha sido tu viaje favorito hasta ahora?',
        '¿Adónde te gustaría viajar próximamente? ¿Por qué?',
        'Cuéntame sobre un lugar interesante que hayas visitado.',
        '¿Prefieres viajar solo o con amigos y familia?',
      ],
      food: [
        '¡La comida es mi pasión! ¿Cuál es tu plato favorito?',
        '¿Te gusta cocinar? ¿Qué sabes preparar?',
        '¿Has probado comida española o latinoamericana? ¿Qué te pareció?',
        '¿Cuál es tu restaurante favorito? ¿Qué tipo de comida sirven?',
      ],
      family: [
        '¿Tienes una familia grande o pequeña?',
        'Cuéntame sobre tus hermanos o hermanas.',
        '¿Vives cerca de tu familia?',
      ],
      hobbies: [
        '¿Qué te gusta hacer en tu tiempo libre?',
        '¿Practicas algún deporte?',
        '¿Te gusta leer? ¿Qué tipo de libros prefieres?',
      ],
      shopping: [
        '¿Te gusta ir de compras? ¿Dónde prefieres comprar?',
        '¿Compras más en línea o en tiendas físicas?',
        '¿Cuál fue tu última compra importante?',
      ],
      health: [
        '¿Cómo cuidas tu salud?',
        '¿Haces ejercicio regularmente?',
        '¿Qué haces para relajarte?',
      ],
      weather: [
        '¿Qué tiempo hace hoy donde estás?',
        '¿Cuál es tu estación favorita del año?',
        '¿Prefieres el frío o el calor?',
      ],
      free_conversation: [
        '¡Qué interesante! Cuéntame más sobre eso.',
        'Me encanta aprender cosas nuevas. ¿Puedes explicarme más?',
        '¿Y tú qué piensas sobre eso?',
        'Es un tema fascinante. ¿Cómo empezaste a interesarte en esto?',
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
      <StatusBar barStyle="light-content" backgroundColor={Theme.colors.background} />
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
                  {!message.isUser && (
                    <View style={styles.aiAvatarChip}>
                      <Text style={styles.aiAvatarText}>🤖 AI</Text>
                    </View>
                  )}
                  {message.isUser ? (
                    <Text style={[styles.messageText, styles.userMessageText]}>
                      {message.text}
                    </Text>
                  ) : (
                    <View style={styles.aiMessageContent}>
                      {parseSpanishText(message.text, handleWordPress)}
                      <Text style={styles.tapHint}>Tap underlined words for translation</Text>
                    </View>
                  )}
                  <Text style={[styles.timestamp, message.isUser && styles.userTimestamp]}>
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
      <Modal
        visible={!!selectedWord}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedWord(null)}
      >
        <TouchableWithoutFeedback onPress={() => setSelectedWord(null)}>
          <View style={styles.modalOverlay}>
            <View style={styles.tooltip}>
              <View style={styles.tooltipArrow} />
              <Text style={styles.tooltipWord}>{selectedWord}</Text>
              {isTranslating ? (
                <Text style={styles.tooltipLoading}>Translating...</Text>
              ) : translation ? (
                <Text style={styles.tooltipTranslation}>{translation}</Text>
              ) : (
                <Text style={styles.tooltipUnknown}>Translation not found</Text>
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  topicSelection: {
    flex: 1,
    padding: 20,
    backgroundColor: Theme.colors.background,
    justifyContent: 'center',
  },
  topicTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Theme.colors.textPrimary,
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
    width: '30%',
    backgroundColor: Theme.colors.card,
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  topicEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  topicName: {
    fontSize: 12,
    fontWeight: Theme.typography.weights.medium,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '85%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: Theme.colors.bubbleUser,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 4,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    padding: 12,
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: Theme.colors.bubbleTutor,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    padding: 12,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
  },
  userMessageText: {
    color: Theme.colors.textPrimary,
  },
  aiMessageText: {
    color: Theme.colors.textPrimary,
  },
  timestamp: {
    fontSize: 10,
    color: Theme.colors.textMuted,
    marginTop: 4,
  },
  userTimestamp: {
    textAlign: 'right',
  },
  loadingText: {
    fontSize: 16,
    color: Theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: Theme.colors.card,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    maxHeight: 100,
    fontSize: 16,
    color: Theme.colors.textPrimary,
  },
  sendButton: {
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  sendButtonDisabled: {
    backgroundColor: Theme.colors.textMuted,
  },
  sendButtonText: {
    color: Theme.colors.textPrimary,
    fontWeight: '600',
  },
  changeTopic: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    backgroundColor: Theme.colors.card,
  },
  changeTopicText: {
    color: Theme.colors.primary,
    fontWeight: '600',
  },
  correctionContainer: {
    marginLeft: 16,
    marginRight: 60,
    marginBottom: 16,
    padding: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Theme.colors.warning,
  },
  correctionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.warning,
    marginBottom: 8,
  },
  correctionOriginal: {
    fontSize: 14,
    color: Theme.colors.textSecondary,
    marginBottom: 4,
    textDecorationLine: 'line-through',
  },
  correctionFixed: {
    fontSize: 14,
    color: Theme.colors.accent,
    fontWeight: Theme.typography.weights.bold,
    marginBottom: 8,
  },
  correctionExplanation: {
    fontSize: 13,
    color: Theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  tipsContainer: {
    padding: 12,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.primary,
    marginBottom: 8,
  },
  tipText: {
    fontSize: 13,
    color: Theme.colors.textSecondary,
    marginBottom: 4,
    lineHeight: 18,
  },
  bottomButtons: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.card,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
  },
  endSessionButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    backgroundColor: Theme.colors.accent,
  },
  endSessionText: {
    color: 'white',
    fontWeight: '600',
  },
  aiMessageContent: {
    padding: 2,
  },
  tapHint: {
    fontSize: 11,
    color: 'rgba(248, 250, 252, 0.5)',
    fontStyle: 'italic',
    marginTop: 6,
    width: '100%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tooltip: {
    backgroundColor: Theme.colors.background,
    borderRadius: 16,
    padding: 20,
    minWidth: 200,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  tooltipArrow: {
    display: 'none', // Arrow doesn't make sense for a centered modal
  },
  tooltipWord: {
    fontSize: 22,
    fontWeight: '700',
    color: Theme.colors.primary,
    marginBottom: 8,
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  tooltipTranslation: {
    fontSize: 18,
    color: Theme.colors.textPrimary,
    textAlign: 'center',
  },
  tooltipLoading: {
    fontSize: 14,
    color: Theme.colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  tooltipUnknown: {
    fontSize: 14,
    color: Theme.colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  aiAvatarChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
  aiAvatarText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 0.5,
  },
});
