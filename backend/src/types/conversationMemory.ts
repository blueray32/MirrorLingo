// Enhanced Conversation Memory Types for Relationship Building

export interface ConversationMemory {
  userId: string;
  personalDetails: PersonalDetail[];
  topicEngagement: TopicEngagement[];
  relationshipLevel: RelationshipLevel;
  conversationHistory: ConversationSummary[];
  tutorPersonality: TutorPersonality;
  lastInteraction: Date;
  totalConversations: number;
}

export interface PersonalDetail {
  id: string;
  category: PersonalCategory;
  detail: string;
  confidence: number;
  firstMentioned: Date;
  lastReferenced: Date;
  importance: 'low' | 'medium' | 'high';
}

export interface TopicEngagement {
  topic: string;
  engagementScore: number;
  messageCount: number;
  averageResponseLength: number;
  lastDiscussed: Date;
  userInterest: 'low' | 'medium' | 'high';
}

export interface ConversationSummary {
  sessionId: string;
  date: Date;
  topic: string;
  messageCount: number;
  duration: number;
  highlights: string[];
  newPersonalDetails: string[];
  engagementScore: number;
}

export interface TutorPersonality {
  name: string;
  characteristics: string[];
  relationshipStyle: 'formal' | 'friendly' | 'familial';
  memoryStrength: number;
  consistencyScore: number;
}

export enum PersonalCategory {
  FAMILY = 'family',
  WORK = 'work',
  HOBBIES = 'hobbies',
  PREFERENCES = 'preferences',
  GOALS = 'goals',
  EXPERIENCES = 'experiences',
  LOCATION = 'location',
  SCHEDULE = 'schedule'
}

export enum RelationshipLevel {
  STRANGER = 'stranger',
  ACQUAINTANCE = 'acquaintance',
  FRIEND = 'friend',
  CLOSE_FRIEND = 'close_friend',
  FAMILY_LIKE = 'family_like'
}

export interface MemoryUpdate {
  personalDetails?: PersonalDetail[];
  topicEngagement?: Partial<TopicEngagement>;
  relationshipProgression?: boolean;
  conversationSummary?: ConversationSummary;
}

export interface RelationshipStatus {
  level: RelationshipLevel;
  progressToNext: number;
  daysSinceFirstMeeting: number;
  totalConversations: number;
  favoriteTopics: string[];
  recentMemories: string[];
}
