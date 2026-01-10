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
  preferredIntents: [IntentCategory.WORK],
  analysisCount: 3,
  lastUpdated: new Date().toISOString()
};

describe('TrainingMixer', () => {
  it('renders exercise interface', async () => {
    render(<TrainingMixer phrases={mockPhrases} profile={mockProfile} />);
    
    await waitFor(() => {
      expect(screen.getByText(/Exercise \d+ of \d+/)).toBeInTheDocument();
    });

    expect(screen.getByText(/Score:/)).toBeInTheDocument();
  });

  it('shows difficulty badge', async () => {
    render(<TrainingMixer phrases={mockPhrases} profile={mockProfile} />);
    
    await waitFor(() => {
      const easyBadge = screen.queryByText('easy');
      const mediumBadge = screen.queryByText('medium');
      const hardBadge = screen.queryByText('hard');
      expect(easyBadge || mediumBadge || hardBadge).toBeTruthy();
    });
  });

  it('has verify answer button', async () => {
    render(<TrainingMixer phrases={mockPhrases} profile={mockProfile} />);
    
    await waitFor(() => {
      expect(screen.getByText('Verify Answer')).toBeInTheDocument();
    });
  });
});
