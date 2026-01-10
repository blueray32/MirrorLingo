import { renderHook, act } from '@testing-library/react';
import { useConversationApi } from '../useConversationApi';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn()
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// Mock fetch
global.fetch = jest.fn();

describe('useConversationApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  it('loads conversation history from localStorage', () => {
    const mockHistory = {
      messages: [{ id: '1', role: 'user', content: 'Hello', timestamp: new Date() }],
      topic: 'daily_life'
    };
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockHistory));

    const { result } = renderHook(() => useConversationApi('test-user'));

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.currentTopic).toBe('daily_life');
  });

  it('saves conversation history to localStorage', async () => {
    const { result } = renderHook(() => useConversationApi('test-user'));

    act(() => {
      result.current.startConversation('work');
    });

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'mirrorlingo-conversation-history-test-user',
      expect.stringContaining('"topic":"work"')
    );
  });

  it('handles API errors gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Failed to fetch'));

    const { result } = renderHook(() => useConversationApi('test-user'));

    await act(async () => {
      await result.current.sendMessage('Hello');
    });

    expect(result.current.error).toContain('check your internet connection');
  });

  it('clears conversation history', () => {
    const { result } = renderHook(() => useConversationApi('test-user'));

    act(() => {
      result.current.clearConversation();
    });

    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
      'mirrorlingo-conversation-history-test-user'
    );
  });
});
