import { useState, useCallback } from 'react';
import { mirrorLingoAPI, PhraseAnalysis, LanguagePattern } from '../services/api';

export interface UsePhrasesApiReturn {
  phrases: any[];
  profile: any | null;
  isLoading: boolean;
  error: string | null;
  loadPhrases: () => Promise<boolean>;
  analyzePhrase: (phrase: string) => Promise<boolean>;
  analyzePhrases: (phrases: string[]) => Promise<boolean>;
}

export const usePhrasesApi = (): UsePhrasesApiReturn => {
  const [phrases, setPhrases] = useState<any[]>([]);
  const [profile, setProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPhrases = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const cachedPhrases = await mirrorLingoAPI.getCachedPhrases();
      if (cachedPhrases.length > 0) {
        const phrasesData = cachedPhrases.map(analysis => ({
          englishText: analysis.phrase,
          intent: 'casual',
          analysis: {
            tone: analysis.idiolectProfile.overallTone,
            formality: analysis.idiolectProfile.overallFormality,
            patterns: analysis.idiolectProfile.commonPatterns.map((p: LanguagePattern) => ({ description: p.description })),
            confidence: 0.85
          }
        }));
        setPhrases(phrasesData);
        setProfile(cachedPhrases[0]?.idiolectProfile || null);
        return true;
      }
      
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load phrases');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const analyzePhrase = useCallback(async (phrase: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const analysis = await mirrorLingoAPI.analyzePhrase(phrase);
      
      const phraseData = {
        englishText: analysis.phrase,
        intent: 'casual',
        analysis: {
          tone: analysis.idiolectProfile.overallTone,
          formality: analysis.idiolectProfile.overallFormality,
          patterns: analysis.idiolectProfile.commonPatterns.map((p: LanguagePattern) => ({ description: p.description })),
          confidence: 0.85
        }
      };
      
      setPhrases(prev => [...prev, phraseData]);
      setProfile(analysis.idiolectProfile);
      
      // Cache the analysis
      await mirrorLingoAPI.cachePhrases([analysis]);
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze phrase');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const analyzePhrases = useCallback(async (phrasesInput: string[]): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const analyses = await mirrorLingoAPI.analyzePhrases(phrasesInput);
      
      const phrasesData = analyses.map(analysis => ({
        englishText: analysis.phrase,
        intent: 'casual',
        analysis: {
          tone: analysis.idiolectProfile.overallTone,
          formality: analysis.idiolectProfile.overallFormality,
          patterns: analysis.idiolectProfile.commonPatterns.map((p: LanguagePattern) => ({ description: p.description })),
          confidence: 0.85
        }
      }));
      
      setPhrases(phrasesData);
      setProfile(analyses[0]?.idiolectProfile || null);
      
      // Cache the analyses
      await mirrorLingoAPI.cachePhrases(analyses);
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze phrases');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    phrases,
    profile,
    isLoading,
    error,
    loadPhrases,
    analyzePhrase,
    analyzePhrases,
  };
};
