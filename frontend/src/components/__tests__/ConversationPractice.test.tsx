import { render, screen, fireEvent } from '@testing-library/react';
import { ConversationPractice } from '../ConversationPractice';

// Mock scrollIntoView for jsdom
Element.prototype.scrollIntoView = jest.fn();

// Mock fetch for hooks that use it
global.fetch = jest.fn(() => Promise.resolve({ ok: false })) as jest.Mock;

// Mock the conversation hook
jest.mock('../../hooks/useConversationApi', () => ({
  useConversationApi: jest.fn(() => ({
    messages: [],
    isLoading: false,
    error: null,
    currentTopic: 'daily_life',
    sendMessage: jest.fn(),
    startConversation: jest.fn(),
    clearConversation: jest.fn()
  }))
}));

// Mock hooks that make fetch calls
jest.mock('../../hooks/useConversationMemory', () => ({
  useConversationMemory: jest.fn(() => ({
    conversationMemory: null,
    isLoading: false,
    error: null
  }))
}));

jest.mock('../../hooks/useMistakePatterns', () => ({
  useMistakePatterns: jest.fn(() => ({
    mistakeCategories: [],
    isLoading: false,
    error: null
  }))
}));

describe('ConversationPractice', () => {
  const defaultProps = {
    userId: 'test-user',
    topic: 'daily_life' as const,
    userProfile: {
      tone: 'casual',
      formality: 'informal',
      patterns: ['uses contractions']
    }
  };

  it('renders conversation interface with topic', () => {
    render(<ConversationPractice {...defaultProps} />);
    
    expect(screen.getByText('Finish Session')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Escribe en español...')).toBeInTheDocument();
  });

  it('starts conversation on mount', () => {
    const mockStartConversation = jest.fn();
    const { useConversationApi } = require('../../hooks/useConversationApi');
    useConversationApi.mockReturnValue({
      messages: [],
      isLoading: false,
      error: null,
      currentTopic: 'daily_life',
      sendMessage: jest.fn(),
      startConversation: mockStartConversation,
      clearConversation: jest.fn()
    });

    render(<ConversationPractice {...defaultProps} />);

    expect(mockStartConversation).toHaveBeenCalledWith('daily_life');
  });

  it('displays error when present', () => {
    const { useConversationApi } = require('../../hooks/useConversationApi');
    useConversationApi.mockReturnValue({
      messages: [],
      isLoading: false,
      error: 'Connection failed',
      currentTopic: 'daily_life',
      sendMessage: jest.fn(),
      startConversation: jest.fn(),
      clearConversation: jest.fn()
    });

    render(<ConversationPractice {...defaultProps} />);
    
    expect(screen.getByText('Connection failed')).toBeInTheDocument();
  });
});
