import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { SpanishTranslationService, TranslationResult } from '../services/spanishTranslationService';
import { IdiolectAnalyzer } from '../services/idiolectAnalyzer';
import { getCorsHeaders, getUserIdFromEvent } from '../utils/auth';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const corsHeaders = getCorsHeaders(event);

  try {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: ''
      };
    }

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

    let body;
    try {
      body = JSON.parse(event.body);
    } catch {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Invalid JSON in request body' })
      };
    }

    const { phraseIds } = body;
    
    if (!phraseIds || !Array.isArray(phraseIds)) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'phraseIds array required' })
      };
    }

    // Get user's phrases and profile
    const userData = await IdiolectAnalyzer.getUserData(userId);

    if (!userData.profile) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'User profile not found. Please analyze phrases first.' })
      };
    }

    // Filter phrases by requested IDs
    const phrasesToTranslate = userData.phrases.filter(phrase =>
      phraseIds.includes(phrase.phraseId)
    );

    if (phrasesToTranslate.length === 0) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'No matching phrases found' })
      };
    }

    // Generate Spanish translations
    const translations = await SpanishTranslationService.translatePhrases(
      phrasesToTranslate,
      userData.profile
    );

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        data: {
          translations,
          userProfile: {
            tone: userData.profile.overallTone,
            formality: userData.profile.overallFormality,
            patterns: userData.profile.commonPatterns.slice(0, 3)
          }
        }
      })
    };

  } catch (error) {
    console.error('Translation error:', error);

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        success: false,
        error: 'Failed to generate Spanish translations'
      })
    };
  }
};
