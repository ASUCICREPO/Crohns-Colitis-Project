#!/usr/bin/env bash
set -euo pipefail

if [ -z "${GITHUB_URL:-}" ]; then
  read -rp "Enter source GitHub repository URL (e.g., https://github.com/OWNER/REPO): " GITHUB_URL
fi

clean_url=${GITHUB_URL%.git}
clean_url=${clean_url%/}

if [ -z "${PROJECT_NAME:-}" ]; then
  read -rp "Enter project name [default: catholic-charities-chatbot]: " PROJECT_NAME
  PROJECT_NAME=${PROJECT_NAME:-catholic-charities-chatbot}
fi

if [ -z "${URL_FILES_PATH:-}" ]; then
  read -rp "Enter path to URL files in Backend directory [default: data-sources]: " URL_FILES_PATH
  URL_FILES_PATH=${URL_FILES_PATH:-data-sources}
fi

if [ -z "${AMPLIFY_APP_NAME:-}" ]; then
  read -rp "Enter Amplify app name [default: ${PROJECT_NAME}-frontend]: " AMPLIFY_APP_NAME
  AMPLIFY_APP_NAME=${AMPLIFY_APP_NAME:-${PROJECT_NAME}-frontend}
fi

if [ -z "${AMPLIFY_BRANCH_NAME:-}" ]; then
  read -rp "Enter Amplify branch name [default: main]: " AMPLIFY_BRANCH_NAME
  AMPLIFY_BRANCH_NAME=${AMPLIFY_BRANCH_NAME:-main}
fi

if [ -z "${AWS_REGION:-}" ]; then
  read -rp "Enter AWS region [default: us-west-2]: " AWS_REGION
  AWS_REGION=${AWS_REGION:-us-west-2}
fi

if [ -z "${ACTION:-}" ]; then
  read -rp "Enter action [deploy/destroy]: " ACTION
  ACTION=$(printf '%s' "$ACTION" | tr '[:upper:]' '[:lower:]')
fi

if [[ "$ACTION" != "deploy" && "$ACTION" != "destroy" ]]; then
  echo "Invalid action: '$ACTION'. Choose 'deploy' or 'destroy'."
  exit 1
fi

ROLE_NAME="${PROJECT_NAME}-codebuild-service-role"
echo "Checking for IAM role: $ROLE_NAME"

if aws iam get-role --role-name "$ROLE_NAME" >/dev/null 2>&1; then
  echo "✓ IAM role exists"
  ROLE_ARN=$(aws iam get-role --role-name "$ROLE_NAME" --query 'Role.Arn' --output text)
else
  echo "✱ Creating IAM role: $ROLE_NAME"
  TRUST_DOC='{
    "Version":"2012-10-17",
    "Statement":[{
      "Effect":"Allow",
      "Principal":{"Service":"codebuild.amazonaws.com"},
      "Action":"sts:AssumeRole"
    }]
  }'

  ROLE_ARN=$(aws iam create-role \
    --role-name "$ROLE_NAME" \
    --assume-role-policy-document "$TRUST_DOC" \
    --query 'Role.Arn' --output text)

  echo "Attaching policies..."
  aws iam attach-role-policy \
    --role-name "$ROLE_NAME" \
    --policy-arn arn:aws:iam::aws:policy/AdministratorAccess

  echo "Waiting for IAM role to propagate..."
  sleep 10
fi

CODEBUILD_PROJECT_NAME="${PROJECT_NAME}-deploy"
echo "Creating CodeBuild project: $CODEBUILD_PROJECT_NAME"

ENV_VARS=$(cat <<EOF
[
  {"name": "PROJECT_NAME", "value": "$PROJECT_NAME", "type": "PLAINTEXT"},
  {"name": "URL_FILES_PATH", "value": "$URL_FILES_PATH", "type": "PLAINTEXT"},
  {"name": "ACTION", "value": "$ACTION", "type": "PLAINTEXT"},
  {"name": "CDK_DEFAULT_REGION", "value": "$AWS_REGION", "type": "PLAINTEXT"},
  {"name": "AMPLIFY_APP_NAME", "value": "$AMPLIFY_APP_NAME", "type": "PLAINTEXT"},
  {"name": "AMPLIFY_BRANCH_NAME", "value": "$AMPLIFY_BRANCH_NAME", "type": "PLAINTEXT"}
]
EOF
)

ENVIRONMENT=$(cat <<EOF
{
  "type": "LINUX_CONTAINER",
  "image": "aws/codebuild/standard:7.0",
  "computeType": "BUILD_GENERAL1_MEDIUM",
  "environmentVariables": $ENV_VARS
}
EOF
)

ARTIFACTS='{"type":"NO_ARTIFACTS"}'
SOURCE=$(cat <<EOF
{
  "type":"GITHUB",
  "location":"$GITHUB_URL",
  "buildspec":"Backend/buildspec.yml"
}
EOF
)

if aws codebuild batch-get-projects --names "$CODEBUILD_PROJECT_NAME" --query 'projects[0].name' --output text 2>/dev/null | grep -q "$CODEBUILD_PROJECT_NAME"; then
  echo "Deleting existing CodeBuild project..."
  aws codebuild delete-project --name "$CODEBUILD_PROJECT_NAME"
  sleep 5
fi

aws codebuild create-project \
  --name "$CODEBUILD_PROJECT_NAME" \
  --source "$SOURCE" \
  --artifacts "$ARTIFACTS" \
  --environment "$ENVIRONMENT" \
  --service-role "$ROLE_ARN" \
  --output json \
  --no-cli-pager

if [ $? -eq 0 ]; then
  echo "✓ CodeBuild project '$CODEBUILD_PROJECT_NAME' created."
else
  echo "✗ Failed to create CodeBuild project."
  exit 1
fi

echo "Starting hybrid deployment..."
BUILD_ID=$(aws codebuild start-build \
  --project-name "$CODEBUILD_PROJECT_NAME" \
  --query 'build.id' \
  --output text)

if [ $? -eq 0 ]; then
  echo "✓ Build started with ID: $BUILD_ID"
  echo "You can monitor the build progress in the AWS Console:"
  echo "https://console.aws.amazon.com/codesuite/codebuild/projects/$CODEBUILD_PROJECT_NAME/build/$BUILD_ID"
else
  echo "✗ Failed to start build."
  exit 1
fi

echo ""
echo "=== Deployment Information ==="
echo "Project Name: $PROJECT_NAME"
echo "GitHub Repo URL: $GITHUB_URL"
echo "Amplify App Name: $AMPLIFY_APP_NAME"
echo "Amplify Branch Name: $AMPLIFY_BRANCH_NAME"
echo "Deployment Strategy: HYBRID"
echo "  - Backend: CloudFormation (CDK)"
echo "  - Amplify App: CLI (buildspec)"
echo "  - Deployment: Automated (EventBridge + Lambda)"
echo "Action: $ACTION"
echo "Build ID: $BUILD_ID"
echo ""
echo "🚀 The hybrid deployment will:"
echo "1. Deploy backend via CloudFormation"
echo "2. Create/update Amplify app via CLI with name '$AMPLIFY_APP_NAME' and branch '$AMPLIFY_BRANCH_NAME'"
echo "3. Build and upload frontend to S3"
echo "4. Automatically deploy via EventBridge trigger"
echo "5. No manual steps required!"
echo ""
echo "⏱️ Total deployment time: ~15-20 minutes"
echo "📊 Monitor progress in CodeBuild console above"

exit 0