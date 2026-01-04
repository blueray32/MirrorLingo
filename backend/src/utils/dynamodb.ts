import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { 
  DynamoDBDocumentClient, 
  PutCommand, 
  GetCommand, 
  QueryCommand, 
  UpdateCommand,
  DeleteCommand 
} from '@aws-sdk/lib-dynamodb';

// Initialize DynamoDB client
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1'
});

export const dynamoDb = DynamoDBDocumentClient.from(client);

const PHRASES_TABLE = process.env.PHRASES_TABLE || 'MirrorLingo-Phrases-dev';

// Generic DynamoDB operations
export class DynamoDBService {
  
  // Put item in table
  static async putItem(item: Record<string, any>): Promise<void> {
    try {
      await dynamoDb.send(new PutCommand({
        TableName: PHRASES_TABLE,
        Item: item
      }));
    } catch (error) {
      console.error('Error putting item to DynamoDB:', error);
      throw new Error('Failed to save data');
    }
  }

  // Get single item by partition and sort key
  static async getItem(userId: string, phraseId: string): Promise<any | null> {
    try {
      const result = await dynamoDb.send(new GetCommand({
        TableName: PHRASES_TABLE,
        Key: {
          userId,
          phraseId
        }
      }));
      return result.Item || null;
    } catch (error) {
      console.error('Error getting item from DynamoDB:', error);
      throw new Error('Failed to retrieve data');
    }
  }

  // Query all items for a user
  static async queryUserItems(userId: string): Promise<any[]> {
    try {
      const result = await dynamoDb.send(new QueryCommand({
        TableName: PHRASES_TABLE,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      }));
      return result.Items || [];
    } catch (error) {
      console.error('Error querying items from DynamoDB:', error);
      throw new Error('Failed to retrieve user data');
    }
  }

  // Update item with new attributes
  static async updateItem(
    userId: string, 
    phraseId: string, 
    updates: Record<string, any>
  ): Promise<void> {
    try {
      const updateExpression = Object.keys(updates)
        .map(key => `#${key} = :${key}`)
        .join(', ');
      
      const expressionAttributeNames = Object.keys(updates)
        .reduce((acc, key) => ({ ...acc, [`#${key}`]: key }), {});
      
      const expressionAttributeValues = Object.keys(updates)
        .reduce((acc, key) => ({ ...acc, [`:${key}`]: updates[key] }), {});

      await dynamoDb.send(new UpdateCommand({
        TableName: PHRASES_TABLE,
        Key: { userId, phraseId },
        UpdateExpression: `SET ${updateExpression}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues
      }));
    } catch (error) {
      console.error('Error updating item in DynamoDB:', error);
      throw new Error('Failed to update data');
    }
  }

  // Delete item
  static async deleteItem(userId: string, phraseId: string): Promise<void> {
    try {
      await dynamoDb.send(new DeleteCommand({
        TableName: PHRASES_TABLE,
        Key: { userId, phraseId }
      }));
    } catch (error) {
      console.error('Error deleting item from DynamoDB:', error);
      throw new Error('Failed to delete data');
    }
  }

  // Batch put multiple items (for initial phrase creation)
  static async batchPutItems(items: Record<string, any>[]): Promise<void> {
    try {
      // For simplicity, we'll do sequential puts
      // In production, use BatchWriteCommand for better performance
      for (const item of items) {
        await this.putItem(item);
      }
    } catch (error) {
      console.error('Error batch putting items to DynamoDB:', error);
      throw new Error('Failed to save multiple items');
    }
  }
}

// Utility functions for common operations
export const generatePhraseId = (): string => {
  return `phrase_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const getCurrentTimestamp = (): string => {
  return new Date().toISOString();
};
