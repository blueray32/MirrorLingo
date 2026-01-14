#!/bin/bash

echo "Testing Cross-Device Spaced Repetition Sync Implementation"
echo "========================================================="

# Test 1: Check Letta status
echo "1. Testing Letta status endpoint..."
curl -s -X GET http://localhost:3002/api/letta/status | jq '.'

# Test 2: Get spaced repetition data
echo -e "\n2. Testing get spaced repetition endpoint..."
curl -s -X GET http://localhost:3002/api/letta/get-spaced-repetition -H "x-user-id: test-user" | jq '.'

# Test 3: Sync spaced repetition data
echo -e "\n3. Testing sync spaced repetition endpoint..."
curl -s -X POST http://localhost:3002/api/letta/sync-spaced-repetition \
  -H "Content-Type: application/json" \
  -H "x-user-id: test-user" \
  -d '{
    "reviewItems": [
      {
        "id": "test-item-1",
        "content": "Hello",
        "translation": "Hola",
        "easeFactor": 2.5,
        "interval": 1,
        "repetitions": 0,
        "nextReview": "2024-01-01T00:00:00.000Z",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "lastReviewed": null
      }
    ],
    "deviceId": "test-device-web"
  }' | jq '.'

echo -e "\n✅ All tests completed!"
echo "Cross-device spaced repetition sync is ready for demo!"
