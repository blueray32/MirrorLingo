import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { IdiolectAnalyzer } from '../services/idiolectAnalyzer';
import {
  CreatePhrasesRequest,
  CreatePhrasesResponse,
  GetPhrasesResponse,
  validatePhrases
} from '../models/phrase';
import { getUserIdFromEvent, getCorsHeaders } from '../utils/auth';

// Store CORS headers at handler level
let currentCorsHeaders: Record<string, string>;

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  currentCorsHeaders = getCorsHeaders(event);

  try {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: currentCorsHeaders,
        body: ''
      };
    }

    // Extract user ID from Cognito authorizer
    const userId = getUserIdFromEvent(event);
    if (!userId) {
      return createErrorResponse(401, 'User authentication required');
    }

    // Route based on HTTP method
    switch (event.httpMethod) {
      case 'POST':
        return await handleCreatePhrases(event, userId);
      case 'GET':
        return await handleGetPhrases(userId);
      default:
        return createErrorResponse(405, 'Method not allowed');
    }

  } catch (error) {
    console.error('Handler error:', error);
    return createErrorResponse(500, 'Internal server error');
  }
};

// Handle POST /phrases - Create and analyze new phrases
async function handleCreatePhrases(
  event: APIGatewayProxyEvent,
  userId: string
): Promise<APIGatewayProxyResult> {

  try {
    // Parse request body
    if (!event.body) {
      return createErrorResponse(400, 'Request body is required');
    }

    let request: CreatePhrasesRequest;
    try {
      request = JSON.parse(event.body);
    } catch {
      return createErrorResponse(400, 'Invalid JSON in request body');
    }

    // Validate input
    if (!request.phrases) {
      return createErrorResponse(400, 'Phrases array is required');
    }

    const validation = validatePhrases(request.phrases);
    if (!validation.valid) {
      return createErrorResponse(400, `Invalid phrases: ${validation.errors.join(', ')}`);
    }

    // Analyze phrases
    const result = await IdiolectAnalyzer.analyzeUserPhrases(userId, request.phrases);

    // Generate analysis summary
    const summary = IdiolectAnalyzer.generateAnalysisSummary(result.profile);

    const response: CreatePhrasesResponse = {
      success: true,
      data: result,
      message: `Successfully analyzed ${request.phrases.length} phrases. ${summary}`
    };

    return {
      statusCode: 201,
      headers: {
        ...currentCorsHeaders,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(response)
    };

  } catch (error) {
    console.error('Error creating phrases:', error);

    const response: CreatePhrasesResponse = {
      success: false,
      error: 'Failed to analyze phrases'
    };

    return {
      statusCode: 500,
      headers: {
        ...currentCorsHeaders,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(response)
    };
  }
}

// Handle GET /phrases - Retrieve user's phrases and profile
async function handleGetPhrases(userId: string): Promise<APIGatewayProxyResult> {

  try {
    const userData = await IdiolectAnalyzer.getUserData(userId);

    const response: GetPhrasesResponse = {
      success: true,
      data: userData
    };

    return {
      statusCode: 200,
      headers: {
        ...currentCorsHeaders,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(response)
    };

  } catch (error) {
    console.error('Error getting phrases:', error);

    const response: GetPhrasesResponse = {
      success: false,
      error: 'Failed to retrieve phrases'
    };

    return {
      statusCode: 500,
      headers: {
        ...currentCorsHeaders,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(response)
    };
  }
}

// Helper function to create error responses
function createErrorResponse(statusCode: number, message: string): APIGatewayProxyResult {
  return {
    statusCode,
    headers: {
      ...currentCorsHeaders,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      success: false,
      error: message
    })
  };
}
