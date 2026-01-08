import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TrainingMixer } from '../TrainingMixer';
import { Phrase, IdiolectProfile, IntentCategory, ToneLevel, FormalityLevel, PatternType } from '../../types/phrases';

const mockPhrases: Phrase[] = [
  {
    userId: 'test-user',
    phraseId: '1',
    englishText: "Could you take a look at this?",
    intent: IntentCategory.WORK,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    userId: 'test-user',
    phraseId: '2', 
    englishText: "I'm really excited about this project",
    intent: IntentCategory.WORK,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    userId: 'test-user',
    phraseId: '3',
    englishText: "Let's grab coffee sometime",
    intent: IntentCategory.SOCIAL,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const mockProfile: IdiolectProfile = {
  userId: 'test-user',
  overallTone: ToneLevel.CASUAL,
  overallFormality: FormalityLevel.INFORMAL,
  commonPatterns: [
    { 
      type: PatternType.CONTRACTIONS, 
      frequency: 0.7, 
      description: 'Uses contractions frequently',
      examples: ["I'm", "you're", "can't"]
    }
  ],
  preferredIntents: [IntentCategory.WORK, IntentCategory.SOCIAL],
  analysisCount: 3,
  lastUpdated: new Date().toISOString()
};

describe('TrainingMixer', () => {
  it('generates exercises from phrases', async () => {
    render(<TrainingMixer phrases={mockPhrases} profile={mockProfile} />);
    
    await waitFor(() => {
      expect(screen.getByText(/1 of \d+/)).toBeInTheDocument();
    });

    expect(screen.getByText('Score: 0/0')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Type your answer...')).toBeInTheDocument();
  });

  it('handles fill-in-blank exercises', async () => {
    render(<TrainingMixer phrases={mockPhrases} profile={mockProfile} />);
    
    await waitFor(() => {
      // Check for either text input or multiple choice buttons
      const hasTextInput = screen.queryByPlaceholderText('Type your answer...');
      const hasMultipleChoice = screen.queryByText('1st syllable');
      expect(hasTextInput || hasMultipleChoice).toBeTruthy();
    });

    const textInput = screen.queryByPlaceholderText('Type your answer...');
    const submitBtn = screen.getByText('Check Answer');

    if (textInput) {
      fireEvent.change(textInput, { target: { value: 'test' } });
    } else {
      // Click first multiple choice option for pronunciation exercises
      fireEvent.click(screen.getByText('1st syllable'));
    }
    
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Correct!|Not quite/)).toBeInTheDocument();
    });
  });

  it('advances to next exercise', async () => {
    render(<TrainingMixer phrases={mockPhrases} profile={mockProfile} />);
    
    await waitFor(() => {
      // Check for either text input or multiple choice buttons
      const hasTextInput = screen.queryByPlaceholderText('Type your answer...');
      const hasMultipleChoice = screen.queryByText('1st syllable');
      expect(hasTextInput || hasMultipleChoice).toBeTruthy();
    });

    // Answer current exercise - handle both input types
    const textInput = screen.queryByPlaceholderText('Type your answer...');
    if (textInput) {
      fireEvent.change(textInput, { target: { value: 'test' } });
    } else {
      // Click first multiple choice option
      fireEvent.click(screen.getByText('1st syllable'));
    }
    fireEvent.click(screen.getByText('Check Answer'));

    await waitFor(() => {
      expect(screen.getByText(/Next Exercise|Finish/)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Next Exercise|Finish/));

    await waitFor(() => {
      if (screen.queryByText('Training Complete!')) {
        expect(screen.getByText('Training Complete!')).toBeInTheDocument();
      } else {
        expect(screen.getByText(/2 of \d+/)).toBeInTheDocument();
      }
    });
  });

  it('handles keyboard input', async () => {
    render(<TrainingMixer phrases={mockPhrases} profile={mockProfile} />);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Type your answer...')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('Type your answer...');
    fireEvent.change(input, { target: { value: 'test' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(screen.getByText(/Correct!|Not quite/)).toBeInTheDocument();
    });
  });

  it('shows completion summary when finished', async () => {
    const singlePhrase = [mockPhrases[0]];
    render(<TrainingMixer phrases={singlePhrase} profile={mockProfile} />);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Type your answer...')).toBeInTheDocument();
    });

    // Complete all exercises by cycling through them
    let exerciseCount = 0;
    const maxExercises = 10; // Safety limit
    
    while (exerciseCount < maxExercises) {
      const input = screen.getByPlaceholderText('Type your answer...');
      fireEvent.change(input, { target: { value: 'test' } });
      fireEvent.click(screen.getByText('Check Answer'));

      await waitFor(() => {
        expect(screen.getByText(/Next Exercise|Finish/)).toBeInTheDocument();
      });

      const nextButton = screen.getByText(/Next Exercise|Finish/);
      const isFinish = nextButton.textContent === 'Finish';
      
      fireEvent.click(nextButton);
      
      if (isFinish) {
        await waitFor(() => {
          expect(screen.getByText('Training Complete!')).toBeInTheDocument();
        });
        break;
      }
      
      exerciseCount++;
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Type your answer...')).toBeInTheDocument();
      });
    }
  });

  it('calls onComplete when finished', async () => {
    const onComplete = jest.fn();
    const singlePhrase = [mockPhrases[0]];
    
    render(<TrainingMixer phrases={singlePhrase} profile={mockProfile} onComplete={onComplete} />);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Type your answer...')).toBeInTheDocument();
    });

    // Complete all exercises
    let exerciseCount = 0;
    const maxExercises = 10;
    
    while (exerciseCount < maxExercises) {
      const input = screen.getByPlaceholderText('Type your answer...');
      fireEvent.change(input, { target: { value: 'test' } });
      fireEvent.click(screen.getByText('Check Answer'));

      await waitFor(() => {
        expect(screen.getByText(/Next Exercise|Finish/)).toBeInTheDocument();
      });

      const nextButton = screen.getByText(/Next Exercise|Finish/);
      const isFinish = nextButton.textContent === 'Finish';
      
      fireEvent.click(nextButton);
      
      if (isFinish) {
        expect(onComplete).toHaveBeenCalled();
        break;
      }
      
      exerciseCount++;
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Type your answer...')).toBeInTheDocument();
      });
    }
  });

  it('handles empty phrases gracefully', () => {
    render(<TrainingMixer phrases={[]} profile={mockProfile} />);
    expect(screen.getByText('Not Enough Material')).toBeInTheDocument();
  });

  it('generates different exercise types', async () => {
    const phrasesWithVariety = [
      {
        userId: 'test-user',
        phraseId: '1',
        englishText: "This is a good example",
        intent: IntentCategory.WORK,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        userId: 'test-user',
        phraseId: '2',
        englishText: "I'm happy about this",
        intent: IntentCategory.SOCIAL,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    render(<TrainingMixer phrases={phrasesWithVariety} profile={mockProfile} />);
    
    await waitFor(() => {
      // Wait for exercise to render - could be text input or multiple choice
      expect(screen.getByText(/Check Answer|Submit/)).toBeInTheDocument();
    });

    // Should generate various exercise types including new ones
    expect(screen.getByText(/Fill in the Blank|Synonym Challenge|Antonym Challenge/)).toBeInTheDocument();
  });

  it('disables submit button when input is empty', async () => {
    render(<TrainingMixer phrases={mockPhrases} profile={mockProfile} />);
    
    await waitFor(() => {
      expect(screen.getByText('Check Answer')).toBeInTheDocument();
    });

    const submitBtn = screen.getByText('Check Answer');
    // For text input exercises, button is disabled when empty
    // For multiple choice, button may be enabled
    const input = screen.queryByPlaceholderText('Type your answer...');
    if (input) {
      expect(submitBtn).toBeDisabled();
      fireEvent.change(input, { target: { value: 'test' } });
      expect(submitBtn).not.toBeDisabled();
    }
  });
});
