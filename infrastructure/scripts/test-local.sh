#!/bin/bash

# Local Development Test Script
# Tests the voice recording workflow without AWS deployment

echo "🎤 MirrorLingo Voice Recording Test"
echo "=================================="

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    exit 1
fi

# Test frontend build
echo "📦 Testing frontend build..."
cd ../frontend
if npm run build; then
    echo "✅ Frontend build successful"
else
    echo "❌ Frontend build failed"
    exit 1
fi

# Test backend compilation
echo "📦 Testing backend compilation..."
cd ../backend
if npm run type-check; then
    echo "✅ Backend TypeScript compilation successful"
else
    echo "❌ Backend compilation failed"
    exit 1
fi

# Create mock API endpoints for local testing
echo "🔧 Setting up local test environment..."
cd ../frontend

# Create local API mock
cat > pages/api/audio.ts << 'EOF'
import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // Mock audio processing
    setTimeout(() => {
      res.status(202).json({
        success: true,
        message: 'Audio processing started (mock)',
        jobId: `mock-job-${Date.now()}`,
        status: 'processing'
      });
    }, 1000);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
EOF

cat > pages/api/phrases.ts << 'EOF'
import { NextApiRequest, NextApiResponse } from 'next';

const mockAnalysis = {
  tone: 'casual',
  formality: 'informal',
  patterns: [
    {
      type: 'contractions',
      description: 'Uses contractions frequently',
      examples: ["I'm", "you're", "can't"],
      frequency: 0.8
    },
    {
      type: 'filler_words',
      description: 'Occasional filler words',
      examples: ['um', 'like', 'you know'],
      frequency: 0.3
    }
  ],
  confidence: 0.85,
  analysisDate: new Date().toISOString()
};

const mockProfile = {
  userId: 'demo-user',
  overallTone: 'casual',
  overallFormality: 'informal',
  commonPatterns: mockAnalysis.patterns,
  preferredIntents: ['casual', 'work'],
  analysisCount: 1,
  lastUpdated: new Date().toISOString()
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { phrases } = req.body;
    
    const mockPhrases = phrases.map((phrase: string, index: number) => ({
      userId: 'demo-user',
      phraseId: `phrase-${index}`,
      englishText: phrase,
      intent: 'casual',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      analysis: mockAnalysis
    }));

    res.status(200).json({
      success: true,
      data: {
        phrases: mockPhrases,
        profile: mockProfile
      }
    });
  } else if (req.method === 'GET') {
    res.status(200).json({
      success: true,
      data: {
        phrases: [],
        profile: mockProfile
      }
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
EOF

echo "✅ Local API mocks created"
echo ""
echo "🚀 Starting development server..."
echo "   Open http://localhost:3000 to test voice recording"
echo "   The app will use mock data for demonstration"
echo ""

# Start development server
npm run dev
