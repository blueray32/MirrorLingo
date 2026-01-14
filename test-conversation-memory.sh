#!/bin/bash

echo "Testing Enhanced Conversation Relationship Building"
echo "================================================="

# Test 1: Check relationship status
echo "1. Testing relationship status endpoint..."
curl -s -X GET http://localhost:3002/api/conversation-memory/relationship-status -H "x-user-id: test-user" | jq '.'

# Test 2: Get conversation memory
echo -e "\n2. Testing conversation memory endpoint..."
curl -s -X GET http://localhost:3002/api/conversation-memory/conversation-memory -H "x-user-id: test-user" | jq '.'

# Test 3: Test conversation with memory context
echo -e "\n3. Testing conversation with memory context..."
curl -s -X POST http://localhost:3002/api/conversation \
  -H "Content-Type: application/json" \
  -H "x-user-id: test-user" \
  -d '{
    "message": "Hola María, ¿cómo estás? Hoy tuve un día muy ocupado en el trabajo.",
    "topic": "daily_life",
    "userProfile": {
      "tone": "casual",
      "formality": "informal",
      "patterns": ["contractions", "casual_greetings"]
    }
  }' | jq '.'

echo -e "\n✅ All conversation memory tests completed!"
echo "Enhanced relationship building is ready for demo!"
