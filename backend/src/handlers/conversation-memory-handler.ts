import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ConversationMemoryService } from '../services/conversationMemoryService';
import { getUserIdFromEvent, getCorsHeaders } from '../utils/auth';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const corsHeaders = getCorsHeaders(event);

  try {
    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 200, headers: corsHeaders, body: '' };
    }

    const path = event.pathParameters?.proxy || '';

    switch (path) {
      case 'relationship-status':
        return await handleGetRelationshipStatus(event, corsHeaders);
      case 'conversation-memory':
        return await handleGetConversationMemory(event, corsHeaders);
      default:
        return {
          statusCode: 404,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Not found' })
        };
    }
  } catch (error) {
    console.error('Conversation memory handler error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

async function handleGetRelationshipStatus(
  event: APIGatewayProxyEvent,
  corsHeaders: Record<string, string>
): Promise<APIGatewayProxyResult> {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  const userId = getUserIdFromEvent(event);
  if (!userId) {
    return {
      statusCode: 401,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'User authentication required' })
    };
  }

  try {
    const relationshipStatus = await ConversationMemoryService.getRelationshipStatus(userId);
    
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ relationshipStatus })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Failed to get relationship status' })
    };
  }
}

async function handleGetConversationMemory(
  event: APIGatewayProxyEvent,
  corsHeaders: Record<string, string>
): Promise<APIGatewayProxyResult> {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  const userId = getUserIdFromEvent(event);
  if (!userId) {
    return {
      statusCode: 401,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'User authentication required' })
    };
  }

  try {
    const conversationMemory = await ConversationMemoryService.getConversationMemory(userId);
    
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ conversationMemory })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Failed to get conversation memory' })
    };
  }
}
