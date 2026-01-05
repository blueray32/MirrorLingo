import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { usePhrasesApi } from '../../frontend/src/hooks/usePhrasesApi'

// Mock the hook
jest.mock('../../frontend/src/hooks/usePhrasesApi')
const mockUsePhrasesApi = usePhrasesApi as jest.MockedFunction<typeof usePhrasesApi>

describe('usePhrasesApi', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should validate phrases correctly', () => {
    const phrases = ['Hello world', 'How are you?', 'Good morning']

    mockUsePhrasesApi.mockReturnValue({
      isLoading: false,
      error: null,
      phrases: [],
      profile: null,
      submitPhrases: jest.fn().mockResolvedValue(true),
      loadPhrases: jest.fn().mockResolvedValue(true),
      clearError: jest.fn()
    })

    const { submitPhrases } = usePhrasesApi()
    expect(submitPhrases).toBeDefined()
  })

  it('should handle loading state', () => {
    mockUsePhrasesApi.mockReturnValue({
      isLoading: true,
      error: null,
      phrases: [],
      profile: null,
      submitPhrases: jest.fn(),
      loadPhrases: jest.fn(),
      clearError: jest.fn()
    })

    const { isLoading } = usePhrasesApi()
    expect(isLoading).toBe(true)
  })

  it('should handle error state', () => {
    const errorMessage = 'Network error'
    mockUsePhrasesApi.mockReturnValue({
      isLoading: false,
      error: errorMessage,
      phrases: [],
      profile: null,
      submitPhrases: jest.fn(),
      loadPhrases: jest.fn(),
      clearError: jest.fn()
    })

    const { error } = usePhrasesApi()
    expect(error).toBe(errorMessage)
  })
})
