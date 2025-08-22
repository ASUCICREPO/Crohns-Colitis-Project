#!/bin/bash

set -euo pipefail

echo "🚀 Starting Deployment..."

# Get user inputs
read -p "Enter action [deploy/destroy]: " ACTION
ACTION=$(echo "$ACTION" | tr '[:upper:]' '[:lower:]')

if [[ "$ACTION" != "deploy" && "$ACTION" != "destroy" ]]; then
    echo "Invalid action. Choose 'deploy' or 'destroy'."
    exit 1
fi

if [ "$ACTION" = "deploy" ]; then
    read -p "Enter source email (verified in SES): " SOURCE_EMAIL
    read -p "Enter destination email: " DESTINATION_EMAIL
    read -p "Enter AWS region [us-east-1]: " AWS_REGION
    AWS_REGION=${AWS_REGION:-us-east-1}
fi

if [ "$ACTION" = "destroy" ]; then
    echo "🗑️ Destroying Infrastructure..."
    cd Backend
    cdk destroy --force || echo "Stack may not exist"
    echo "✅ Destruction complete"
    exit 0
fi

echo "📦 Deploying Backend..."
cd Backend
npm install
npm run build
cdk bootstrap
cdk deploy --require-approval never --outputs-file ../outputs.json \
  --parameters sourceEmail=$SOURCE_EMAIL \
  --parameters destinationEmail=$DESTINATION_EMAIL

echo "⚛️ Configuring Frontend..."
cd ../Frontend

# Extract API endpoints
CHAT_API_URL=$(cat ../outputs.json | jq -r '.CrohnsColitisQBusinessStack.ChatEndpoint')
EMAIL_API_URL=$(cat ../outputs.json | jq -r '.CrohnsColitisQBusinessStack.EmailEndpoint')
CONVERSATION_API_URL=$(cat ../outputs.json | jq -r '.CrohnsColitisQBusinessStack.ConversationEndpoint')
TRANSLATE_API_URL=$(cat ../outputs.json | jq -r '.CrohnsColitisQBusinessStack.TranslateEndpoint')
QBUSINESS_APP_ID=$(cat ../outputs.json | jq -r '.CrohnsColitisQBusinessStack.QBusinessApplicationId')

# Create .env file
cat > .env << EOF
REACT_APP_CHAT_API_URL=$CHAT_API_URL
REACT_APP_EMAIL_API_URL=$EMAIL_API_URL
REACT_APP_CONVERSATION_API_URL=$CONVERSATION_API_URL
REACT_APP_TRANSLATE_API_URL=$TRANSLATE_API_URL
REACT_APP_QBUSINESS_APPLICATION_ID=$QBUSINESS_APP_ID
REACT_APP_AWS_REGION=$AWS_REGION
EOF

echo "🔨 Building Frontend..."
npm install
npm run build

echo "🌐 Deploying Frontend to Amplify..."

# Create Amplify app
APP_NAME="crohns-colitis-app"
aws amplify create-app --name $APP_NAME --repository https://github.com/ASUCICREPO/Crohns-Colitis-Project.git > amplify-app.json
APP_ID=$(cat amplify-app.json | jq -r '.app.appId')

# Create branch
aws amplify create-branch --app-id $APP_ID --branch-name main

# Set environment variables in Amplify
aws amplify put-backend-environment --app-id $APP_ID --environment-name staging
aws amplify update-app --app-id $APP_ID --environment-variables \
  REACT_APP_CHAT_API_URL=$CHAT_API_URL,REACT_APP_EMAIL_API_URL=$EMAIL_API_URL,REACT_APP_CONVERSATION_API_URL=$CONVERSATION_API_URL,REACT_APP_TRANSLATE_API_URL=$TRANSLATE_API_URL,REACT_APP_QBUSINESS_APPLICATION_ID=$QBUSINESS_APP_ID,REACT_APP_AWS_REGION=$AWS_REGION

# Start deployment
aws amplify start-job --app-id $APP_ID --branch-name main --job-type RELEASE

# Get Amplify URL
AMPLIFY_URL="https://main.$APP_ID.amplifyapp.com"

echo "✅ Deployment Complete!"
echo "Frontend URL: $AMPLIFY_URL"
echo "Chat API: $CHAT_API_URL"