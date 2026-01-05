import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { ConversationService } from '../services/conversationService'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,x-user-id',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Conversation handler event:', JSON.stringify(event, null, 2))

  try {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: ''
      }
    }

    const userId = event.headers['x-user-id']
    if (!userId) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          success: false,
          error: 'User ID required'
        })
      }
    }

    if (event.httpMethod === 'POST') {
      const path = event.path || event.resource

      if (path.includes('/conversation/start')) {
        return await handleStartConversation(event, userId)
      } else if (path.includes('/conversation/chat')) {
        return await handleChatMessage(event, userId)
      }
    }

    return {
      statusCode: 404,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        success: false,
        error: 'Endpoint not found'
      })
    }

  } catch (error) {
    console.error('Conversation handler error:', error)
    
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      })
    }
  }
}

async function handleStartConversation(
  event: APIGatewayProxyEvent, 
  userId: string
): Promise<APIGatewayProxyResult> {
  
  const body = JSON.parse(event.body || '{}')
  const { topic, userProfile } = body

  try {
    const response = await ConversationService.startConversation(topic, userProfile)
    
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        success: true,
        data: {
          sessionId: `session-${Date.now()}`,
          greeting: response
        }
      })
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        success: false,
        error: 'Failed to start conversation'
      })
    }
  }
}

async function handleChatMessage(
  event: APIGatewayProxyEvent,
  userId: string
): Promise<APIGatewayProxyResult> {
  
  const body = JSON.parse(event.body || '{}')
  const { message, context } = body

  if (!message) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        success: false,
        error: 'Message is required'
      })
    }
  }

  try {
    const response = await ConversationService.generateResponse(message, context)
    
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        success: true,
        data: response
      })
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        success: false,
        error: 'Failed to generate response'
      })
    }
  }
}
