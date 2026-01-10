// Shared accent types for pronunciation features

export enum SpanishAccent {
  SPAIN = 'spain',
  MEXICO = 'mexico',
  ARGENTINA = 'argentina',
  COLOMBIA = 'colombia',
  NEUTRAL = 'neutral'
}

export interface AccentProfile {
  accent: SpanishAccent;
  name: string;
  region: string;
  flag: string;
  characteristics: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}
