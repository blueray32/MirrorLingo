import { SpacedRepetitionScheduler, ReviewItem } from '../../frontend/src/utils/spacedRepetition';

describe('SpacedRepetitionScheduler - Stats', () => {
  const scheduler = new SpacedRepetitionScheduler();
  
  const createItem = (overrides: Partial<ReviewItem> = {}): ReviewItem => ({
    id: 'test',
    content: 'Hello',
    translation: 'Hola',
    easeFactor: 2.5,
    interval: 1,
    repetitions: 0,
    nextReview: new Date(),
    createdAt: new Date(),
    lastReviewed: null,
    ...overrides
  });

  describe('getRetentionStats', () => {
    it('calculates mastered items correctly', () => {
      const items = [
        createItem({ id: '1', repetitions: 5, easeFactor: 2.8 }), // mastered
        createItem({ id: '2', repetitions: 3, easeFactor: 2.5 }), // mastered
        createItem({ id: '3', repetitions: 1, easeFactor: 2.0 })  // not mastered
      ];

      const stats = scheduler.getRetentionStats(items);

      expect(stats.totalItems).toBe(3);
      expect(stats.masteredItems).toBe(2);
    });

    it('identifies struggling items', () => {
      const items = [
        createItem({ id: '1', easeFactor: 1.5 }), // struggling
        createItem({ id: '2', easeFactor: 1.8 }), // struggling
        createItem({ id: '3', easeFactor: 2.5 })  // ok
      ];

      const stats = scheduler.getRetentionStats(items);
      expect(stats.strugglingItems).toBe(2);
    });

    it('calculates average ease factor', () => {
      const items = [
        createItem({ easeFactor: 2.0 }),
        createItem({ easeFactor: 3.0 })
      ];

      const stats = scheduler.getRetentionStats(items);
      expect(stats.averageEaseFactor).toBe(2.5);
    });

    it('handles empty array', () => {
      const stats = scheduler.getRetentionStats([]);
      expect(stats.totalItems).toBe(0);
      expect(stats.averageEaseFactor).toBe(0);
    });
  });

  describe('getUpcomingReviews', () => {
    it('returns items within date range sorted by date', () => {
      const now = new Date();
      const items = [
        createItem({ id: '1', nextReview: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000) }), // 3 days
        createItem({ id: '2', nextReview: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000) }), // 1 day
        createItem({ id: '3', nextReview: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000) }) // 10 days (outside)
      ];

      const upcoming = scheduler.getUpcomingReviews(items, 7);

      expect(upcoming).toHaveLength(2);
      expect(upcoming[0].id).toBe('2'); // sorted by date
      expect(upcoming[1].id).toBe('1');
    });

    it('excludes past items', () => {
      const now = new Date();
      const items = [
        createItem({ id: '1', nextReview: new Date(now.getTime() - 24 * 60 * 60 * 1000) }), // yesterday
        createItem({ id: '2', nextReview: new Date(now.getTime() + 24 * 60 * 60 * 1000) })  // tomorrow
      ];

      const upcoming = scheduler.getUpcomingReviews(items);
      expect(upcoming).toHaveLength(1);
      expect(upcoming[0].id).toBe('2');
    });
  });
});
