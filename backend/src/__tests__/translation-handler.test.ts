import { handler } from '../handlers/translation-handler';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { IdiolectAnalyzer } from '../services/idiolectAnalyzer';
import { SpanishTranslationService } from '../services/spanishTranslationService';

jest.mock('../services/idiolectAnalyzer');
jest.mock('../services/spanishTranslationService');

const mockEvent = (method: string, body?: any, userId?: string): APIGatewayProxyEvent => ({
  httpMethod: method,
  headers: userId ? { 'x-user-id': userId } : {},
  body: body ? JSON.stringify(body) : null,
  pathParameters: null,
  queryStringParameters: null,
  requestContext: {} as any,
  resource: '',
  path: '',
  isBase64Encoded: false,
  multiValueHeaders: {},
  multiValueQueryStringParameters: null,
  stageVariables: null
});

describe('translation-handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('handles OPTIONS preflight', async () => {
    const result = await handler(mockEvent('OPTIONS'));
    expect(result.statusCode).toBe(200);
    expect(result.headers).toHaveProperty('Access-Control-Allow-Origin');
  });

  it('returns 401 without user ID', async () => {
    const result = await handler(mockEvent('POST', { phraseIds: ['1'] }));
    expect(result.statusCode).toBe(401);
  });

  it('returns 400 without phraseIds', async () => {
    const result = await handler(mockEvent('POST', {}, 'test-user'));
    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).error).toContain('phraseIds');
  });

  it('returns 404 when profile not found', async () => {
    (IdiolectAnalyzer.getUserData as jest.Mock).mockResolvedValue({ phrases: [], profile: null });

    const result = await handler(mockEvent('POST', { phraseIds: ['1'] }, 'test-user'));
    expect(result.statusCode).toBe(404);
  });

  it('translates phrases successfully', async () => {
    const mockProfile = { overallTone: 'polite', overallFormality: 'semi_formal', commonPatterns: [] };
    const mockPhrase = { phraseId: '1', englishText: 'Hello' };
    
    (IdiolectAnalyzer.getUserData as jest.Mock).mockResolvedValue({
      phrases: [mockPhrase],
      profile: mockProfile
    });
    (SpanishTranslationService.translatePhrases as jest.Mock).mockResolvedValue([
      { englishPhrase: 'Hello', translation: { literal: 'Hola', natural: 'Hola' } }
    ]);

    const result = await handler(mockEvent('POST', { phraseIds: ['1'] }, 'test-user'));
    
    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.success).toBe(true);
    expect(body.data.translations).toHaveLength(1);
  });
});
