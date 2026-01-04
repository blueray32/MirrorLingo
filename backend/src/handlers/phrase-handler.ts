import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { IdiolectAnalyzer } from '../services/idiolectAnalyzer';
import { 
  CreatePhrasesRequest, 
  CreatePhrasesResponse, 
  GetPhrasesResponse,
  validatePhrases 
} from '../models/phrase';

// CORS headers for all responses
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
};

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  
  console.log('Event:', JSON.stringify(event, null, 2));
  
  try {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: ''
      };
    }

    // Extract user ID from Cognito authorizer
    const userId = getUserIdFromEvent(event);
    if (!userId) {
      return createErrorResponse(401, 'Unauthorized: No user ID found');
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

    const request: CreatePhrasesRequest = JSON.parse(event.body);
    
    // Validate input
    if (!request.phrases) {
      return createErrorResponse(400, 'Phrases array is required');
    }

    const validation = validatePhrases(request.phrases);
    if (!validation.valid) {
      return createErrorResponse(400, `Invalid phrases: ${validation.errors.join(', ')}`);
    }

    // Analyze phrases
    console.log(`Analyzing ${request.phrases.length} phrases for user ${userId}`);
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
        ...CORS_HEADERS,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(response)
    };

  } catch (error) {
    console.error('Error creating phrases:', error);
    
    const response: CreatePhrasesResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to analyze phrases'
    };

    return {
      statusCode: 500,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(response)
    };
  }
}

// Handle GET /phrases - Retrieve user's phrases and profile
async function handleGetPhrases(userId: string): Promise<APIGatewayProxyResult> {
  
  try {
    console.log(`Retrieving phrases for user ${userId}`);
    const userData = await IdiolectAnalyzer.getUserData(userId);
    
    const response: GetPhrasesResponse = {
      success: true,
      data: userData
    };

    return {
      statusCode: 200,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(response)
    };

  } catch (error) {
    console.error('Error getting phrases:', error);
    
    const response: GetPhrasesResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve phrases'
    };

    return {
      statusCode: 500,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(response)
    };
  }
}

// Extract user ID from Cognito authorizer context
function getUserIdFromEvent(event: APIGatewayProxyEvent): string | null {
  try {
    // In API Gateway with Cognito authorizer, user info is in requestContext
    const claims = event.requestContext.authorizer?.claims;
    
    if (claims && claims.sub) {
      return claims.sub; // Cognito user ID (sub claim)
    }

    // Fallback: check for custom authorizer
    if (event.requestContext.authorizer?.userId) {
      return event.requestContext.authorizer.userId;
    }

    // For testing: allow override via header (remove in production)
    if (process.env.NODE_ENV === 'development' && event.headers['x-user-id']) {
      console.warn('Using test user ID from header - remove in production!');
      return event.headers['x-user-id'];
    }

    return null;
  } catch (error) {
    console.error('Error extracting user ID:', error);
    return null;
  }
}

// Helper function to create error responses
function createErrorResponse(statusCode: number, message: string): APIGatewayProxyResult {
  return {
    statusCode,
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      success: false,
      error: message
    })
  };
}

// Health check endpoint (if needed)
export const healthCheck = async (): Promise<APIGatewayProxyResult> => {
  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify({
      success: true,
      message: 'MirrorLingo API is healthy',
      timestamp: new Date().toISOString()
    })
  };
};
