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

      // Try to load from server first
      const serverPhrases = await mirrorLingoAPI.getUserPhrases();

      let finalPhrases = serverPhrases;
      if (serverPhrases.length === 0) {
        // Fallback to cache if server is empty or offline
        finalPhrases = await mirrorLingoAPI.getCachedPhrases();
      }

      if (finalPhrases.length > 0) {
        const phrasesData = finalPhrases.map(analysis => {
          // Handle all possible property names due to model inconsistencies
          const rawEnglish = analysis.phrase || (analysis as any).englishText || (analysis as any).content || (analysis as any).text || "";
          const englishText = rawEnglish.trim() || "Phrase Unavailable";

          // Similarly for Spanish
          const rawSpanish =
            analysis.translations?.natural ||
            (analysis as any).spanishText ||
            (analysis as any).translation ||
            analysis.translations?.literal ||
            "";
          const spanishText = rawSpanish.trim() || "Translation pending...";

          return {
            englishText,
            spanishText,
            intent: (analysis as any).intent || 'casual',
            analysis: {
              tone: analysis.idiolectProfile?.overallTone || 'neutral',
              formality: analysis.idiolectProfile?.overallFormality || 'casual',
              patterns: (analysis.idiolectProfile?.commonPatterns || []).map((p: LanguagePattern) => ({ description: p.description })),
              confidence: 0.85
            }
          };
        });

        setPhrases(phrasesData);
        setProfile(finalPhrases[0]?.idiolectProfile || null);

        // Check for missing translations and auto-repair
        const missingTranslations = phrasesData
          .filter(p => p.spanishText === "Translation pending...")
          .map(p => p.englishText);

        if (missingTranslations.length > 0) {
          console.log(`[usePhrasesApi] Auto-repairing ${missingTranslations.length} missing translations...`);
          // Await to prevent rapid state churn and coordinated loading
          await analyzePhrases(missingTranslations);
        }

        // Sync cache with latest server data
        if (serverPhrases.length > 0) {
          await mirrorLingoAPI.cachePhrases(serverPhrases);
        }
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

      const rawEnglish = analysis.phrase || (analysis as any).englishText || phrase || "";
      const englishText = rawEnglish.trim() || "Phrase Unavailable";

      const rawSpanish =
        analysis.translations?.natural ||
        (analysis as any).spanishText ||
        (analysis as any).translation ||
        "";
      const spanishText = rawSpanish.trim() || "Translation pending...";

      const phraseData = {
        englishText,
        spanishText,
        intent: (analysis as any).intent || 'casual',
        analysis: {
          tone: analysis.idiolectProfile?.overallTone || 'neutral',
          formality: analysis.idiolectProfile?.overallFormality || 'casual',
          patterns: (analysis.idiolectProfile?.commonPatterns || []).map((p: LanguagePattern) => ({ description: p.description })),
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

      const phrasesData = analyses.map(analysis => {
        const rawEnglish = analysis.phrase || (analysis as any).englishText || "";
        const englishText = rawEnglish.trim() || "Phrase Unavailable";

        const rawSpanish =
          analysis.translations?.natural ||
          (analysis as any).spanishText ||
          (analysis as any).translation ||
          "";
        const spanishText = rawSpanish.trim() || "Translation pending...";

        return {
          englishText,
          spanishText,
          intent: (analysis as any).intent || 'casual',
          analysis: {
            tone: analysis.idiolectProfile?.overallTone || 'neutral',
            formality: analysis.idiolectProfile?.overallFormality || 'casual',
            patterns: (analysis.idiolectProfile?.commonPatterns || []).map((p: LanguagePattern) => ({ description: p.description })),
            confidence: 0.85
          }
        };
      });

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
