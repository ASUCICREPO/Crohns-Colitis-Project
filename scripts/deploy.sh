#!/bin/bash

set -euo pipefail

echo "🚀 Starting Crohns Colitis Application Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get AWS account ID
AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)

# Project configuration
if [ -z "${PROJECT_NAME:-}" ]; then
    read -rp "Enter project name [default: crohns-colitis]: " PROJECT_NAME
    PROJECT_NAME=${PROJECT_NAME:-crohns-colitis}
fi

if [ -z "${AWS_REGION:-}" ]; then
    read -rp "Enter AWS region [default: us-west-2]: " AWS_REGION
    AWS_REGION=${AWS_REGION:-us-west-2}
fi

if [ -z "${GITHUB_URL:-}" ]; then
    read -rp "Enter source GitHub repository URL (optional): " GITHUB_URL
fi

if [ -z "${FRONTEND_BUCKET_NAME:-}" ]; then
    read -rp "Enter frontend bucket name [default: ${PROJECT_NAME}-frontend-${AWS_ACCOUNT}]: " FRONTEND_BUCKET_NAME
    FRONTEND_BUCKET_NAME=${FRONTEND_BUCKET_NAME:-${PROJECT_NAME}-frontend-${AWS_ACCOUNT}}
fi

if [ -z "${ACTION:-}" ]; then
    read -rp "Enter action [deploy/destroy]: " ACTION
    ACTION=$(printf '%s' "$ACTION" | tr '[:upper:]' '[:lower:]')
fi

if [[ "$ACTION" != "deploy" && "$ACTION" != "destroy" ]]; then
    echo "Invalid action: '$ACTION'. Choose 'deploy' or 'destroy'."
    exit 1
fi

# Email configuration (only for deploy)
if [ "$ACTION" = "deploy" ]; then
    echo -e "${YELLOW}📧 Email Configuration${NC}"
    echo "This application sends follow-up emails via AWS SES."
    echo ""
    
    if [ -z "${SOURCE_EMAIL:-}" ]; then
        read -rp "Enter source email address (must be verified in SES): " SOURCE_EMAIL
    fi
    
    if [ -z "${DESTINATION_EMAIL:-}" ]; then
        read -rp "Enter destination email address (where follow-ups are sent): " DESTINATION_EMAIL
    fi
    
    echo ""
    echo "Configuration Summary:"
    echo "  Project Name: $PROJECT_NAME"
    echo "  AWS Region: $AWS_REGION"
    echo "  Source Email: $SOURCE_EMAIL"
    echo "  Destination Email: $DESTINATION_EMAIL"
    echo "  Frontend Bucket: $FRONTEND_BUCKET_NAME"
    echo ""
    read -rp "Continue with deployment? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Deployment cancelled."
        exit 1
    fi
fi

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"
command -v node >/dev/null 2>&1 || { echo -e "${RED}Node.js is required but not installed.${NC}" >&2; exit 1; }
command -v npm >/dev/null 2>&1 || { echo -e "${RED}npm is required but not installed.${NC}" >&2; exit 1; }
command -v aws >/dev/null 2>&1 || { echo -e "${RED}AWS CLI is required but not installed.${NC}" >&2; exit 1; }
command -v jq >/dev/null 2>&1 || { echo -e "${RED}jq is required but not installed.${NC}" >&2; exit 1; }

# Install CDK if not present
if ! command -v cdk &> /dev/null; then
    echo -e "${YELLOW}Installing AWS CDK...${NC}"
    npm install -g aws-cdk@2.161.1
fi

if [ "$ACTION" = "destroy" ]; then
    echo -e "${RED}🗑️  Destroying Infrastructure...${NC}"
    cd backend
    cdk destroy --force || echo "Stack may not exist"
    
    # Delete S3 bucket if exists
    aws s3 rm s3://$FRONTEND_BUCKET_NAME --recursive || true
    aws s3api delete-bucket --bucket $FRONTEND_BUCKET_NAME || true
    
    echo -e "${GREEN}✅ Destruction complete${NC}"
    exit 0
fi

# Deploy Backend
echo -e "${GREEN}📦 Deploying Backend Infrastructure...${NC}"
cd backend

# Install dependencies
echo "Installing backend dependencies..."
npm install

# Build TypeScript
echo "Building backend..."
npm run build

# Bootstrap CDK if needed
echo "Bootstrapping CDK..."
cdk bootstrap || true

# Deploy CDK stack with email parameters
echo "Deploying CDK stack..."
cdk deploy --require-approval never --outputs-file ../outputs.json \
  --parameters sourceEmail=$SOURCE_EMAIL \
  --parameters destinationEmail=$DESTINATION_EMAIL

# Extract API endpoints
echo -e "${GREEN}🔗 Extracting API endpoints...${NC}"
cd ..

if [ ! -f outputs.json ]; then
    echo -e "${RED}Error: outputs.json not found${NC}"
    exit 1
fi

CHAT_API_URL=$(cat outputs.json | jq -r '.CrohnsColitisQBusinessStack.ChatEndpoint // empty')
EMAIL_API_URL=$(cat outputs.json | jq -r '.CrohnsColitisQBusinessStack.EmailEndpoint // empty')
CONVERSATION_API_URL=$(cat outputs.json | jq -r '.CrohnsColitisQBusinessStack.ConversationEndpoint // empty')
TRANSLATE_API_URL=$(cat outputs.json | jq -r '.CrohnsColitisQBusinessStack.TranslateEndpoint // empty')
QBUSINESS_APP_ID=$(cat outputs.json | jq -r '.CrohnsColitisQBusinessStack.QBusinessApplicationId // empty')

echo "API Endpoints extracted:"
echo "  Chat API: $CHAT_API_URL"
echo "  Email API: $EMAIL_API_URL"
echo "  Conversation API: $CONVERSATION_API_URL"
echo "  Translate API: $TRANSLATE_API_URL"
echo "  Q Business App ID: $QBUSINESS_APP_ID"

# Configure Frontend
echo -e "${GREEN}⚛️  Configuring Frontend...${NC}"
cd widget

# Create production environment file
cat > .env << EOF
REACT_APP_CHAT_API_URL=$CHAT_API_URL
REACT_APP_EMAIL_API_URL=$EMAIL_API_URL
REACT_APP_CONVERSATION_API_URL=$CONVERSATION_API_URL
REACT_APP_TRANSLATE_API_URL=$TRANSLATE_API_URL
REACT_APP_QBUSINESS_APPLICATION_ID=$QBUSINESS_APP_ID
REACT_APP_AWS_REGION=us-west-2
EOF

echo "Frontend environment configured"

# Install frontend dependencies
echo "Installing frontend dependencies..."
npm install

# Build frontend
echo "Building frontend..."
npm run build

# Deploy to Amplify (if AMPLIFY_APP_ID is set)
if [ ! -z "$AMPLIFY_APP_ID" ]; then
    echo -e "${GREEN}🌐 Deploying to AWS Amplify...${NC}"
    
    # Create deployment package
    cd build
    zip -r ../amplify-deployment.zip .
    cd ..
    
    # Upload to S3 and deploy via Amplify
    aws amplify start-deployment \
        --app-id $AMPLIFY_APP_ID \
        --branch-name main \
        --source-url amplify-deployment.zip || echo "Manual Amplify deployment required"
        
    echo -e "${GREEN}✅ Amplify deployment initiated${NC}"
else
    echo -e "${YELLOW}⚠️  AMPLIFY_APP_ID not set. Skipping Amplify deployment.${NC}"
    echo "Frontend build available in: widget/build/"
fi

cd ..

# Summary
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo ""
echo "📋 Deployment Summary:"
echo "  Backend Stack: CrohnsColitisQBusinessStack"
echo "  Chat API: $CHAT_API_URL"
echo "  Frontend Build: frontend/build/"
echo ""
echo "🔧 Next Steps:"
echo "  1. Test the chat API endpoints"
echo "  2. Deploy frontend to your hosting platform"
echo "  3. Configure domain and SSL if needed"
echo ""

# Save deployment info
cat > deployment-summary.txt << EOF
Deployment completed at: $(date)
Chat API URL: $CHAT_API_URL
Email API URL: $EMAIL_API_URL
Conversation API URL: $CONVERSATION_API_URL
Translate API URL: $TRANSLATE_API_URL
Q Business Application ID: $QBUSINESS_APP_ID
Frontend Build Location: widget/build/
EOF

echo -e "${GREEN}📄 Deployment summary saved to deployment-summary.txt${NC}"