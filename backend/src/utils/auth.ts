import { APIGatewayProxyEvent } from 'aws-lambda';

// Parse allowed origins from environment variable
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000')
  .split(',')
  .map(origin => origin.trim());

/**
 * Get the CORS origin header value for a request
 * Returns the request origin if it's in the allowed list, otherwise returns the first allowed origin
 */
export function getCorsOrigin(event: APIGatewayProxyEvent): string {
  const requestOrigin = event.headers.origin || event.headers.Origin;
  if (requestOrigin && ALLOWED_ORIGINS.includes(requestOrigin)) {
    return requestOrigin;
  }
  return ALLOWED_ORIGINS[0];
}

/**
 * Get CORS headers for a specific request
 */
export function getCorsHeaders(event: APIGatewayProxyEvent): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': getCorsOrigin(event),
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,x-user-id',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Credentials': 'true'
  };
}

/**
 * Extract user ID from API Gateway event
 * Supports both Cognito authorizer and x-user-id header for development
 */
export function getUserIdFromEvent(event: APIGatewayProxyEvent): string | null {
  try {
    // First try Cognito authorizer (production)
    const claims = event.requestContext.authorizer?.claims;
    if (claims && claims.sub) {
      return claims.sub;
    }

    // Fallback to x-user-id header (development/demo)
    const headerUserId = event.headers['x-user-id'] || event.headers['X-User-Id'];
    if (headerUserId) {
      return headerUserId;
    }

    return null;
  } catch (error) {
    console.error('Error extracting user ID:', error);
    return null;
  }
}

/**
 * Standard CORS headers for all API responses
 * @deprecated Use getCorsHeaders(event) instead for proper origin validation
 */
export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGINS[0],
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,x-user-id',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
};
