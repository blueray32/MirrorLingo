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

interface UsePhrasesApiReturn {
  // State
  isLoading: boolean;
  error: string | null;
  phrases: Phrase[];
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
      const request: CreatePhrasesRequest = {
        phrases: phrasesInput.filter(p => p.trim().length > 0)
      };

      const response = await fetch(`${API_BASE_URL}/phrases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add Authorization header with Cognito JWT
          // 'Authorization': `Bearer ${authToken}`,
          // For development, use test user ID
          'x-user-id': 'test-user-123'
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: CreatePhrasesResponse = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to analyze phrases');
      }

      if (result.data) {
        setPhrases(result.data.phrases);
        setProfile(result.data.profile);
      }

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
