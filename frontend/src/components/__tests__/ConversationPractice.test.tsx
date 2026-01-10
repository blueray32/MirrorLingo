import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ConversationPractice } from '../ConversationPractice';

// Mock the conversation hook
jest.mock('../../hooks/useConversationApi', () => ({
  useConversationApi: jest.fn(() => ({
    messages: [],
    isLoading: false,
    error: null,
    currentTopic: 'free_conversation',
    sendMessage: jest.fn(),
    startConversation: jest.fn(),
    clearConversation: jest.fn()
  }))
}));

describe('ConversationPractice', () => {
  const defaultProps = {
    userId: 'test-user',
    userProfile: {
      tone: 'casual',
      formality: 'informal',
      patterns: ['uses contractions']
    }
  };

  it('renders conversation interface', () => {
    render(<ConversationPractice {...defaultProps} />);
    
    expect(screen.getByText('Fluent Conversation')).toBeInTheDocument();
    expect(screen.getByText('🏠 Daily Life')).toBeInTheDocument();
  });

  it('handles topic selection', async () => {
    const mockStartConversation = jest.fn();
    const { useConversationApi } = require('../../hooks/useConversationApi');
    useConversationApi.mockReturnValue({
      messages: [],
      isLoading: false,
      error: null,
      currentTopic: 'free_conversation',
      sendMessage: jest.fn(),
      startConversation: mockStartConversation,
      clearConversation: jest.fn()
    });

    render(<ConversationPractice {...defaultProps} />);
    
    const topicButton = screen.getByText('🏠 Daily Life');
    fireEvent.click(topicButton);

    expect(mockStartConversation).toHaveBeenCalledWith('daily_life');
  });

  it('displays topic selection when no topic selected', () => {
    const { useConversationApi } = require('../../hooks/useConversationApi');
    useConversationApi.mockReturnValue({
      messages: [],
      isLoading: false,
      error: 'Connection failed',
      currentTopic: 'free_conversation',
      sendMessage: jest.fn(),
      startConversation: jest.fn(),
      clearConversation: jest.fn()
    });

    render(<ConversationPractice {...defaultProps} />);
    
    expect(screen.getByText('Fluent Conversation')).toBeInTheDocument();
  });
});
