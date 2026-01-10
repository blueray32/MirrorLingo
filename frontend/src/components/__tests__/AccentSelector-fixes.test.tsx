/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { AccentSelector, SpanishAccent } from '../AccentSelector';

describe('AccentSelector - Code Review Fixes', () => {
  it('should use shared SpanishAccent enum', () => {
    const mockOnChange = jest.fn();
    
    render(
      <AccentSelector 
        selectedAccent={SpanishAccent.NEUTRAL}
        onAccentChange={mockOnChange}
      />
    );

    expect(screen.getByText('Neutral Spanish')).toBeInTheDocument();
    expect(screen.getByText('Mexican Spanish')).toBeInTheDocument();
    expect(screen.getByText('Peninsular Spanish')).toBeInTheDocument();
  });

  it('should export SpanishAccent enum correctly', () => {
    expect(SpanishAccent.NEUTRAL).toBe('neutral');
    expect(SpanishAccent.MEXICO).toBe('mexico');
    expect(SpanishAccent.SPAIN).toBe('spain');
  });
});
