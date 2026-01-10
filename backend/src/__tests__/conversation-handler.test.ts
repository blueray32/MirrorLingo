import { handler } from '../../src/handlers/conversation-handler';
import { APIGatewayProxyEvent } from 'aws-lambda';

// Mock conversation service
jest.mock('../../src/services/conversationService');

const mockEvent = (method: string, body?: any): APIGatewayProxyEvent => ({
  httpMethod: method,
  headers: { 'x-user-id': 'test-user' },
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

describe('conversation-handler', () => {
  it('handles OPTIONS request', async () => {
    const event = mockEvent('OPTIONS');
    const result = await handler(event);
    
    expect(result.statusCode).toBe(200);
    expect(result.headers).toHaveProperty('Access-Control-Allow-Origin');
  });

  it('returns 401 without user ID', async () => {
    const event = { ...mockEvent('POST'), headers: {} };
    const result = await handler(event);
    
    expect(result.statusCode).toBe(401);
  });

  it('validates required message field', async () => {
    const event = mockEvent('POST', { topic: 'daily_life' });
    const result = await handler(event);
    
    expect(result.statusCode).toBe(400);
    const body = JSON.parse(result.body);
    expect(body.error).toContain('Message is required');
  });

  it('processes valid conversation request', async () => {
    const { ConversationService } = require('../../src/services/conversationService');
    ConversationService.generateResponse = jest.fn().mockResolvedValue({
      response: 'Hola, ¿cómo estás?',
      corrections: [],
      vocabulary: []
    });

    const event = mockEvent('POST', {
      message: 'Hello',
      topic: 'daily_life'
    });
    
    const result = await handler(event);
    
    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.success).toBe(true);
    expect(body.data.response).toBe('Hola, ¿cómo estás?');
  });
});
