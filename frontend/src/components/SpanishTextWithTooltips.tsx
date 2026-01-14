import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';

interface SpanishTextWithTooltipsProps {
  text: string;
}

// Client-side cache for translations (shared across all instances)
const translationCache: Record<string, string> = {};
const pendingRequests: Record<string, Promise<string>> = {};

// Common Spanish words/phrases with English translations (instant lookup)
const SPANISH_DICTIONARY: Record<string, string> = {
  // Phrases (Multi-word) - Check these first!
  'ha sido': 'has been',
  'he sido': 'I have been',
  'has sido': 'you have been',
  'he estado': 'I have been',
  'ha estado': 'has been',
  'has pasado': 'have spent/passed',
  'ha pasado': 'has spent/passed',
  'he pasado': 'I have spent/passed',
  'lo que': 'what/that which',
  'voy a': 'I am going to',
  'va a': 'is going to',
  'vas a': 'you are going to',
  'vamos a': 'we are going to',
  'me gusta': 'I like',
  'te gusta': 'you like',
  'le gusta': 'he/she likes',
  'buenos días': 'good morning',
  'buenas tardes': 'good afternoon',
  'buenas noches': 'good night',
  'de nada': 'you\'re welcome',
  'por favor': 'please',
  'lo siento': 'I\'m sorry',
  'tal vez': 'maybe',
  'a veces': 'sometimes',
  'sin embargo': 'however',
  'por supuesto': 'of course',
  'en serio': 'seriously',
  'de hecho': 'in fact',
  'con permiso': 'excuse me',

  // Greetings & Common
  'hola': 'hello', '¡hola': 'hello', 'hola!': 'hello',
  'buenos': 'good', 'buenas': 'good', 'días': 'days/morning',
  'tardes': 'afternoon', 'noches': 'night', 'adiós': 'goodbye',
  'hasta': 'until/see you', 'luego': 'later', 'pronto': 'soon',
  'mañana': 'tomorrow/morning',

  // Pronouns
  'yo': 'I', 'tú': 'you', 'él': 'he', 'ella': 'she',
  'usted': 'you (formal)', 'nosotros': 'we', 'ustedes': 'you all',
  'ellos': 'they (m)', 'ellas': 'they (f)',

  // Common Verbs
  'estoy': 'I am', 'estás': 'you are', 'está': 'is/are',
  'estamos': 'we are', 'están': 'they are',
  'soy': 'I am', 'eres': 'you are', 'es': 'is',
  'somos': 'we are', 'son': 'they are',
  'tengo': 'I have', 'tienes': 'you have', 'tiene': 'has',
  'tenemos': 'we have', 'tienen': 'they have',
  'quiero': 'I want', 'quieres': 'you want', 'quiere': 'wants',
  'puedo': 'I can', 'puedes': 'you can', 'puede': 'can',
  'voy': 'I go', 'vas': 'you go', 'va': 'goes', 'vamos': 'let\'s go',
  'hago': 'I do/make', 'hace': 'does/makes', 'hacen': 'they do',
  'digo': 'I say', 'dices': 'you say', 'dice': 'says', 'decimos': 'we say', 'dicen': 'they say',
  'sé': 'I know', 'sabes': 'you know', 'sabe': 'knows',
  'creo': 'I think', 'cree': 'believes',
  'trabajo': 'I work/job', 'trabaja': 'works',
  'hablo': 'I speak', 'habla': 'speaks', 'hablan': 'they speak',
  'necesito': 'I need', 'necesita': 'needs',
  'gusta': 'like (pleases)', 'gustan': 'like (plural)',
  'llamo': 'I call/my name is', 'llama': 'calls',

  // Question words
  '¿qué': 'what', 'qué': 'what', '¿cómo': 'how', 'cómo': 'how',
  '¿cuándo': 'when', 'cuándo': 'when', '¿dónde': 'where', 'dónde': 'where',
  '¿por': 'why/for', 'por': 'for/by', '¿cuál': 'which', 'cuál': 'which',
  '¿quién': 'who', 'quién': 'who',

  // Common words
  'bien': 'well/good', 'mal': 'bad', 'muy': 'very', 'mucho': 'much/a lot',
  'poco': 'little/few', 'más': 'more', 'menos': 'less',
  'también': 'also', 'ahora': 'now', 'hoy': 'today', 'ayer': 'yesterday',
  'siempre': 'always', 'nunca': 'never', 'aquí': 'here', 'allí': 'there',
  'sí': 'yes', 'no': 'no/not', 'y': 'and', 'o': 'or', 'pero': 'but',
  'porque': 'because', 'que': 'that/which', 'de': 'of/from', 'a': 'to/at',
  'e': 'and', 'en': 'in/on', 'con': 'with', 'para': 'for/to', 'sin': 'without',
  'un': 'a/one', 'una': 'a/one', 'el': 'the', 'la': 'the',
  'los': 'the', 'las': 'the', 'al': 'to the', 'del': 'of the',
  'mi': 'my', 'tu': 'your', 'su': 'his/her',

  // Common nouns
  'casa': 'house/home', 'familia': 'family', 'amigo': 'friend',
  'tiempo': 'time/weather', 'día': 'day', 'noche': 'night',
  'semana': 'week', 'mes': 'month', 'año': 'year',
  'persona': 'person', 'gente': 'people', 'cosa': 'thing',
  'vida': 'life', 'mundo': 'world', 'país': 'country', 'ciudad': 'city',

  // Expressions
  'gracias': 'thank you', 'perdón': 'sorry', 'claro': 'of course',
  'vale': 'okay', 'pues': 'well/so', 'entonces': 'then/so',
  'bueno': 'good/well', 'verdad': 'truth/right',
};

// Words to definitely ignore (non-word characters)
const SKIP_WORDS = new Set(['', ' ', '-', '_', '...', '…']);

export const SpanishTextWithTooltips: React.FC<SpanishTextWithTooltipsProps> = ({ text }) => {
  const [activeTokenIndex, setActiveTokenIndex] = useState<number | null>(null);
  const [dynamicTranslations, setDynamicTranslations] = useState<Record<string, string>>({});
  const [loadingWords, setLoadingWords] = useState<Set<string>>(new Set());
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // Clean word for lookup
  const cleanWord = useCallback((word: string): string => {
    return word.toLowerCase()
      .replace(/^[¡¿"'«»(]+/, '')
      .replace(/[.,!?:;""''»«)]+$/, '')
      .trim();
  }, []);

  // Tokenize while grouping known phrases
  const tokens = useMemo(() => {
    // Improved regex to split by whitespace but keep individual punctuation if necessary
    // However, our current logic relies on rawTokens being words + spaces
    const rawTokens = text.split(/(\s+)/);
    const result: { text: string; isPhrase: boolean }[] = [];

    for (let i = 0; i < rawTokens.length; i++) {
      const currentToken = rawTokens[i];

      // Skip whitespace tokens
      if (/^\s+$/.test(currentToken)) {
        result.push({ text: currentToken, isPhrase: false });
        continue;
      }

      // Check for 2-word phrases
      if (i + 2 < rawTokens.length) {
        const nextToken = rawTokens[i + 2]; // skip whitespace token at i + 1
        const potentialPhrase = `${cleanWord(currentToken)} ${cleanWord(nextToken)}`;

        if (SPANISH_DICTIONARY[potentialPhrase]) {
          result.push({
            text: `${currentToken}${rawTokens[i + 1]}${nextToken}`,
            isPhrase: true
          });
          i += 2; // skip the next word and its preceding space
          continue;
        }
      }

      result.push({ text: currentToken, isPhrase: false });
    }
    return result;
  }, [text, cleanWord]);

  // Fetch translation from API
  const fetchTranslation = useCallback(async (word: string): Promise<string> => {
    const clean = cleanWord(word);

    // Return cached if available
    if (translationCache[clean]) return translationCache[clean];

    // Check if already fetching this word
    if (pendingRequests[clean] !== undefined) return pendingRequests[clean];

    // Create new request
    pendingRequests[clean] = (async () => {
      try {
        const response = await fetch('/api/translate-word', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ word: clean })
        });

        if (!response.ok) throw new Error('Translation failed');

        const data = await response.json();
        const translation = data.success ? data.translation : 'unknown';

        // Cache the result
        translationCache[clean] = translation;

        return translation;
      } catch (error) {
        console.error('Translation error:', error);
        return 'translation unavailable';
      } finally {
        delete pendingRequests[clean];
      }
    })();

    return pendingRequests[clean];
  }, [cleanWord]);

  // Handle hover - fetch translation if not cached
  const handleHover = useCallback(async (tokenText: string, index: number) => {
    setActiveTokenIndex(index);

    const clean = cleanWord(tokenText);

    // Check if we need to fetch
    if (!SPANISH_DICTIONARY[clean] && !translationCache[clean] && !dynamicTranslations[clean] && clean.length >= 1 && !SKIP_WORDS.has(clean) && !loadingWords.has(clean)) {
      setLoadingWords(prev => new Set(prev).add(clean));

      const translation = await fetchTranslation(tokenText);

      if (mountedRef.current) {
        setDynamicTranslations(prev => ({ ...prev, [clean]: translation }));
        setLoadingWords(prev => {
          const next = new Set(prev);
          next.delete(clean);
          return next;
        });
      }
    }
  }, [cleanWord, fetchTranslation, dynamicTranslations, loadingWords]);

  return (
    <span className="spanish-text-wrapper">
      {tokens.map((token, index) => {
        // Skip whitespace
        if (/^\s+$/.test(token.text)) {
          return <span key={index}>{token.text}</span>;
        }

        const clean = cleanWord(token.text);
        const isLoading = loadingWords.has(clean);
        const isTranslatable = clean.length >= 1 && !SKIP_WORDS.has(clean);
        const translation = SPANISH_DICTIONARY[clean] || translationCache[clean] || dynamicTranslations[clean];

        if (isTranslatable) {
          return (
            <span
              key={index}
              className={`translatable-word ${translation ? 'has-translation' : ''} ${token.isPhrase ? 'is-phrase' : ''}`}
              onMouseEnter={() => handleHover(token.text, index)}
              onMouseLeave={() => setActiveTokenIndex(null)}
            >
              {token.text}
              {activeTokenIndex === index && (
                <span className="translation-tooltip">
                  {isLoading ? '...' : (translation || '...')}
                </span>
              )}
            </span>
          );
        }

        return <span key={index}>{token.text}</span>;
      })}

      <style jsx>{`
        .spanish-text-wrapper {
          display: inline;
        }
        
        .translatable-word {
          position: relative;
          cursor: help;
          border-bottom: 1px dotted rgba(99, 102, 241, 0.4);
          transition: all 0.15s ease;
        }

        .translatable-word.is-phrase {
          border-bottom-style: dashed;
          border-bottom-width: 2px;
        }
        
        .translatable-word.has-translation {
          border-bottom-color: rgba(16, 185, 129, 0.5);
        }
        
        .translatable-word:hover {
          color: var(--primary);
          border-bottom-color: var(--primary);
        }
        
        .translation-tooltip {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.95), rgba(168, 85, 247, 0.95));
          color: white;
          padding: 0.4rem 0.8rem;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          white-space: nowrap;
          z-index: 1000;
          margin-bottom: 6px;
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
          animation: tooltipFadeIn 0.15s ease-out;
          pointer-events: none;
        }
        
        .translation-tooltip::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 6px solid transparent;
          border-top-color: rgba(128, 90, 213, 0.95);
        }
        
        @keyframes tooltipFadeIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </span>
  );
};
