#!/bin/bash

# MirrorLingo Deployment Script
# Usage: ./deploy.sh [environment] [region]

set -e

# Configuration
ENVIRONMENT=${1:-dev}
REGION=${2:-us-east-1}
STACK_NAME="MirrorLingo-${ENVIRONMENT}"

echo "🚀 Deploying MirrorLingo to ${ENVIRONMENT} environment in ${REGION}"

# Check if SAM CLI is installed
if ! command -v sam &> /dev/null; then
    echo "❌ SAM CLI is not installed. Please install it first:"
    echo "   https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html"
    exit 1
fi

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS CLI is not configured. Please run 'aws configure' first."
    exit 1
fi

# Build backend
echo "📦 Building backend..."
cd ../backend
npm run build
cd ../infrastructure

# Validate SAM template
echo "✅ Validating SAM template..."
sam validate --template template.yaml

# Build SAM application
echo "🔨 Building SAM application..."
sam build --template template.yaml

# Deploy with SAM
echo "🚀 Deploying to AWS..."
sam deploy \
  --template-file .aws-sam/build/template.yaml \
  --stack-name ${STACK_NAME} \
  --parameter-overrides Environment=${ENVIRONMENT} \
  --capabilities CAPABILITY_IAM \
  --region ${REGION} \
  --confirm-changeset \
  --resolve-s3

# Get outputs
echo "📋 Getting deployment outputs..."
API_URL=$(aws cloudformation describe-stacks \
  --stack-name ${STACK_NAME} \
  --region ${REGION} \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' \
  --output text)

USER_POOL_ID=$(aws cloudformation describe-stacks \
  --stack-name ${STACK_NAME} \
  --region ${REGION} \
  --query 'Stacks[0].Outputs[?OutputKey==`UserPoolId`].OutputValue' \
  --output text)

USER_POOL_CLIENT_ID=$(aws cloudformation describe-stacks \
  --stack-name ${STACK_NAME} \
  --region ${REGION} \
  --query 'Stacks[0].Outputs[?OutputKey==`UserPoolClientId`].OutputValue' \
  --output text)

# Create environment file for frontend
echo "📝 Creating frontend environment file..."
cat > ../frontend/.env.local << EOF
NEXT_PUBLIC_API_URL=${API_URL}
NEXT_PUBLIC_USER_POOL_ID=${USER_POOL_ID}
NEXT_PUBLIC_USER_POOL_CLIENT_ID=${USER_POOL_CLIENT_ID}
NEXT_PUBLIC_REGION=${REGION}
EOF

echo ""
echo "✅ Deployment completed successfully!"
echo ""
echo "📊 Deployment Information:"
echo "   Environment: ${ENVIRONMENT}"
echo "   Region: ${REGION}"
echo "   Stack Name: ${STACK_NAME}"
echo "   API URL: ${API_URL}"
echo "   User Pool ID: ${USER_POOL_ID}"
echo "   User Pool Client ID: ${USER_POOL_CLIENT_ID}"
echo ""
echo "🌐 Frontend environment file created at: ../frontend/.env.local"
echo ""
echo "🚀 Next steps:"
echo "   1. cd ../frontend"
echo "   2. npm run dev"
echo "   3. Open http://localhost:3000"
echo ""
echo "🧪 Test the API:"
echo "   curl ${API_URL}/phrases -H \"x-user-id: test-user-123\""
