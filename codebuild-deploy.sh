#!/usr/bin/env bash
set -euo pipefail

# Crohn's Colitis Q Business - Automated Deployment Script
# This script sets up and triggers a CodeBuild project for deployment

echo "🚀 Starting Crohn's Colitis Q Business Deployment..."

# Get GitHub repository URL
if [ -z "${GITHUB_URL:-}" ]; then
  GITHUB_URL=$(git config --get remote.origin.url 2>/dev/null || echo "")
  if [ -z "$GITHUB_URL" ]; then
    read -rp "Enter GitHub repository URL [default: https://github.com/ASUCICREPO/Crohns-Colitis-Project.git]: " GITHUB_URL
    GITHUB_URL=${GITHUB_URL:-https://github.com/ASUCICREPO/Crohns-Colitis-Project.git}
  else
    echo "Detected GitHub URL: $GITHUB_URL"
  fi
fi

# Clean up the GitHub URL
clean_url=${GITHUB_URL%.git}
clean_url=${clean_url%/}
GITHUB_URL=$clean_url

# Get project parameters
if [ -z "${PROJECT_NAME:-}" ]; then
  read -rp "Enter project name [default: crohns-colitis]: " PROJECT_NAME
  PROJECT_NAME=${PROJECT_NAME:-crohns-colitis}
fi

# Check if CloudFormation stack already exists
echo "Checking for existing deployment..."
STACK_EXISTS=false
if aws cloudformation describe-stacks --stack-name "CrohnsColitisQBusinessStack" --region us-west-2 >/dev/null 2>&1; then
  STACK_EXISTS=true
  AWS_REGION="us-west-2"
  echo "✅ Found existing deployment for project: $PROJECT_NAME"
  echo "📋 Skipping configuration - using existing settings"
else
  echo "🆕 New deployment detected"
  # Always prompt for region (ignore environment variable)
  echo "Available regions:"
  echo "  1) us-east-1 (N. Virginia)"
  echo "  2) us-west-2 (Oregon)"
  echo "  3) eu-west-1 (Ireland)"
  echo "  4) ap-southeast-1 (Singapore)"
  read -rp "Enter AWS region [default: us-west-2]: " USER_AWS_REGION
  AWS_REGION=${USER_AWS_REGION:-us-west-2}
  echo "Selected region: $AWS_REGION"
fi

if [ -z "${AWS_ACCOUNT_ID:-}" ]; then
  AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query "Account" --output text 2>/dev/null || echo "")
  if [ -z "$AWS_ACCOUNT_ID" ]; then
    read -rp "Enter AWS account ID: " AWS_ACCOUNT_ID
  else
    echo "Detected AWS Account ID: $AWS_ACCOUNT_ID"
  fi
fi

if [ -z "${ACTION:-}" ]; then
  read -rp "Enter action [deploy/destroy]: " ACTION
  ACTION=$(printf '%s' "$ACTION" | tr '[:upper:]' '[:lower:]')
fi

if [[ "$ACTION" != "deploy" && "$ACTION" != "destroy" ]]; then
  echo "Invalid action: '$ACTION'. Choose 'deploy' or 'destroy'."
  exit 1
fi

if [ "$ACTION" = "deploy" ]; then
  if [ "$STACK_EXISTS" = false ]; then
    if [ -z "${SOURCE_EMAIL:-}" ]; then
      read -rp "Enter source email (verified in SES): " SOURCE_EMAIL
    fi
    if [ -z "${DESTINATION_EMAIL:-}" ]; then
      read -rp "Enter destination email: " DESTINATION_EMAIL
    fi
  else
    # Get existing parameters from stack
    SOURCE_EMAIL=$(aws cloudformation describe-stacks --stack-name "CrohnsColitisQBusinessStack" --query 'Stacks[0].Parameters[?ParameterKey==`sourceEmail`].ParameterValue' --output text 2>/dev/null || echo "admin@example.com")
    DESTINATION_EMAIL=$(aws cloudformation describe-stacks --stack-name "CrohnsColitisQBusinessStack" --query 'Stacks[0].Parameters[?ParameterKey==`destinationEmail`].ParameterValue' --output text 2>/dev/null || echo "support@example.com")
    echo "📧 Using existing emails: $SOURCE_EMAIL → $DESTINATION_EMAIL"
  fi
fi

# Create IAM role for CodeBuild
ROLE_NAME="${PROJECT_NAME}-codebuild-service-role"
POLICY_NAME="${PROJECT_NAME}-deployment-policy"
echo "Checking for IAM role: $ROLE_NAME"

# Check if role exists
set +e  # Temporarily disable exit on error
aws iam get-role --role-name "$ROLE_NAME" >/dev/null 2>&1
ROLE_CHECK_RESULT=$?
if [ $ROLE_CHECK_RESULT -eq 0 ]; then
  ROLE_EXISTS=true
  echo "DEBUG: Role exists, setting ROLE_EXISTS=true"
else
  ROLE_EXISTS=false
  echo "DEBUG: Role does not exist, setting ROLE_EXISTS=false"
fi
set -e  # Re-enable exit on error
echo "DEBUG: ROLE_EXISTS=$ROLE_EXISTS"

# Create custom policy document with specific permissions
POLICY_DOC=$(cat <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "CloudFormationFull",
      "Effect": "Allow",
      "Action": [
        "cloudformation:*"
      ],
      "Resource": "*"
    },
    {
      "Sid": "APIGatewayCRUD",
      "Effect": "Allow",
      "Action": [
        "apigateway:*"
      ],
      "Resource": "*"
    },
    {
      "Sid": "LambdaFunctionAccess",
      "Effect": "Allow",
      "Action": [
        "lambda:*"
      ],
      "Resource": "*"
    },
    {
      "Sid": "IAMRoleCreationPass",
      "Effect": "Allow",
      "Action": [
        "iam:*"
      ],
      "Resource": "*"
    },
    {
      "Sid": "AmplifyAppDeployment",
      "Effect": "Allow",
      "Action": [
        "amplify:*"
      ],
      "Resource": "*"
    },
    {
      "Sid": "S3ArtifactsAccess",
      "Effect": "Allow",
      "Action": [
        "s3:*"
      ],
      "Resource": "*"
    },
    {
      "Sid": "CodeBuildAccess",
      "Effect": "Allow",
      "Action": [
        "codebuild:*",
        "logs:*"
      ],
      "Resource": "*"
    },
    {
      "Sid": "QBusinessAccess",
      "Effect": "Allow",
      "Action": [
        "qbusiness:*"
      ],
      "Resource": "*"
    },
    {
      "Sid": "SESAccess",
      "Effect": "Allow",
      "Action": [
        "ses:*"
      ],
      "Resource": "*"
    },
    {
      "Sid": "DynamoDBAccess",
      "Effect": "Allow",
      "Action": [
        "dynamodb:*"
      ],
      "Resource": "*"
    },
    {
      "Sid": "TranslateAccess",
      "Effect": "Allow",
      "Action": [
        "translate:*"
      ],
      "Resource": "*"
    },
    {
      "Sid": "CDKAssumeRoleAccess",
      "Effect": "Allow",
      "Action": [
        "sts:AssumeRole"
      ],
      "Resource": "arn:aws:iam::*:role/cdk-*"
    },
    {
      "Sid": "ECRAccess",
      "Effect": "Allow",
      "Action": [
        "ecr:*"
      ],
      "Resource": "*"
    },
    {
      "Sid": "SSMBootstrapAccess",
      "Effect": "Allow",
      "Action": [
        "ssm:PutParameter",
        "ssm:GetParameter",
        "ssm:DeleteParameter"
      ],
      "Resource": "*"
    }
  ]
}
EOF
)

if [ "$ROLE_EXISTS" = true ]; then
  echo "✓ IAM role exists: $ROLE_NAME"
  ROLE_ARN=$(aws iam get-role --role-name "$ROLE_NAME" --query 'Role.Arn' --output text)
  
  echo "Updating IAM policy with ECR and SSM permissions..."
  aws iam put-role-policy \
    --role-name "$ROLE_NAME" \
    --policy-name "$POLICY_NAME" \
    --policy-document "$POLICY_DOC" \
    --output text
  
  echo "Waiting for policy update to propagate..."
  sleep 15
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

  aws iam create-role \
    --role-name "$ROLE_NAME" \
    --assume-role-policy-document "$TRUST_DOC" || {
    echo "Role already exists, continuing..."
    ROLE_ARN=$(aws iam get-role --role-name "$ROLE_NAME" --query 'Role.Arn' --output text)
  }
  
  if [ -z "${ROLE_ARN:-}" ]; then
    ROLE_ARN=$(aws iam get-role --role-name "$ROLE_NAME" --query 'Role.Arn' --output text)
  fi

  echo "Attaching custom policy..."
  aws iam put-role-policy \
    --role-name "$ROLE_NAME" \
    --policy-name "$POLICY_NAME" \
    --policy-document "$POLICY_DOC" \
    --output text

  echo "Waiting for IAM role to propagate..."
  sleep 10
fi

# ----------------------------
# Add SSM permissions for CDK bootstrap
# ----------------------------
SSM_POLICY_NAME="CDK-SSM-Access"
SSM_POLICY_DOC=$(cat <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ssm:GetParameter",
        "ssm:GetParameters"
      ],
      "Resource": "arn:aws:ssm:${AWS_REGION}:${AWS_ACCOUNT_ID}:parameter/cdk-bootstrap/hnb659fds/version"
    }
  ]
}
EOF
)

# Attach or update inline policy
if aws iam get-role-policy --role-name "$ROLE_NAME" --policy-name "$SSM_POLICY_NAME" >/dev/null 2>&1; then
  echo "Updating existing SSM inline policy..."
else
  echo "Creating new SSM inline policy..."
fi

aws iam put-role-policy \
  --role-name "$ROLE_NAME" \
  --policy-name "$SSM_POLICY_NAME" \
  --policy-document "$SSM_POLICY_DOC" \
  --output text

echo "Waiting for IAM permissions to propagate..."
sleep 10

# Create CodeBuild project
CODEBUILD_PROJECT_NAME="${PROJECT_NAME}-deploy"
echo "Creating CodeBuild project: $CODEBUILD_PROJECT_NAME"

# Check for existing Amplify app
echo "Checking for existing Amplify app..."
EXISTING_AMPLIFY_APP=$(aws amplify list-apps --query "apps[?name=='${PROJECT_NAME}-app'].appId" --output text 2>/dev/null || echo "")

if [ ! -z "$EXISTING_AMPLIFY_APP" ] && [ "$EXISTING_AMPLIFY_APP" != "None" ]; then
  echo "Found existing Amplify app: $EXISTING_AMPLIFY_APP"
  AMPLIFY_APP_ID=$EXISTING_AMPLIFY_APP
else
  echo "No existing Amplify app found, will create new one"
  AMPLIFY_APP_ID=""
fi

ENV_VARS=$(cat <<EOF
[
  {"name": "AWS_REGION", "value": "$AWS_REGION", "type": "PLAINTEXT"},
  {"name": "ACTION", "value": "$ACTION", "type": "PLAINTEXT"},
  {"name": "SOURCE_EMAIL", "value": "${SOURCE_EMAIL:-admin@example.com}", "type": "PLAINTEXT"},
  {"name": "DESTINATION_EMAIL", "value": "${DESTINATION_EMAIL:-support@example.com}", "type": "PLAINTEXT"},
  {"name": "AMPLIFY_APP_NAME", "value": "${PROJECT_NAME}-app", "type": "PLAINTEXT"},
  {"name": "AMPLIFY_APP_ID", "value": "${AMPLIFY_APP_ID}", "type": "PLAINTEXT"},
  {"name": "AMPLIFY_BRANCH_NAME", "value": "main", "type": "PLAINTEXT"},
  {"name": "GITHUB_URL", "value": "${GITHUB_URL}", "type": "PLAINTEXT"}
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

# For public repos, bypass CodeConnections and just clone manually in buildspec
BUILDSPEC_CONTENT=$(cat buildspec.yml | jq -Rs .)
SOURCE=$(cat <<EOF
{
  "type": "NO_SOURCE",
  "buildspec": $BUILDSPEC_CONTENT
}
EOF
)

# Delete existing project if it exists
if aws codebuild batch-get-projects --names "$CODEBUILD_PROJECT_NAME" --query 'projects[0].name' --output text 2>/dev/null | grep -q "$CODEBUILD_PROJECT_NAME"; then
  echo "Deleting existing CodeBuild project..."
  aws codebuild delete-project --name "$CODEBUILD_PROJECT_NAME" --output text
  sleep 5
fi

# Create new CodeBuild project
echo "Creating new CodeBuild project..."
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

echo "Starting deployment build..."
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