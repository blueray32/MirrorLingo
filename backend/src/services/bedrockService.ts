import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { IntentCategory, ToneLevel, FormalityLevel, PatternType, IdiolectAnalysis } from '../models/phrase';

// Initialize Bedrock client
const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1'
});

const MODEL_ID = process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-haiku-20240307-v1:0';

export class BedrockService {
  
  // Analyze a set of phrases for idiolect patterns
  static async analyzeIdiolect(phrases: string[]): Promise<IdiolectAnalysis> {
    const prompt = this.buildAnalysisPrompt(phrases);
    
    try {
      const response = await this.invokeModel(prompt);
      return this.parseAnalysisResponse(response);
    } catch (error) {
      console.error('Error analyzing idiolect with Bedrock:', error);
      throw new Error('Failed to analyze speaking patterns');
    }
  }

  // Build structured prompt for idiolect analysis
  private static buildAnalysisPrompt(phrases: string[]): string {
    return `You are a linguistic analyst specializing in idiolect (personal speaking patterns) analysis. 

Analyze the following English phrases for speaking patterns and personal style:

PHRASES:
${phrases.map((phrase, i) => `${i + 1}. "${phrase}"`).join('\n')}

Provide analysis in this exact JSON format:
{
  "tone": "very_casual|casual|neutral|polite|formal|very_formal",
  "formality": "informal|semi_formal|formal", 
  "patterns": [
    {
      "type": "filler_words|contractions|politeness_markers|question_style|sentence_length|vocabulary_level|slang_usage",
      "description": "Brief description of the pattern observed",
      "examples": ["specific examples from the phrases"],
      "frequency": 0.8
    }
  ],
  "confidence": 0.85,
  "intents": ["work", "family", "errands", "social", "casual", "formal", "other"]
}

ANALYSIS GUIDELINES:
- Tone: Overall emotional register (casual "hey" vs formal "good morning")
- Formality: Grammar and vocabulary level 
- Patterns: Specific linguistic habits (contractions, fillers, politeness)
- Confidence: 0-1 score for analysis reliability
- Intents: Likely contexts where these phrases would be used

Focus on observable patterns, not assumptions. Be specific with examples.`;
  }

  // Invoke Bedrock model with prompt
  private static async invokeModel(prompt: string): Promise<string> {
    const payload = {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    };

    const command = new InvokeModelCommand({
      modelId: MODEL_ID,
      contentType: 'application/json',
      body: JSON.stringify(payload)
    });

    const response = await bedrockClient.send(command);
    
    if (!response.body) {
      throw new Error('No response body from Bedrock');
    }

    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    
    if (!responseBody.content || !responseBody.content[0] || !responseBody.content[0].text) {
      throw new Error('Invalid response format from Bedrock');
    }

    return responseBody.content[0].text;
  }

  // Parse and validate the analysis response
  private static parseAnalysisResponse(response: string): IdiolectAnalysis {
    try {
      // Extract JSON from response (in case there's extra text)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate and transform the response
      return {
        tone: this.validateTone(parsed.tone),
        formality: this.validateFormality(parsed.formality),
        patterns: this.validatePatterns(parsed.patterns || []),
        confidence: Math.max(0, Math.min(1, parsed.confidence || 0.5)),
        analysisDate: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error parsing Bedrock response:', error);
      console.error('Raw response:', response);
      
      // Return fallback analysis
      return {
        tone: ToneLevel.NEUTRAL,
        formality: FormalityLevel.SEMI_FORMAL,
        patterns: [],
        confidence: 0.3,
        analysisDate: new Date().toISOString()
      };
    }
  }

  // Validation helpers
  private static validateTone(tone: string): ToneLevel {
    const validTones = Object.values(ToneLevel);
    return validTones.includes(tone as ToneLevel) ? tone as ToneLevel : ToneLevel.NEUTRAL;
  }

  private static validateFormality(formality: string): FormalityLevel {
    const validFormalities = Object.values(FormalityLevel);
    return validFormalities.includes(formality as FormalityLevel) ? 
      formality as FormalityLevel : FormalityLevel.SEMI_FORMAL;
  }

  private static validatePatterns(patterns: any[]): any[] {
    if (!Array.isArray(patterns)) return [];
    
    return patterns
      .filter(pattern => pattern && typeof pattern === 'object')
      .map(pattern => ({
        type: this.validatePatternType(pattern.type),
        description: String(pattern.description || ''),
        examples: Array.isArray(pattern.examples) ? 
          pattern.examples.map(String).slice(0, 3) : [],
        frequency: Math.max(0, Math.min(1, Number(pattern.frequency) || 0))
      }))
      .slice(0, 5); // Limit to 5 patterns
  }

  private static validatePatternType(type: string): PatternType {
    const validTypes = Object.values(PatternType);
    return validTypes.includes(type as PatternType) ? 
      type as PatternType : PatternType.VOCABULARY_LEVEL;
  }

  // Classify intent for individual phrases
  static async classifyIntent(phrase: string): Promise<IntentCategory> {
    const prompt = `Classify the intent/context of this English phrase into one category:

Phrase: "${phrase}"

Categories:
- work: Professional, business, workplace communication
- family: Family interactions, parenting, household
- errands: Shopping, appointments, daily tasks
- social: Friends, casual conversations, entertainment  
- casual: General informal communication
- formal: Official, ceremonial, or very polite contexts
- other: Doesn't fit other categories

Respond with just the category name (lowercase).`;

    try {
      const response = await this.invokeModel(prompt);
      const intent = response.trim().toLowerCase();
      
      // Validate intent
      const validIntents = Object.values(IntentCategory);
      return validIntents.includes(intent as IntentCategory) ? 
        intent as IntentCategory : IntentCategory.OTHER;
    } catch (error) {
      console.error('Error classifying intent:', error);
      return IntentCategory.OTHER;
    }
  }

  // Public method for external services to invoke Bedrock
  static async invokeModelPublic(prompt: string): Promise<string> {
    return this.invokeModel(prompt);
  }
}
