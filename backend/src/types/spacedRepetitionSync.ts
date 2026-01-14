// Spaced Repetition Sync Types for Cross-Device Learning Continuity

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

export interface SpacedRepetitionSyncData {
  userId: string;
  reviewItems: ReviewItem[];
  lastSyncTimestamp: Date;
  deviceId: string;
  syncVersion: number;
}

export interface SyncConflictResolution {
  strategy: 'latest_wins' | 'merge_items' | 'user_choice';
  conflictItems?: ReviewItem[];
  resolvedItems?: ReviewItem[];
}

export interface SyncResult {
  success: boolean;
  syncedItems: number;
  conflicts?: SyncConflictResolution;
  error?: string;
  lastSyncTimestamp: Date;
}

export interface SyncStatus {
  isEnabled: boolean;
  lastSync: Date | null;
  pendingSync: boolean;
  itemCount: number;
  conflicts: number;
}
