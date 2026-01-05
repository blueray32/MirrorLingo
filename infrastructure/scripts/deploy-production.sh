#!/bin/bash

# MirrorLingo Deployment Script
# Deploys the complete application to AWS

set -e

ENVIRONMENT=${1:-dev}
REGION=${2:-us-east-1}
STACK_NAME="mirrorlingo-${ENVIRONMENT}"

echo "🚀 Deploying MirrorLingo to AWS..."
echo "Environment: $ENVIRONMENT"
echo "Region: $REGION"
echo "Stack: $STACK_NAME"

# Check AWS credentials
echo "📋 Checking AWS credentials..."
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo "❌ AWS credentials not configured. Please run 'aws configure' first."
    exit 1
fi

# Build backend
echo "🔨 Building backend..."
cd ../backend
npm run build

# Build frontend
echo "🔨 Building frontend..."
cd ../frontend
npm run build

# Deploy infrastructure
echo "☁️ Deploying AWS infrastructure..."
cd ../infrastructure

# Package and deploy with SAM
sam build
sam deploy \
    --stack-name $STACK_NAME \
    --region $REGION \
    --capabilities CAPABILITY_IAM \
    --parameter-overrides Environment=$ENVIRONMENT \
    --confirm-changeset

# Get outputs
echo "📊 Getting deployment outputs..."
API_URL=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' \
    --output text)

USER_POOL_ID=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`UserPoolId`].OutputValue' \
    --output text)

echo "✅ Deployment complete!"
echo ""
echo "🌐 API URL: $API_URL"
echo "👥 User Pool ID: $USER_POOL_ID"
echo ""
echo "📱 Next steps:"
echo "1. Update frontend/.env.local with API_URL=$API_URL"
echo "2. Deploy frontend to Vercel/Netlify"
echo "3. Test the complete application"
echo ""
echo "🎉 MirrorLingo is live!"
