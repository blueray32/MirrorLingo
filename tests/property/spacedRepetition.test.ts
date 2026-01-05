import { SpacedRepetitionScheduler, ReviewItem, PerformanceRating } from '../../frontend/src/utils/spacedRepetition'

describe('SpacedRepetitionScheduler', () => {
  let scheduler: SpacedRepetitionScheduler
  let mockItem: ReviewItem

  beforeEach(() => {
    scheduler = new SpacedRepetitionScheduler()
    mockItem = {
      id: 'test-phrase-1',
      content: 'Hello, how are you?',
      translation: 'Hola, ¿cómo estás?',
      easeFactor: 2.5,
      interval: 1,
      repetitions: 0,
      nextReview: new Date(),
      createdAt: new Date(),
      lastReviewed: null
    }
  })

  it('should schedule first review correctly', () => {
    const result = scheduler.processReview(mockItem, PerformanceRating.GOOD)

    expect(result.repetitions).toBe(1)
    expect(result.interval).toBe(1)
    expect(result.easeFactor).toBe(2.5)
  })

  it('should increase interval after successful reviews', () => {
    let item = { ...mockItem, repetitions: 1, interval: 1 }
    const result = scheduler.processReview(item, PerformanceRating.GOOD)

    expect(result.interval).toBe(6)
    expect(result.repetitions).toBe(2)
  })

  it('should reset on poor performance', () => {
    let item = { ...mockItem, repetitions: 3, interval: 15 }
    const result = scheduler.processReview(item, PerformanceRating.AGAIN)

    expect(result.repetitions).toBe(0)
    expect(result.interval).toBe(1)
  })

  it('should adjust ease factor based on performance', () => {
    const easyResult = scheduler.processReview(mockItem, PerformanceRating.EASY)
    expect(easyResult.easeFactor).toBeGreaterThan(2.5)

    const hardResult = scheduler.processReview(mockItem, PerformanceRating.HARD)
    expect(hardResult.easeFactor).toBeLessThan(2.5)
  })

  it('should get due items correctly', () => {
    const now = new Date()
    const pastDate = new Date(now.getTime() - 24 * 60 * 60 * 1000) // Yesterday
    const futureDate = new Date(now.getTime() + 24 * 60 * 60 * 1000) // Tomorrow

    const items = [
      { ...mockItem, id: '1', nextReview: pastDate },
      { ...mockItem, id: '2', nextReview: futureDate },
      { ...mockItem, id: '3', nextReview: now }
    ]

    const dueItems = scheduler.getDueItems(items)
    expect(dueItems).toHaveLength(2) // Past and current
    expect(dueItems.map(item => item.id)).toEqual(['1', '3'])
  })
})
