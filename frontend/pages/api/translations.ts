import type { NextApiRequest, NextApiResponse } from 'next'

interface TranslationRequest {
  phrases: string[]
  profile: any
}

interface TranslationResult {
  englishPhrase: string
  translation: {
    literal: string
    natural: string
    explanation: string
    confidence: number
    culturalNotes?: string
    formalityLevel: 'informal' | 'formal'
  }
  styleMatching: {
    tonePreserved: boolean
    formalityAdjusted: boolean
    personalityMaintained: boolean
  }
  learningTips: string[]
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  try {
    const { phrases, profile }: TranslationRequest = req.body

    // Generate mock translations
    const translations: TranslationResult[] = phrases.map(phrase => ({
      englishPhrase: phrase,
      translation: {
        literal: generateLiteralTranslation(phrase),
        natural: generateNaturalTranslation(phrase, profile),
        explanation: generateExplanation(phrase),
        confidence: 0.88 + Math.random() * 0.1,
        culturalNotes: generateCulturalNotes(phrase),
        formalityLevel: profile?.formality === 'formal' ? 'formal' : 'informal'
      },
      styleMatching: {
        tonePreserved: true,
        formalityAdjusted: true,
        personalityMaintained: true
      },
      learningTips: generateLearningTips(phrase, profile)
    }))

    res.status(200).json({
      success: true,
      data: { translations }
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Translation failed'
    })
  }
}

function generateLiteralTranslation(phrase: string): string {
  const translations: Record<string, string> = {
    'Could you take a look at this?': '¿Podrías echar un vistazo a esto?',
    'No worries, take your time': 'No te preocupes, tómate tu tiempo',
    'I think we should discuss this further': 'Creo que deberíamos discutir esto más',
    'That sounds like a great idea': 'Eso suena como una gran idea',
    'Let me know if you need help': 'Déjame saber si necesitas ayuda'
  }
  
  return translations[phrase] || `Traducción literal de: "${phrase}"`
}

function generateNaturalTranslation(phrase: string, profile: any): string {
  const casual: Record<string, string> = {
    'Could you take a look at this?': '¿Le echas un ojo a esto?',
    'No worries, take your time': 'Tranqui, sin prisa',
    'I think we should discuss this further': 'Creo que deberíamos hablar más de esto',
    'That sounds like a great idea': '¡Qué buena idea!',
    'Let me know if you need help': 'Avísame si necesitas una mano'
  }
  
  const formal: Record<string, string> = {
    'Could you take a look at this?': '¿Podría revisar esto, por favor?',
    'No worries, take your time': 'No se preocupe, tómese el tiempo necesario',
    'I think we should discuss this further': 'Considero que deberíamos profundizar en este tema',
    'That sounds like a great idea': 'Me parece una excelente propuesta',
    'Let me know if you need help': 'Por favor, háganme saber si requiere asistencia'
  }
  
  const translations = profile?.formality === 'formal' ? formal : casual
  return translations[phrase] || `Traducción natural: "${phrase}"`
}

function generateExplanation(phrase: string): string {
  return `This translation preserves your natural speaking style while maintaining proper Spanish grammar and cultural context.`
}

function generateCulturalNotes(phrase: string): string {
  return `In Spanish-speaking cultures, this phrase would be commonly used in similar contexts with appropriate levels of formality.`
}

function generateLearningTips(phrase: string, profile: any): string[] {
  return [
    `Practice the pronunciation of key words`,
    `Notice how the formality level matches your speaking style`,
    `Try using this phrase in different contexts`
  ]
}
