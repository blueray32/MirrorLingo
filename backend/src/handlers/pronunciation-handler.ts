import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { PronunciationAnalysisService } from '../services/pronunciationAnalysisService';
import { 
  PronunciationRequest, 
  PronunciationResponse, 
  validatePronunciationRequest 
} from '../types/pronunciation';
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

    // Extract user ID from headers (for demo) or Cognito authorizer
    const userId = getUserIdFromEvent(event) || event.headers['x-user-id'];
    if (!userId) {
      return createErrorResponse(401, 'User authentication required');
    }

    // Route based on HTTP method and path
    const pathSegments = event.path.split('/').filter(Boolean);
    const action = pathSegments[pathSegments.length - 1];

    switch (event.httpMethod) {
      case 'POST':
        if (action === 'analyze') {
          return await handleAnalyzePronunciation(event, userId);
        }
        return createErrorResponse(404, 'Endpoint not found');
      default:
        return createErrorResponse(405, 'Method not allowed');
    }

  } catch (error) {
    console.error('Pronunciation handler error:', error);
    return createErrorResponse(500, 'Internal server error');
  }
};

function sanitizeInput(input: string): string {
  // Remove potentially harmful characters and normalize
  return input
    .replace(/[<>\"'&]/g, '') // Remove HTML/script injection characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
    .substring(0, 500); // Limit length
}

async function handleAnalyzePronunciation(
  event: APIGatewayProxyEvent,
  userId: string
): Promise<APIGatewayProxyResult> {
  const startTime = Date.now();

  try {
    if (!event.body) {
      return createErrorResponse(400, 'Request body is required');
    }

    const requestData = JSON.parse(event.body) as PronunciationRequest;
    
    // Sanitize user inputs
    if (requestData.transcription) {
      requestData.transcription = sanitizeInput(requestData.transcription);
    }
    if (requestData.targetPhrase) {
      requestData.targetPhrase = sanitizeInput(requestData.targetPhrase);
    }
    
    // Validate request
    const validation = validatePronunciationRequest(requestData);
    if (!validation.valid) {
      return createErrorResponse(400, 'Invalid request parameters');
    }

    // Ensure userId is set
    requestData.userId = userId;

    // Analyze pronunciation
    const analysis = await PronunciationAnalysisService.analyzePronunciation(requestData);
    
    const response: PronunciationResponse = {
      success: true,
      analysis,
      processingTime: Date.now() - startTime
    };

    return {
      statusCode: 200,
      headers: currentCorsHeaders,
      body: JSON.stringify(response)
    };

  } catch (error) {
    console.error('Pronunciation analysis error:', error);
    
    const response: PronunciationResponse = {
      success: false,
      error: 'Pronunciation analysis failed. Please try again.',
      processingTime: Date.now() - startTime
    };

    return {
      statusCode: 500,
      headers: currentCorsHeaders,
      body: JSON.stringify(response)
    };
  }
}

function createErrorResponse(statusCode: number, message: string): APIGatewayProxyResult {
  return {
    statusCode,
    headers: currentCorsHeaders,
    body: JSON.stringify({
      success: false,
      error: message
    })
  };
}
