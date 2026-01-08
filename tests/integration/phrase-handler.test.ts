import '../setup/aws-mocks' // Import AWS service mocks
import { handler } from '../../backend/src/handlers/phrase-handler'
import { APIGatewayProxyEvent, Context } from 'aws-lambda'

// Mock Lambda context
const mockContext: Context = {
  callbackWaitsForEmptyEventLoop: true,
  functionName: 'test-function',
  functionVersion: '1',
  invokedFunctionArn: 'arn:aws:lambda:us-east-1:123456789:function:test',
  memoryLimitInMB: '128',
  awsRequestId: 'test-request-id',
  logGroupName: '/aws/lambda/test',
  logStreamName: '2024/01/01/[$LATEST]test',
  getRemainingTimeInMillis: () => 30000,
  done: () => { },
  fail: () => { },
  succeed: () => { }
}

describe('Phrase Handler Integration', () => {
  const mockEvent: Partial<APIGatewayProxyEvent> = {
    httpMethod: 'POST',
    headers: {
      'x-user-id': 'test-user-123',
      'Content-Type': 'application/json'
    },
    requestContext: {
      authorizer: {
        claims: {
          sub: 'test-user-123'
        }
      }
    } as any,
    body: JSON.stringify({
      phrases: [
        'Could you take a look at this?',
        'No worries, take your time',
        'I think we should discuss this further'
      ]
    })
  }

  it('should process phrases and return analysis', async () => {
    const result = await handler(mockEvent as APIGatewayProxyEvent, mockContext)

    expect(result.statusCode).toBe(201) // POST returns 201 Created

    const body = JSON.parse(result.body)
    expect(body.success).toBe(true)
    expect(body.data).toBeDefined()
    expect(body.data.phrases).toHaveLength(3)
    expect(body.data.profile).toBeDefined()
  })

  it('should handle missing user ID', async () => {
    const eventWithoutUserId = {
      ...mockEvent,
      headers: { 'Content-Type': 'application/json' },
      requestContext: {} as any // No authorizer claims
    }

    const result = await handler(eventWithoutUserId as APIGatewayProxyEvent, mockContext)

    expect(result.statusCode).toBe(401) // Returns 401 Unauthorized

    const body = JSON.parse(result.body)
    expect(body.success).toBe(false)
    expect(body.error).toContain('User authentication required')
  })

  it('should handle CORS preflight', async () => {
    const optionsEvent = {
      ...mockEvent,
      httpMethod: 'OPTIONS'
    }

    const result = await handler(optionsEvent as APIGatewayProxyEvent, mockContext)

    expect(result.statusCode).toBe(200)
    expect(result.headers).toHaveProperty('Access-Control-Allow-Origin', 'http://localhost:3000')
  })
})
