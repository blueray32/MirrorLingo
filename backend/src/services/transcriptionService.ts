import { TranscribeClient, StartTranscriptionJobCommand, GetTranscriptionJobCommand } from '@aws-sdk/client-transcribe'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb'

const transcribeClient = new TranscribeClient({ region: process.env.AWS_REGION || 'us-east-1' })
const s3Client = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' })
const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' })

export interface SpeechMetrics {
  wordsPerMinute: number
  fillerWordCount: number
  fillerWordRate: number
  averagePauseLength: number
  longPauseCount: number
  repetitionCount: number
  totalDuration: number
  wordCount: number
  averageConfidence: number
}

export interface TranscriptionResult {
  transcript: string
  confidence: number
  speechMetrics: SpeechMetrics
  alternatives: Array<{
    transcript: string
    confidence: number
  }>
}

export class TranscriptionService {
  
  static async processAudio(
    audioData: string, 
    userId: string, 
    contentType: string
  ): Promise<TranscriptionResult> {
    
    const audioKey = `audio/${userId}/${Date.now()}.webm`
    const jobName = `transcription-${userId}-${Date.now()}`
    
    try {
      // 1. Upload audio to S3
      await this.uploadToS3(audioData, audioKey, contentType)
      
      // 2. Start transcription job
      const transcriptionJob = await this.startTranscription(jobName, audioKey)
      
      // 3. Wait for completion and get results
      const result = await this.waitForTranscription(jobName)
      
      // 4. Analyze speech metrics
      const speechMetrics = this.analyzeSpeechMetrics(result)
      
      // 5. Store results in DynamoDB
      await this.storeTranscriptionResult(userId, result, speechMetrics)
      
      return {
        transcript: result.transcript,
        confidence: result.confidence,
        speechMetrics,
        alternatives: result.alternatives || []
      }
      
    } catch (error) {
      console.error('Transcription processing error:', error)
      throw new Error('Failed to process audio transcription')
    }
  }
  
  private static async uploadToS3(audioData: string, key: string, contentType: string): Promise<void> {
    const buffer = Buffer.from(audioData, 'base64')
    
    const command = new PutObjectCommand({
      Bucket: process.env.AUDIO_BUCKET!,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      Metadata: {
        uploadedAt: new Date().toISOString()
      }
    })
    
    await s3Client.send(command)
  }
  
  private static async startTranscription(jobName: string, audioKey: string): Promise<any> {
    const command = new StartTranscriptionJobCommand({
      TranscriptionJobName: jobName,
      LanguageCode: 'en-US',
      Media: {
        MediaFileUri: `s3://${process.env.AUDIO_BUCKET}/${audioKey}`
      },
      OutputBucketName: process.env.AUDIO_BUCKET,
      Settings: {
        ShowSpeakerLabels: false,
        MaxAlternatives: 3,
        ShowAlternatives: true
      }
    })
    
    return await transcribeClient.send(command)
  }
  
  static async waitForTranscription(jobName: string, maxWaitTime: number = 60000): Promise<any> {
    const startTime = Date.now()
    
    while (Date.now() - startTime < maxWaitTime) {
      const command = new GetTranscriptionJobCommand({
        TranscriptionJobName: jobName
      })
      
      const response = await transcribeClient.send(command)
      const job = response.TranscriptionJob
      
      if (job?.TranscriptionJobStatus === 'COMPLETED') {
        // Fetch transcript from S3
        const transcriptUri = job.Transcript?.TranscriptFileUri
        if (transcriptUri) {
          const transcript = await this.fetchTranscriptFromS3(transcriptUri)
          return this.parseTranscriptJson(transcript)
        }
      } else if (job?.TranscriptionJobStatus === 'FAILED') {
        throw new Error(`Transcription failed: ${job.FailureReason}`)
      }
      
      // Wait 2 seconds before checking again
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
    
    throw new Error('Transcription timeout')
  }
  
  private static async fetchTranscriptFromS3(uri: string): Promise<string> {
    // Extract bucket and key from S3 URI
    const url = new URL(uri)
    const bucket = url.hostname.split('.')[0]
    const key = url.pathname.substring(1)
    
    // Fetch transcript JSON from S3
    const response = await fetch(uri)
    return await response.text()
  }
  
  private static parseTranscriptJson(transcriptJson: string): any {
    const data = JSON.parse(transcriptJson)
    const results = data.results
    
    return {
      transcript: results.transcripts[0].transcript,
      confidence: this.calculateAverageConfidence(results.items),
      alternatives: results.transcripts.slice(1).map((alt: any) => ({
        transcript: alt.transcript,
        confidence: this.calculateAverageConfidence(results.items)
      }))
    }
  }
  
  private static calculateAverageConfidence(items: any[]): number {
    const confidenceScores = items
      .filter((item: any) => item.type === 'pronunciation')
      .map((item: any) => parseFloat(item.alternatives[0].confidence))
    
    return confidenceScores.reduce((sum, conf) => sum + conf, 0) / confidenceScores.length
  }
  
  private static analyzeSpeechMetrics(transcriptionResult: any): SpeechMetrics {
    const { transcript } = transcriptionResult
    const words = transcript.split(/\s+/).filter((word: string) => word.length > 0)
    const wordCount = words.length
    
    // Estimate duration (this would be more accurate with actual timing data)
    const estimatedDuration = wordCount / 150 * 60 // Assume 150 WPM average
    
    // Analyze filler words
    const fillerWords = ['um', 'uh', 'like', 'you know', 'actually', 'basically']
    const fillerCount = words.filter((word: string) => 
      fillerWords.includes(word.toLowerCase().replace(/[.,!?]/g, ''))
    ).length
    
    // Analyze repetitions (simple word repetition detection)
    const wordFreq = new Map<string, number>()
    words.forEach((word: string) => {
      const clean = word.toLowerCase().replace(/[.,!?]/g, '')
      wordFreq.set(clean, (wordFreq.get(clean) || 0) + 1)
    })
    const repetitionCount = Array.from(wordFreq.values()).filter(count => count > 1).length
    
    return {
      wordsPerMinute: Math.round(wordCount / (estimatedDuration / 60)),
      fillerWordCount: fillerCount,
      fillerWordRate: fillerCount / wordCount,
      averagePauseLength: 0.5, // Would need timing data for accuracy
      longPauseCount: 0, // Would need timing data
      repetitionCount,
      totalDuration: estimatedDuration,
      wordCount,
      averageConfidence: transcriptionResult.confidence
    }
  }
  
  private static async storeTranscriptionResult(
    userId: string, 
    result: any, 
    speechMetrics: SpeechMetrics
  ): Promise<void> {
    const command = new PutItemCommand({
      TableName: process.env.PHRASES_TABLE!,
      Item: {
        userId: { S: userId },
        phraseId: { S: `transcription-${Date.now()}` },
        transcript: { S: result.transcript },
        confidence: { N: result.confidence.toString() },
        speechMetrics: { S: JSON.stringify(speechMetrics) },
        createdAt: { S: new Date().toISOString() },
        type: { S: 'transcription' }
      }
    })
    
    await dynamoClient.send(command)
  }
}
