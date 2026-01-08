export enum PerformanceRating {
  AGAIN = 0,  // Complete failure
  HARD = 1,   // Difficult but correct
  GOOD = 2,   // Correct with normal effort
  EASY = 3    // Effortless and immediate
}

export interface ReviewItem {
  id: string;
  content: string;
  translation: string;
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReview: Date;
  createdAt: Date;
  lastReviewed: Date | null;
}

export class SpacedRepetitionScheduler {
  private readonly MIN_EASE_FACTOR = 1.3;
  private readonly INITIAL_INTERVAL = 1;
  private readonly SECOND_INTERVAL = 6;

  processReview(item: ReviewItem, rating: PerformanceRating): ReviewItem {
    const now = new Date();
    let { easeFactor, interval, repetitions } = item;

    // Adjust ease factor based on performance
    if (rating >= PerformanceRating.GOOD) {
      easeFactor = easeFactor + (0.1 - (3 - rating) * (0.08 + (3 - rating) * 0.02));
    } else {
      easeFactor = easeFactor - 0.2;
    }

    // Ensure ease factor doesn't go below minimum
    easeFactor = Math.max(easeFactor, this.MIN_EASE_FACTOR);

    // Calculate new interval and repetitions
    if (rating < PerformanceRating.GOOD) {
      // Reset on poor performance
      repetitions = 0;
      interval = this.INITIAL_INTERVAL;
    } else {
      repetitions += 1;

      if (repetitions === 1) {
        interval = this.INITIAL_INTERVAL;
      } else if (repetitions === 2) {
        interval = this.SECOND_INTERVAL;
      } else {
        interval = Math.round(interval * easeFactor);
      }
    }

    // Calculate next review date
    const nextReview = new Date(now.getTime() + interval * 24 * 60 * 60 * 1000);

    return {
      ...item,
      easeFactor,
      interval,
      repetitions,
      nextReview,
      lastReviewed: now
    };
  }

  getDueItems(items: ReviewItem[]): ReviewItem[] {
    const now = new Date();
    return items.filter(item => item.nextReview <= now);
  }

  getUpcomingReviews(items: ReviewItem[], days: number = 7): ReviewItem[] {
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    return items
      .filter(item => item.nextReview > now && item.nextReview <= futureDate)
      .sort((a, b) => a.nextReview.getTime() - b.nextReview.getTime());
  }

  getRetentionStats(items: ReviewItem[]): {
    totalItems: number;
    masteredItems: number;
    strugglingItems: number;
    averageEaseFactor: number;
  } {
    const totalItems = items.length;
    const masteredItems = items.filter(item => item.repetitions >= 3 && item.easeFactor >= 2.5).length;
    const strugglingItems = items.filter(item => item.easeFactor < 2.0).length;
    const averageEaseFactor = items.reduce((sum, item) => sum + item.easeFactor, 0) / totalItems || 0;

    return {
      totalItems,
      masteredItems,
      strugglingItems,
      averageEaseFactor: Math.round(averageEaseFactor * 100) / 100
    };
  }
}
