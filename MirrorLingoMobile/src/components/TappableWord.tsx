import React, { useState, useRef } from 'react';
import {
    Text,
    StyleSheet,
} from 'react-native';

// Common Spanish-English word translations dictionary
const WORD_DICTIONARY: Record<string, string> = {
    // Common words
    'hola': 'hello',
    'qué': 'what',
    'tal': 'such/how',
    'cómo': 'how',
    'estás': 'are you',
    'bien': 'good/well',
    'gracias': 'thank you',
    'por': 'for/by',
    'favor': 'favor',
    'sí': 'yes',
    'no': 'no',
    'y': 'and',
    'o': 'or',
    'pero': 'but',
    'porque': 'because',
    'cuando': 'when',
    'donde': 'where',
    'quien': 'who',
    'cual': 'which',

    // Verbs
    'me': 'me/myself',
    'gusta': 'like (it pleases)',
    'gustar': 'to like',
    'hablar': 'to speak',
    'hacer': 'to do/make',
    'haces': 'you do/make',
    'ir': 'to go',
    'voy': 'I go',
    'vas': 'you go',
    'ser': 'to be',
    'soy': 'I am',
    'eres': 'you are',
    'es': 'is/he/she is',
    'estar': 'to be (state)',
    'estoy': 'I am',
    'tener': 'to have',
    'tengo': 'I have',
    'tienes': 'you have',
    'querer': 'to want',
    'quiero': 'I want',
    'poder': 'to be able',
    'puedo': 'I can',
    'saber': 'to know',
    'conocer': 'to know (person/place)',
    'decir': 'to say',
    'digo': 'I say',
    'venir': 'to come',
    'vengo': 'I come',
    'ver': 'to see',
    'veo': 'I see',
    'dar': 'to give',
    'doy': 'I give',
    'pensar': 'to think',
    'creer': 'to believe',
    'trabajar': 'to work',
    'vivir': 'to live',
    'comer': 'to eat',
    'beber': 'to drink',
    'leer': 'to read',
    'escribir': 'to write',
    'aprender': 'to learn',
    'entender': 'to understand',

    // Time words
    'día': 'day',
    'noche': 'night',
    'mañana': 'morning/tomorrow',
    'tarde': 'afternoon/late',
    'tardes': 'afternoons',
    'hoy': 'today',
    'ayer': 'yesterday',
    'ahora': 'now',
    'siempre': 'always',
    'nunca': 'never',
    'normalmente': 'normally',
    'típico': 'typical',

    // Nouns
    'vida': 'life',
    'diaria': 'daily',
    'trabajo': 'work',
    'casa': 'house/home',
    'familia': 'family',
    'amigo': 'friend (m)',
    'amiga': 'friend (f)',
    'comida': 'food',
    'agua': 'water',
    'tiempo': 'time/weather',
    'lugar': 'place',
    'viaje': 'trip',
    'oficina': 'office',
    'plato': 'dish/plate',
    'favorito': 'favorite',

    // Articles & Pronouns
    'el': 'the (m)',
    'la': 'the (f)',
    'los': 'the (m pl)',
    'las': 'the (f pl)',
    'un': 'a/an (m)',
    'una': 'a/an (f)',
    'yo': 'I',
    'tú': 'you',
    'él': 'he',
    'ella': 'she',
    'nosotros': 'we',
    'ellos': 'they (m)',
    'ellas': 'they (f)',
    'mi': 'my',
    'tu': 'your',
    'su': 'his/her/their',
    'nuestro': 'our',

    // Question words
    'cuál': 'which',
    'cuándo': 'when',
    'dónde': 'where',
    'adónde': 'to where',
    'quién': 'who',
    'cuánto': 'how much',
    'cuántos': 'how many',

    // Common phrases words
    'encanta': 'love (it enchants)',
    'interesante': 'interesting',
    'próximamente': 'soon/next',
    'visitado': 'visited',
    'pasión': 'passion',
    'preparar': 'to prepare',
    'probado': 'tried',
    'española': 'Spanish (f)',
    'latinoamericana': 'Latin American (f)',
    'cuéntame': 'tell me',
    'sobre': 'about/on',
    'ha': 'has',
    'sido': 'been',
    'hayas': 'you have (subj)',
    'gustaría': 'would like',
    'viajar': 'to travel',

    // New conversation words
    'compañero': 'partner/companion',
    'conversación': 'conversation',
    'español': 'Spanish',
    'elige': 'choose',
    'tema': 'topic/theme',
    'empezar': 'to start',
    'practicar': 'to practice',
    'perfecto': 'perfect',
    'vamos': 'let\'s go/we go',
    'adaptaré': 'I will adapt',
    'estilo': 'style',
    'empieza': 'start (you)',
    'cualquier': 'any',
    'pregunta': 'question',
    'comentario': 'comment',
    'excelente': 'excellent',
    'hablemos': 'let\'s talk',
    'del': 'of the',
    'viajes': 'trips',
    'favoritos': 'favorites',
    'importante': 'important',
    'libre': 'free',
    'compras': 'shopping/purchases',
    'salud': 'health',
    'cuidas': 'you take care',
    'clima': 'climate/weather',
    'hace': 'makes/does',
    'rutina': 'routine',
    'levanta': 'you get up',
    'levantas': 'you get up',
    'despiertas': 'you wake up',
    'primero': 'first',
    'profesión': 'profession',
    'más': 'more/most',
    'desde': 'from/since',
    'horas': 'hours',
    'hasta': 'until/up to',
    'solo': 'alone/only',
    'amigos': 'friends',
    'pareció': 'seemed/thought',
    'restaurante': 'restaurant',
    'tipo': 'type',
    'sirven': 'they serve',
    'grande': 'big/large',
    'pequeña': 'small',
    'hermanos': 'siblings/brothers',
    'hermanas': 'sisters',
    'vives': 'you live',
    'cerca': 'near/close',
    'deporte': 'sport',
    'libros': 'books',
    'prefieres': 'you prefer',
    'línea': 'line/online',
    'tiendas': 'stores',
    'físicas': 'physical',
    'última': 'last',
    'compra': 'purchase',
    'ejercicio': 'exercise',
    'regularmente': 'regularly',
    'relajarte': 'to relax',
    'estación': 'season/station',
    'año': 'year',
    'frío': 'cold',
    'calor': 'heat/hot',
    'divertidos': 'fun (plural)',
    'pasatiempos': 'hobbies',
};

interface TappableWordProps {
    word: string;
    onPress: (word: string) => void;
    translation?: string | null;
}

export const TappableWord: React.FC<TappableWordProps> = ({ word, onPress, translation }) => {

    // Clean word for dictionary lookup
    const cleanWord = word.toLowerCase().replace(/[¿?¡!.,;:'"()]/g, '');
    const localTranslation = WORD_DICTIONARY[cleanWord];
    const finalTranslation = translation || localTranslation;

    // Extract punctuation
    const leadingPunct = word.match(/^[¿¡'"(]*/)?.[0] || '';
    const trailingPunct = word.match(/[?!.,;:'")\s]*$/)?.[0] || '';
    const coreWord = word.slice(leadingPunct.length, word.length - trailingPunct.length);

    // Skip pure punctuation or empty words
    if (!coreWord || coreWord.match(/^[\s.,;:!?¿¡'"()]+$/)) {
        return <Text style={styles.normalText}>{word}</Text>;
    }

    const handlePress = () => {
        onPress(word);
    };

    // ALL words are now tappable
    // We render punctuation inside the main color span if possible for better flow
    return (
        <Text
            onPress={handlePress}
            style={styles.tappableWord}
        >
            <Text style={finalTranslation ? styles.underlinedKnown : styles.underlinedUnknown}>
                {leadingPunct}{coreWord}{trailingPunct}
            </Text>
        </Text>
    );
};

// Helper function to parse text and wrap Spanish words
export const parseSpanishText = (text: string, onPress: (word: string) => void): React.ReactNode => {
    if (!text) return null;
    const wordsAndSpaces = text.split(/(\s+)/);

    return (
        <Text style={styles.messageFlowText}>
            {wordsAndSpaces.map((part, index) => {
                if (!part) return null;
                if (part.match(/^\s+$/)) {
                    return <Text key={`s-${index}`} style={styles.normalText}>{part}</Text>;
                }
                return <TappableWord key={`w-${index}`} word={part} onPress={onPress} />;
            })}
        </Text>
    );
};

import { Theme } from '../styles/designSystem';

const styles = StyleSheet.create({
    normalText: {
        fontSize: 16,
        lineHeight: 24,
        color: Theme.colors.textPrimary,
    },
    messageFlowText: {
        fontSize: 16,
        lineHeight: 24,
    },
    tappableWord: {
        fontSize: 16,
        lineHeight: 24,
    },
    underlinedKnown: {
        textDecorationLine: 'underline',
        textDecorationStyle: 'solid',
        textDecorationColor: Theme.colors.primary,
        color: Theme.colors.textPrimary,
    },
    underlinedUnknown: {
        textDecorationLine: 'underline',
        textDecorationStyle: 'dotted',
        textDecorationColor: Theme.colors.textSecondary,
        color: Theme.colors.textPrimary,
    },
});
