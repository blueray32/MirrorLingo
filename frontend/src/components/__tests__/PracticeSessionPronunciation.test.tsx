import { render, screen, waitFor } from '@testing-library/react';
import { PracticeSession } from '../PracticeSession';
import { Phrase, IdiolectProfile, IntentCategory, ToneLevel, FormalityLevel } from '../../types/phrases';

// Mock the pronunciation hook
jest.mock('../../hooks/usePronunciationAnalysis', () => ({
  usePronunciationAnalysis: () => ({
    isRecording: false,
    isAnalyzing: false,
    analysisResult: null,
    error: null,
    audioLevel: 0,
    startRecording: jest.fn(),
    stopRecording: jest.fn(),
    clearResults: jest.fn()
  })
}));

// Mock fetch for translations
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({
      success: true,
      data: {
        translations: [{
          englishPhrase: 'Hello there',
          translation: { natural: 'Hola' }
        }]
      }
    })
  })
) as jest.Mock;

const mockPhrases: Phrase[] = [{
  phraseId: '1',
  englishText: 'Hello there',
  intent: IntentCategory.CASUAL,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  userId: 'test'
}];

const mockProfile: IdiolectProfile = {
  userId: 'test',
  overallTone: ToneLevel.CASUAL,
  overallFormality: FormalityLevel.INFORMAL,
  commonPatterns: [],
  preferredIntents: [],
  analysisCount: 1,
  lastUpdated: new Date().toISOString()
};

describe('PracticeSession with Pronunciation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders practice session component', async () => {
    const onComplete = jest.fn();
    
    render(
      <PracticeSession 
        phrases={mockPhrases}
        profile={mockProfile}
        onSessionComplete={onComplete}
      />
    );

    // Component should render something
    await waitFor(() => {
      // Either shows the practice card or the "caught up" message
      const hasContent = screen.queryByText(/Hello there|Perfect Timing/);
      expect(hasContent).toBeTruthy();
    }, { timeout: 2000 });
  });

  it('renders empty state with no phrases', () => {
    const onComplete = jest.fn();
    
    const { container } = render(
      <PracticeSession 
        phrases={[]}
        profile={mockProfile}
        onSessionComplete={onComplete}
      />
    );

    // Component renders without crashing
    expect(container.querySelector('.practice-session')).toBeInTheDocument();
  });
});
