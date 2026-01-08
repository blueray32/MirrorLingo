import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ConversationService } from '../services/conversationService';
import { getUserIdFromEvent, getCorsHeaders } from '../utils/auth';

// Store CORS headers at handler level for use in createResponse
let currentCorsHeaders: Record<string, string>;

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  currentCorsHeaders = getCorsHeaders(event);

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: currentCorsHeaders, body: '' };
  }

  const userId = getUserIdFromEvent(event);
  if (!userId) {
    return createResponse(401, { error: 'User authentication required' });
  }

  try {
    if (!event.body) {
      return createResponse(400, { error: 'Request body required' });
    }

    let body;
    try {
      body = JSON.parse(event.body);
    } catch {
      return createResponse(400, { error: 'Invalid JSON in request body' });
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
    headers: { ...currentCorsHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  };
}
