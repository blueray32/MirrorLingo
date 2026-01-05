# Feature: Multi-language Support for French and German

## Feature Description

Extend MirrorLingo's idiolect-driven personalization beyond Spanish to support French and German language learning. This involves adapting the AI analysis system to understand language-specific patterns, creating new translation engines, and implementing language-specific pronunciation feedback while maintaining the core personalization that makes MirrorLingo unique.

## User Story

As a language learner interested in multiple languages
I want to use MirrorLingo's personalized approach for French and German
So that I can learn multiple languages while preserving my unique communication style in each

## Problem Statement

MirrorLingo's innovative idiolect-driven approach is currently limited to Spanish, but many users want to learn multiple languages. Each language has unique grammar patterns, cultural contexts, and pronunciation challenges that require specialized handling while maintaining the personalization that sets MirrorLingo apart.

## Solution Statement

Create a language-agnostic architecture that can adapt MirrorLingo's core personalization engine to French and German. This includes language-specific AI prompts, cultural adaptation systems, pronunciation models, and UI localization while preserving the user's communication personality across languages.

## Feature Metadata

**Feature Type**: Major Enhancement
**Estimated Complexity**: High
**Primary Systems Affected**: AI Analysis, Translation Engine, Pronunciation System, UI/UX
**Dependencies**: Language-specific AI models, Cultural context databases, Pronunciation APIs

---

## CONTEXT REFERENCES

### Relevant Codebase Files IMPORTANT: YOU MUST READ THESE FILES BEFORE IMPLEMENTING!

- `backend/src/services/spanishTranslationService.ts` - Translation engine patterns to replicate
- `backend/src/services/idiolectAnalyzer.ts` - Core analysis logic to make language-agnostic
- `frontend/src/components/SpanishTranslations.tsx` - UI patterns for translation display
- `backend/src/services/bedrockService.ts` - AI service integration for language analysis
- `frontend/src/components/PronunciationFeedback.tsx` - Pronunciation system to extend
- `frontend/src/types/phrases.ts` - Type definitions to make language-flexible

### New Files to Create

- `backend/src/services/languageService.ts` - Language detection and management
- `backend/src/services/frenchTranslationService.ts` - French-specific translation logic
- `backend/src/services/germanTranslationService.ts` - German-specific translation logic
- `frontend/src/components/LanguageSelector.tsx` - Language selection interface
- `frontend/src/components/MultiLanguageTranslations.tsx` - Multi-language translation display
- `backend/src/data/languagePatterns.ts` - Language-specific pattern definitions
- `frontend/src/hooks/useLanguageApi.ts` - Language management API hook

### Relevant Documentation YOU SHOULD READ THESE BEFORE IMPLEMENTING!

- [Amazon Bedrock Multi-language Support](https://docs.aws.amazon.com/bedrock/latest/userguide/model-parameters.html)
  - Specific section: Language-specific prompting strategies
  - Why: Required for adapting AI analysis to different languages
- [Web Speech API Language Support](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition/lang)
  - Specific section: Language codes and pronunciation
  - Why: Needed for multi-language voice processing
- [Internationalization Best Practices](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Internationalization)
  - Specific section: Cultural adaptation patterns
  - Why: Essential for proper cultural context in translations

### Patterns to Follow

**Language Service Pattern:**
```typescript
// Create abstract base for language services
abstract class BaseLanguageService {
  abstract translatePhrase(phrase: string, profile: IdiolectProfile): Promise<TranslationResult>
  abstract getCulturalContext(phrase: string): string
}
```

**Language Detection Pattern:**
```typescript
// Follow existing service patterns
export class LanguageService {
  static detectLanguage(text: string): Promise<LanguageCode>
  static getSupportedLanguages(): LanguageInfo[]
}
```

**UI Localization Pattern:**
```typescript
// Extend existing component patterns
interface MultiLanguageProps {
  targetLanguage: LanguageCode
  sourceLanguage: LanguageCode
  phrases: Phrase[]
}
```

---

## IMPLEMENTATION PLAN

### Phase 1: Architecture Foundation

Create language-agnostic architecture and core language management

**Tasks:**
- Design abstract language service architecture
- Create language detection and management system
- Refactor existing Spanish service to use new architecture
- Set up language-specific configuration system

### Phase 2: French Implementation

Implement complete French language support

**Tasks:**
- Create French translation service with cultural adaptation
- Implement French pronunciation feedback system
- Add French-specific idiolect analysis patterns
- Create French UI components and localization

### Phase 3: German Implementation

Implement complete German language support

**Tasks:**
- Create German translation service with cultural adaptation
- Implement German pronunciation feedback system
- Add German-specific idiolect analysis patterns
- Create German UI components and localization

### Phase 4: Integration & Testing

Integrate multi-language system with existing features

**Tasks:**
- Update main UI to support language selection
- Integrate with existing spaced repetition system
- Add multi-language analytics and progress tracking
- Comprehensive testing across all three languages

---

## STEP-BY-STEP TASKS

### REFACTOR backend/src/services/spanishTranslationService.ts

- **IMPLEMENT**: Extract base translation service class
- **PATTERN**: Create abstract BaseTranslationService with common methods
- **IMPORTS**: Move shared types to common language types file
- **GOTCHA**: Maintain backward compatibility with existing Spanish functionality
- **VALIDATE**: `npm test -- spanish-translation` (ensure no regressions)

### CREATE backend/src/services/languageService.ts

- **IMPLEMENT**: Language detection, management, and configuration
- **PATTERN**: Follow bedrockService.ts structure for AI integration
- **IMPORTS**: Language detection libraries, supported language configs
- **GOTCHA**: Handle language detection accuracy and fallback strategies
- **VALIDATE**: `curl -X POST /language/detect -d '{"text":"Bonjour monde"}'`

### CREATE backend/src/services/frenchTranslationService.ts

- **IMPLEMENT**: French-specific translation logic extending base service
- **PATTERN**: Mirror spanishTranslationService.ts structure
- **IMPORTS**: BaseTranslationService, French cultural context data
- **GOTCHA**: Handle French grammar complexities (gender, formal/informal)
- **VALIDATE**: Test French translation with sample phrases

### CREATE backend/src/services/germanTranslationService.ts

- **IMPLEMENT**: German-specific translation logic extending base service
- **PATTERN**: Mirror spanishTranslationService.ts structure
- **IMPORTS**: BaseTranslationService, German cultural context data
- **GOTCHA**: Handle German grammar complexities (cases, compound words)
- **VALIDATE**: Test German translation with sample phrases

### CREATE frontend/src/components/LanguageSelector.tsx

- **IMPLEMENT**: Language selection interface with flags and names
- **PATTERN**: Follow existing component patterns from SpanishTranslations.tsx
- **IMPORTS**: Language service types, UI components, flag assets
- **GOTCHA**: Handle language switching without losing user progress
- **VALIDATE**: Render component and test language switching

### UPDATE frontend/src/components/SpanishTranslations.tsx

- **IMPLEMENT**: Rename to MultiLanguageTranslations.tsx and make language-agnostic
- **PATTERN**: Maintain existing UI patterns while adding language flexibility
- **IMPORTS**: Multi-language types, language selector component
- **GOTCHA**: Preserve existing Spanish functionality during refactor
- **VALIDATE**: Test with all three languages (Spanish, French, German)

### CREATE backend/src/data/languagePatterns.ts

- **IMPLEMENT**: Language-specific pattern definitions and cultural contexts
- **PATTERN**: Create structured data similar to existing phrase types
- **IMPORTS**: Language-specific grammar rules, cultural context data
- **GOTCHA**: Ensure patterns are comprehensive for accurate analysis
- **VALIDATE**: Validate pattern data structure and completeness

### UPDATE frontend/pages/index.tsx

- **IMPLEMENT**: Add language selector to main interface
- **PATTERN**: Follow existing navigation and state management patterns
- **IMPORTS**: LanguageSelector component, multi-language state management
- **GOTCHA**: Handle language state persistence across sessions
- **VALIDATE**: Test language selection and state management

### UPDATE backend/src/services/idiolectAnalyzer.ts

- **IMPLEMENT**: Make analysis language-agnostic with language-specific patterns
- **PATTERN**: Maintain existing analysis logic while adding language flexibility
- **IMPORTS**: Language patterns, multi-language AI prompts
- **GOTCHA**: Ensure analysis quality remains high across all languages
- **VALIDATE**: Test idiolect analysis for French and German phrases

---

## TESTING STRATEGY

### Unit Tests

- BaseTranslationService abstract class functionality
- Language detection accuracy with sample texts
- French and German translation services
- Language selector component interactions
- Multi-language idiolect analysis

### Integration Tests

- End-to-end workflow for each language (English → French/German)
- Language switching without data loss
- Multi-language spaced repetition system
- Cross-language analytics and progress tracking
- Voice processing for French and German

### Edge Cases

- Mixed-language input detection and handling
- Unsupported language graceful degradation
- Language switching during active sessions
- Cultural context accuracy across regions
- Pronunciation feedback for non-native accents

---

## VALIDATION COMMANDS

### Level 1: Syntax & Style

```bash
cd frontend && npm run type-check
cd backend && npm run type-check
cd frontend && npm run lint
```

### Level 2: Unit Tests

```bash
cd frontend && npm test -- language
cd backend && npm test -- translation
cd backend && npm test -- french german
```

### Level 3: Integration Tests

```bash
# Test language detection
curl -X POST localhost:3001/language/detect -d '{"text":"Bonjour, comment allez-vous?"}'
curl -X POST localhost:3001/language/detect -d '{"text":"Guten Tag, wie geht es Ihnen?"}'

# Test translations
curl -X POST localhost:3001/translations -d '{"phrases":["Hello"],"targetLanguage":"fr"}'
curl -X POST localhost:3001/translations -d '{"phrases":["Hello"],"targetLanguage":"de"}'
```

### Level 4: Manual Validation

- Select French as target language and test complete workflow
- Select German as target language and test complete workflow
- Switch between languages during active session
- Test pronunciation feedback for French and German
- Verify cultural context accuracy in translations

---

## ACCEPTANCE CRITERIA

- [ ] Users can select French or German as target language
- [ ] Idiolect analysis works accurately for French and German
- [ ] Translation quality matches Spanish implementation standards
- [ ] Pronunciation feedback works for French and German
- [ ] Language switching preserves user progress and preferences
- [ ] Cultural context is accurate for each language
- [ ] All existing Spanish functionality remains unchanged
- [ ] Performance is maintained across all languages
- [ ] UI is properly localized for each language

---

## COMPLETION CHECKLIST

- [ ] Abstract language architecture implemented
- [ ] French translation service fully functional
- [ ] German translation service fully functional
- [ ] Language selector UI component created
- [ ] Multi-language integration complete
- [ ] All existing functionality preserved
- [ ] Comprehensive test coverage for all languages
- [ ] Performance benchmarks met
- [ ] Cultural accuracy validated

---

## NOTES

**Design Decisions:**
- Use abstract base classes for maintainable language service architecture
- Implement language detection to auto-suggest target language
- Maintain separate cultural context databases for accuracy
- Preserve existing Spanish functionality during refactor

**Cultural Considerations:**
- French: Formal/informal distinctions, regional variations (France vs Quebec)
- German: Case system complexity, compound word handling, Austrian/Swiss variations
- Ensure cultural context reflects modern usage patterns

**Performance Considerations:**
- Lazy load language-specific resources to maintain startup performance
- Cache translation patterns for frequently used phrases
- Optimize AI prompts for each language's unique characteristics
