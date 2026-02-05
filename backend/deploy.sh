#!/bin/bash
# Berez Backend Deployment Script for AWS (Free Tier)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
AWS_PROFILE="${AWS_PROFILE:-my-dev-profile}"
ENVIRONMENT="${1:-prod}"
REGION="${AWS_REGION:-eu-west-1}"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Berez Backend Deployment (Free Tier)${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Environment: $ENVIRONMENT"
echo "AWS Profile: $AWS_PROFILE"
echo "Region: $REGION"
echo ""

# Check prerequisites
command -v sam >/dev/null 2>&1 || { echo -e "${RED}Error: AWS SAM CLI is required but not installed.${NC}"; echo "Install with: brew install aws-sam-cli"; exit 1; }
command -v aws >/dev/null 2>&1 || { echo -e "${RED}Error: AWS CLI is required but not installed.${NC}"; exit 1; }

# Check AWS credentials
echo -e "${YELLOW}Checking AWS credentials...${NC}"
aws sts get-caller-identity --profile "$AWS_PROFILE" > /dev/null || { echo -e "${RED}Error: AWS credentials not configured for profile $AWS_PROFILE${NC}"; exit 1; }
echo -e "${GREEN}AWS credentials OK${NC}"
echo ""

# Generate JWT secret if not set
if [ -z "$JWT_SECRET_KEY" ]; then
    echo -e "${YELLOW}Generating JWT secret key...${NC}"
    JWT_SECRET_KEY=$(openssl rand -hex 32)
    echo -e "${GREEN}JWT secret generated${NC}"
fi

# Frontend URL
if [ -z "$FRONTEND_URL" ]; then
    FRONTEND_URL="https://berez.vercel.app"
    echo "Using default frontend URL: $FRONTEND_URL"
fi

# Build the application
echo ""
echo -e "${YELLOW}Building application...${NC}"
sam build --use-container --profile "$AWS_PROFILE"

# Deploy the application
echo ""
echo -e "${YELLOW}Deploying to AWS...${NC}"
sam deploy \
    --profile "$AWS_PROFILE" \
    --region "$REGION" \
    --stack-name "berez-api-${ENVIRONMENT}" \
    --capabilities CAPABILITY_IAM \
    --parameter-overrides \
        "Environment=${ENVIRONMENT}" \
        "JWTSecretKey=${JWT_SECRET_KEY}" \
        "FrontendURL=${FRONTEND_URL}" \
    --no-confirm-changeset \
    --no-fail-on-empty-changeset

# Get outputs
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Get stack outputs
API_URL=$(aws cloudformation describe-stacks \
    --profile "$AWS_PROFILE" \
    --region "$REGION" \
    --stack-name "berez-api-${ENVIRONMENT}" \
    --query 'Stacks[0].Outputs[?OutputKey==`ApiEndpoint`].OutputValue' \
    --output text)

S3_BUCKET=$(aws cloudformation describe-stacks \
    --profile "$AWS_PROFILE" \
    --region "$REGION" \
    --stack-name "berez-api-${ENVIRONMENT}" \
    --query 'Stacks[0].Outputs[?OutputKey==`PhotosBucketName`].OutputValue' \
    --output text)

echo -e "${GREEN}API Endpoint:${NC} $API_URL"
echo -e "${GREEN}Photos Bucket:${NC} $S3_BUCKET"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Update your frontend .env with:"
echo "   NEXT_PUBLIC_API_URL=$API_URL"
echo ""
echo "2. Initialize the database by calling:"
echo "   curl $API_URL/init-db"
echo ""
echo "3. Populate fountain data:"
echo "   curl $API_URL/populate"
echo ""
echo -e "${GREEN}Done!${NC}"
