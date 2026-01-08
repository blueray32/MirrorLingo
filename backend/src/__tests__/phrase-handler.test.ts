import { handler } from '../../src/handlers/phrase-handler';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';

// Mock AWS services
jest.mock('../../src/services/idiolectAnalyzer');
jest.mock('../../src/utils/dynamodb');

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

const mockContext: Context = {} as Context;

describe('phrase-handler', () => {
  it('handles OPTIONS request', async () => {
    const event = mockEvent('OPTIONS');
    const result = await handler(event, mockContext);
    
    expect(result.statusCode).toBe(200);
    expect(result.headers).toHaveProperty('Access-Control-Allow-Origin');
  });

  it('returns 401 without user ID', async () => {
    const event = { ...mockEvent('POST'), headers: {} };
    const result = await handler(event, mockContext);
    
    expect(result.statusCode).toBe(401);
  });

  it('returns 405 for unsupported methods', async () => {
    const event = mockEvent('DELETE');
    const result = await handler(event, mockContext);
    
    expect(result.statusCode).toBe(405);
  });
});
