/**
 * Custom hook for managing phrase analysis and user profile data.
 * Provides methods for submitting phrases for analysis and retrieving user data.
 * 
 * @example
 * ```tsx
 * const { phrases, profile, submitPhrases, isLoading } = usePhrasesApi();
 * 
 * const handleSubmit = async (userPhrases: string[]) => {
 *   const success = await submitPhrases(userPhrases);
 *   if (success) {
 *     console.log('Analysis complete:', profile);
 *   }
 * };
 * ```
 */
import { useState, useCallback } from 'react';
import { 
  CreatePhrasesRequest, 
  CreatePhrasesResponse, 
  GetPhrasesResponse,
  Phrase,
  IdiolectProfile 
} from '../types/phrases';

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Return type for usePhrasesApi hook
 */
interface UsePhrasesApiReturn {
  // State
  /** Loading state for API operations */
  isLoading: boolean;
  /** Error message if any operation fails */
  error: string | null;
  /** Array of user's analyzed phrases */
  phrases: Phrase[];
  /** User's idiolect profile from analysis */
  profile: IdiolectProfile | null;
  
  // Actions
  submitPhrases: (phrases: string[]) => Promise<boolean>;
  loadPhrases: () => Promise<boolean>;
  clearError: () => void;
}

export const usePhrasesApi = (): UsePhrasesApiReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [profile, setProfile] = useState<IdiolectProfile | null>(null);

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Submit phrases for analysis
  const submitPhrases = useCallback(async (phrasesInput: string[]): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Enhanced mock API with sophisticated analysis
      await new Promise(resolve => setTimeout(resolve, 2000)); // Realistic loading time

      const cleanPhrases = phrasesInput.filter(p => p.trim().length > 0);
      
      // Sophisticated mock analysis based on actual phrases
      const mockPhrases: Phrase[] = cleanPhrases.map((text, index) => ({
        id: `phrase-${Date.now()}-${index}`,
        text,
        intent: detectIntent(text),
        confidence: 0.85 + Math.random() * 0.1,
        createdAt: new Date().toISOString()
      }));

      const mockProfile: IdiolectProfile = generateSophisticatedProfile(cleanPhrases);

      setPhrases(mockPhrases);
      setProfile(mockProfile);

      return true;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error submitting phrases:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load existing phrases
  const loadPhrases = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/phrases`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add Authorization header with Cognito JWT
          // 'Authorization': `Bearer ${authToken}`,
          // For development, use test user ID
          'x-user-id': 'test-user-123'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: GetPhrasesResponse = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to load phrases');
      }

      if (result.data) {
        setPhrases(result.data.phrases || []);
        setProfile(result.data.profile || null);
      }

      return true;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error loading phrases:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    phrases,
    profile,
    submitPhrases,
    loadPhrases,
    clearError
  };
};

// Utility hook for form validation
export const usePhraseValidation = () => {
  const validatePhrases = useCallback((phrases: string[]): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    const validPhrases = phrases.filter(p => p.trim().length > 0);
    
    if (validPhrases.length < 1) {
      errors.push('Please enter at least 1 phrase');
    }
    
    if (validPhrases.length > 10) {
      errors.push('Please enter no more than 10 phrases');
    }
    
    validPhrases.forEach((phrase, index) => {
      if (phrase.length > 500) {
        errors.push(`Phrase ${index + 1} is too long (max 500 characters)`);
      }
    });
    
    return { valid: errors.length === 0, errors };
  }, []);

  return { validatePhrases };
};

// Enhanced mock analysis functions
const detectIntent = (phrase: string): string => {
  const text = phrase.toLowerCase();
  
  if (text.includes('work') || text.includes('meeting') || text.includes('project') || text.includes('deadline') || text.includes('client')) {
    return 'work';
  }
  if (text.includes('family') || text.includes('kids') || text.includes('home') || text.includes('dinner')) {
    return 'family';
  }
  if (text.includes('store') || text.includes('buy') || text.includes('shopping') || text.includes('appointment')) {
    return 'errands';
  }
  if (text.includes('friend') || text.includes('party') || text.includes('weekend') || text.includes('fun')) {
    return 'social';
  }
  if (text.includes('please') || text.includes('could you') || text.includes('would you')) {
    return 'polite_request';
  }
  
  return 'casual';
};

const generateSophisticatedProfile = (phrases: string[]): IdiolectProfile => {
  const allText = phrases.join(' ').toLowerCase();
  
  // Analyze contractions
  const contractionCount = (allText.match(/\b(don't|won't|can't|i'm|you're|it's|that's|we're|they're)\b/g) || []).length;
  const contractionRate = contractionCount / phrases.length;
  
  // Analyze filler words
  const fillerCount = (allText.match(/\b(um|uh|like|you know|actually|basically|literally)\b/g) || []).length;
  
  // Analyze politeness markers
  const politenessCount = (allText.match(/\b(please|thank you|sorry|excuse me|could you|would you)\b/g) || []).length;
  
  // Determine tone and formality
  const tone = politenessCount > phrases.length * 0.3 ? 'polite' : 
               contractionRate > 0.5 ? 'casual' : 'neutral';
  
  const formality = contractionRate < 0.2 && politenessCount > 0 ? 'formal' :
                   contractionRate > 0.7 ? 'informal' : 'neutral';

  return {
    userId: 'test-user-123',
    tone,
    formality,
    patterns: [
      ...(contractionRate > 0.3 ? ['Uses contractions frequently'] : []),
      ...(fillerCount > 0 ? ['Uses filler words'] : []),
      ...(politenessCount > 0 ? ['Polite communication style'] : []),
      ...(phrases.some(p => p.includes('?')) ? ['Asks questions often'] : []),
      ...(phrases.some(p => p.length > 50) ? ['Tends to use longer sentences'] : ['Prefers concise communication'])
    ],
    confidence: 0.87 + Math.random() * 0.1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};
