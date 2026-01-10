import { SpanishAccent } from '../accents';

describe('Shared Accent Types - Code Review Fixes', () => {
  it('should have consistent SpanishAccent enum values', () => {
    expect(SpanishAccent.NEUTRAL).toBe('neutral');
    expect(SpanishAccent.MEXICO).toBe('mexico');
    expect(SpanishAccent.SPAIN).toBe('spain');
    expect(SpanishAccent.ARGENTINA).toBe('argentina');
    expect(SpanishAccent.COLOMBIA).toBe('colombia');
  });

  it('should export all required accent values', () => {
    const accentValues = Object.values(SpanishAccent);
    expect(accentValues).toHaveLength(5);
    expect(accentValues).toContain('neutral');
    expect(accentValues).toContain('mexico');
    expect(accentValues).toContain('spain');
    expect(accentValues).toContain('argentina');
    expect(accentValues).toContain('colombia');
  });
});
