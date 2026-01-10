import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { LettaService } from '../services/lettaService';
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
      case 'status':
        return handleStatus(corsHeaders);
      case 'sync-profile':
        return await handleSyncProfile(event, corsHeaders);
      default:
        return {
          statusCode: 404,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Not found' })
        };
    }
  } catch (error) {
    console.error('Letta handler error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

async function handleStatus(corsHeaders: Record<string, string>): Promise<APIGatewayProxyResult> {
  const enabled = LettaService.isEnabled();
  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({ enabled })
  };
}

async function handleSyncProfile(
  event: APIGatewayProxyEvent,
  corsHeaders: Record<string, string>
): Promise<APIGatewayProxyResult> {
  if (event.httpMethod !== 'POST') {
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

  if (!event.body) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Request body required' })
    };
  }

  try {
    const profile = JSON.parse(event.body);
    const success = await LettaService.syncLearnerProfile(profile);
    
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ success })
    };
  } catch (error) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Invalid profile data' })
    };
  }
}
