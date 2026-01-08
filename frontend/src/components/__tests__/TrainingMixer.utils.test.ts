import { levenshteinDistance } from '../TrainingMixer';

describe('TrainingMixer Utils', () => {
  describe('levenshteinDistance', () => {
    it('calculates exact matches', () => {
      expect(levenshteinDistance('hello', 'hello')).toBe(0);
      expect(levenshteinDistance('', '')).toBe(0);
    });

    it('calculates single character differences', () => {
      expect(levenshteinDistance('hello', 'hallo')).toBe(1);
      expect(levenshteinDistance('cat', 'bat')).toBe(1);
    });

    it('calculates insertions', () => {
      expect(levenshteinDistance('hello', 'helloo')).toBe(1);
      expect(levenshteinDistance('', 'a')).toBe(1);
    });

    it('calculates deletions', () => {
      expect(levenshteinDistance('hello', 'hell')).toBe(1);
      expect(levenshteinDistance('a', '')).toBe(1);
    });

    it('calculates complex differences', () => {
      expect(levenshteinDistance('kitten', 'sitting')).toBe(3);
      expect(levenshteinDistance('saturday', 'sunday')).toBe(3);
    });

    it('handles case sensitivity', () => {
      expect(levenshteinDistance('Hello', 'hello')).toBe(1);
      expect(levenshteinDistance('HELLO', 'hello')).toBe(5);
    });
  });
});
