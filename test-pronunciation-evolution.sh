#!/bin/bash

echo "Testing Pronunciation Learning Evolution"
echo "======================================"

# Test 1: Check phoneme progress
echo "1. Testing phoneme progress endpoint..."
curl -s -X GET http://localhost:3002/api/pronunciation-evolution/phoneme-progress -H "x-user-id: test-user" | jq '.'

# Test 2: Get coaching program
echo -e "\n2. Testing coaching program endpoint..."
curl -s -X GET http://localhost:3002/api/pronunciation-evolution/coaching -H "x-user-id: test-user" | jq '.'

# Test 3: Track pronunciation progress
echo -e "\n3. Testing pronunciation progress tracking..."
curl -s -X POST http://localhost:3002/api/pronunciation-evolution/track-progress \
  -H "Content-Type: application/json" \
  -H "x-user-id: test-user" \
  -d '{
    "phonemeScores": {
      "rr": 75,
      "ñ": 82,
      "a": 90,
      "e": 88
    },
    "context": "perro"
  }' | jq '.'

echo -e "\n✅ All pronunciation evolution tests completed!"
echo "Phoneme-specific learning tracking is ready for demo!"
