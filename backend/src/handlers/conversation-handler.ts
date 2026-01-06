import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ConversationService } from '../services/conversationService';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,x-user-id',
  'Access-Control-Allow-Methods': 'POST,OPTIONS'
};

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }

  const userId = event.headers['x-user-id'] || 'anonymous';

  try {
    if (!event.body) {
      return createResponse(400, { error: 'Request body required' });
    }

    let body;
    try {
      body = JSON.parse(event.body);
    } catch {
      return createResponse(400, { error: 'Invalid JSON' });
    }

    const { message, topic, messageHistory, userIdiolect } = body;

    if (!message) {
      return createResponse(400, { error: 'Message is required' });
    }

    const response = await ConversationService.generateResponse(message, {
      userId,
      topic: topic || 'free_conversation',
      messageHistory: messageHistory || [],
      userIdiolect
    });

    return createResponse(200, { success: true, data: response });
  } catch (error) {
    console.error('Conversation handler error:', error);
    return createResponse(500, { error: 'Failed to process conversation' });
  }
};

function createResponse(statusCode: number, body: object): APIGatewayProxyResult {
  return {
    statusCode,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  };
}
