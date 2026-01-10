import { render, screen, fireEvent } from '@testing-library/react';
import { AdvancedPronunciationPractice } from '../AdvancedPronunciationPractice';
import { SpanishAccent } from '../AccentSelector';

// Mock the pronunciation hook
jest.mock('../../hooks/usePronunciationAnalysis', () => ({
  usePronunciationAnalysis: () => ({
    isRecording: false,
    isAnalyzing: false,
    analysisResult: null,
    error: null,
    audioLevel: 0,
    selectedAccent: 'neutral',
    startRecording: jest.fn(),
    stopRecording: jest.fn(),
    clearResults: jest.fn(),
    setAccent: jest.fn()
  }),
  SpanishAccent: {
    NEUTRAL: 'neutral',
    MEXICO: 'mexico',
    SPAIN: 'spain',
    ARGENTINA: 'argentina',
    COLOMBIA: 'colombia'
  }
}));

describe('AdvancedPronunciationPractice', () => {
  it('renders accent selector by default', () => {
    render(<AdvancedPronunciationPractice targetPhrase="Hola, ¿cómo estás?" />);
    
    expect(screen.getByText('Phonetic Precision')).toBeInTheDocument();
    expect(screen.getByText('Neutral Spanish')).toBeInTheDocument();
  });

  it('shows practice interface after selecting accent', () => {
    render(<AdvancedPronunciationPractice targetPhrase="Hola, ¿cómo estás?" />);
    
    // Click continue with neutral accent
    fireEvent.click(screen.getByText(/Calibrate to Neutral Spanish/));
    
    // Should show practice interface
    expect(screen.getByText('Neutral Spanish Mode')).toBeInTheDocument();
    expect(screen.getByText('Switch Dialect')).toBeInTheDocument();
  });

  it('allows changing accent after selection', () => {
    render(<AdvancedPronunciationPractice targetPhrase="Hola, ¿cómo estás?" />);
    
    // Continue with neutral
    fireEvent.click(screen.getByText(/Calibrate to Neutral Spanish/));
    
    // Click change accent
    fireEvent.click(screen.getByText('Switch Dialect'));
    
    // Should show accent selector again
    expect(screen.getByText('Neutral Spanish')).toBeInTheDocument();
  });

  it('displays target phrase correctly', () => {
    const targetPhrase = "Hola, ¿cómo estás?";
    render(<AdvancedPronunciationPractice targetPhrase={targetPhrase} />);
    
    expect(screen.getByText(`"${targetPhrase}"`)).toBeInTheDocument();
    expect(screen.getByText('Enunciation Target')).toBeInTheDocument();
  });
});
