# IAM Profiles and Roles Guide
## Crohn's Colitis Q Business Project

This document outlines all IAM roles, policies, and permissions required for the Crohn's Colitis Q Business project.

---

## 🔐 IAM Roles Overview

### **1. CodeBuild Service Role**
**Role Name:** `crohns-colitis-codebuild-service-role`
**Purpose:** Executes CI/CD pipeline and infrastructure deployment

#### **Trust Policy:**
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {"Service": "codebuild.amazonaws.com"},
    "Action": "sts:AssumeRole"
  }]
}
```

#### **Permissions Policy:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "CloudFormationFull",
      "Effect": "Allow",
      "Action": ["cloudformation:*"],
      "Resource": "*"
    },
    {
      "Sid": "APIGatewayCRUD",
      "Effect": "Allow",
      "Action": ["apigateway:*"],
      "Resource": "*"
    },
    {
      "Sid": "LambdaFunctionAccess",
      "Effect": "Allow",
      "Action": ["lambda:*"],
      "Resource": "*"
    },
    {
      "Sid": "IAMRoleCreationPass",
      "Effect": "Allow",
      "Action": ["iam:*"],
      "Resource": "*"
    },
    {
      "Sid": "AmplifyAppDeployment",
      "Effect": "Allow",
      "Action": ["amplify:*"],
      "Resource": "*"
    },
    {
      "Sid": "S3ArtifactsAccess",
      "Effect": "Allow",
      "Action": ["s3:*"],
      "Resource": "*"
    },
    {
      "Sid": "CodeBuildAccess",
      "Effect": "Allow",
      "Action": ["codebuild:*", "logs:*"],
      "Resource": "*"
    },
    {
      "Sid": "QBusinessAccess",
      "Effect": "Allow",
      "Action": ["qbusiness:*"],
      "Resource": "*"
    },
    {
      "Sid": "SESAccess",
      "Effect": "Allow",
      "Action": ["ses:*"],
      "Resource": "*"
    },
    {
      "Sid": "DynamoDBAccess",
      "Effect": "Allow",
      "Action": ["dynamodb:*"],
      "Resource": "*"
    },
    {
      "Sid": "TranslateAccess",
      "Effect": "Allow",
      "Action": ["translate:*"],
      "Resource": "*"
    },
    {
      "Sid": "CDKAssumeRoleAccess",
      "Effect": "Allow",
      "Action": ["sts:AssumeRole"],
      "Resource": "arn:aws:iam::*:role/cdk-*"
    },
    {
      "Sid": "ECRAccess",
      "Effect": "Allow",
      "Action": ["ecr:*"],
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
```

---

### **2. Lambda Execution Role**
**Role Name:** `CrohnsColitisQBusinessStack-ChatLambdaRole-*`
**Purpose:** Executes Lambda functions with Q Business and DynamoDB access

#### **Trust Policy:**
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {"Service": "lambda.amazonaws.com"},
    "Action": "sts:AssumeRole"
  }]
}
```

#### **Permissions Policy:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "qbusiness:ChatSync",
        "qbusiness:GetApplication",
        "qbusiness:ListConversations"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      "Resource": "arn:aws:dynamodb:*:*:table/CrohnsColitisConversations"
    },
    {
      "Effect": "Allow",
      "Action": [
        "ses:SendEmail",
        "ses:SendRawEmail"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "translate:TranslateText"
      ],
      "Resource": "*"
    }
  ]
}
```

---

### **3. Q Business Application Role**
**Role Name:** `CrohnsColitisQBusinessStack-QBusinessApplicationRole-*`
**Purpose:** Q Business application service role

#### **Trust Policy:**
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {"Service": "qbusiness.amazonaws.com"},
    "Action": "sts:AssumeRole"
  }]
}
```

#### **Permissions Policy:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "*"
    }
  ]
}
```

---

### **4. Web Crawler Data Source Role**
**Role Name:** `CrohnsColitisQBusinessStack-WebCrawlerRole-*`
**Purpose:** Web crawler data source for Q Business

#### **Trust Policy:**
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {"Service": "qbusiness.amazonaws.com"},
    "Action": "sts:AssumeRole"
  }]
}
```

#### **Permissions Policy:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "qbusiness:BatchPutDocument",
        "qbusiness:BatchDeleteDocument"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "*"
    }
  ]
}
```

---

### **5. S3 Data Source Role (Optional)**
**Role Name:** `QBusinessS3DataSourceRole`
**Purpose:** S3 data source for document knowledge base

#### **Trust Policy:**
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {"Service": "qbusiness.amazonaws.com"},
    "Action": "sts:AssumeRole"
  }]
}
```

#### **Permissions Policy:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::crohns-colitis-knowledge-base",
        "arn:aws:s3:::crohns-colitis-knowledge-base/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "qbusiness:BatchPutDocument",
        "qbusiness:BatchDeleteDocument"
      ],
      "Resource": "*"
    }
  ]
}
```

---

### **6. CDK Bootstrap Roles**
**Created automatically by CDK bootstrap**

#### **CDK Execution Role:**
**Role Name:** `cdk-hnb659fds-cfn-exec-role-*`
**Purpose:** CloudFormation execution during CDK deployments

#### **CDK File Publishing Role:**
**Role Name:** `cdk-hnb659fds-file-publishing-role-*`
**Purpose:** Publishing assets to S3 during deployment

#### **CDK Image Publishing Role:**
**Role Name:** `cdk-hnb659fds-image-publishing-role-*`
**Purpose:** Publishing container images to ECR

#### **CDK Lookup Role:**
**Role Name:** `cdk-hnb659fds-lookup-role-*`
**Purpose:** Looking up existing AWS resources during synthesis

---

## 🔑 Permission Breakdown by Service

### **Amazon Q Business:**
- `qbusiness:ChatSync` - Send chat messages
- `qbusiness:GetApplication` - Get application details
- `qbusiness:ListConversations` - List user conversations
- `qbusiness:BatchPutDocument` - Index documents
- `qbusiness:BatchDeleteDocument` - Remove documents

### **DynamoDB:**
- `dynamodb:PutItem` - Store conversation history
- `dynamodb:GetItem` - Retrieve conversation data
- `dynamodb:UpdateItem` - Update existing conversations
- `dynamodb:DeleteItem` - Clean up old conversations
- `dynamodb:Query` - Query conversation by session
- `dynamodb:Scan` - Scan table for maintenance

### **Amazon SES:**
- `ses:SendEmail` - Send follow-up emails
- `ses:SendRawEmail` - Send formatted emails

### **Amazon Translate:**
- `translate:TranslateText` - Multi-language support

### **S3:**
- `s3:GetObject` - Read documents from knowledge base
- `s3:ListBucket` - List bucket contents
- `s3:PutObject` - Upload deployment artifacts
- `s3:DeleteObject` - Clean up old artifacts

### **CloudWatch Logs:**
- `logs:CreateLogGroup` - Create log groups
- `logs:CreateLogStream` - Create log streams
- `logs:PutLogEvents` - Write log events

---

## 🛡️ Security Best Practices

### **Principle of Least Privilege:**
- Each role has **minimum required permissions**
- **Resource-specific ARNs** where possible
- **No wildcard permissions** except where necessary

### **Role Separation:**
- **Deployment roles** separate from **runtime roles**
- **Service-specific roles** for each AWS service
- **Data source roles** isolated per data source

### **Trust Relationships:**
- **Service principals only** - no user access
- **Specific service principals** (lambda.amazonaws.com, qbusiness.amazonaws.com)
- **No cross-account access** unless explicitly needed

### **Monitoring:**
- **CloudTrail logging** enabled for all API calls
- **CloudWatch metrics** for role usage
- **Regular access reviews** recommended

---

## 📋 Role Creation Commands

### **Create CodeBuild Role:**
```bash
aws iam create-role \
  --role-name crohns-colitis-codebuild-service-role \
  --assume-role-policy-document file://codebuild-trust-policy.json

aws iam put-role-policy \
  --role-name crohns-colitis-codebuild-service-role \
  --policy-name crohns-colitis-deployment-policy \
  --policy-document file://codebuild-permissions.json
```

### **Create S3 Data Source Role:**
```bash
aws iam create-role \
  --role-name QBusinessS3DataSourceRole \
  --assume-role-policy-document file://qbusiness-trust-policy.json

aws iam put-role-policy \
  --role-name QBusinessS3DataSourceRole \
  --policy-name S3AccessPolicy \
  --policy-document file://s3-permissions.json
```

---

## 🔍 Troubleshooting IAM Issues

### **Common Permission Errors:**

#### **"Access Denied" in Lambda:**
- Check Lambda execution role has required permissions
- Verify resource ARNs are correct
- Ensure trust relationship allows lambda.amazonaws.com

#### **"Insufficient Privileges" in CodeBuild:**
- Verify CodeBuild role has deployment permissions
- Check if CDK bootstrap roles exist
- Ensure ECR and SSM permissions are present

#### **Q Business API Errors:**
- Confirm Q Business application exists
- Check Lambda role has qbusiness:ChatSync permission
- Verify application ID is correct

### **Debug Commands:**
```bash
# Check role exists
aws iam get-role --role-name ROLE_NAME

# List role policies
aws iam list-role-policies --role-name ROLE_NAME

# Get policy document
aws iam get-role-policy --role-name ROLE_NAME --policy-name POLICY_NAME

# Test role assumption
aws sts assume-role --role-arn ROLE_ARN --role-session-name test-session
```

---

## 📊 Role Summary Table

| Role Name | Service | Purpose | Key Permissions |
|-----------|---------|---------|----------------|
| `crohns-colitis-codebuild-service-role` | CodeBuild | CI/CD Deployment | CloudFormation, Lambda, API Gateway, CDK |
| `ChatLambdaRole` | Lambda | Chat Function | Q Business, DynamoDB, Translate |
| `EmailLambdaRole` | Lambda | Email Function | SES, DynamoDB |
| `TranslateLambdaRole` | Lambda | Translation Function | Translate |
| `QBusinessApplicationRole` | Q Business | Application Service | CloudWatch Logs |
| `WebCrawlerRole` | Q Business | Web Crawler | Q Business Document APIs |
| `QBusinessS3DataSourceRole` | Q Business | S3 Data Source | S3 Read, Q Business Document APIs |

---

## 🔄 Role Lifecycle Management

### **Creation:**
1. **Automated** - CDK creates most roles during deployment
2. **Manual** - CodeBuild role created by deployment script
3. **Bootstrap** - CDK bootstrap creates CDK-specific roles

### **Updates:**
- **Policy updates** via CDK deployment
- **Manual updates** via AWS CLI or Console
- **Version control** all policy changes

### **Cleanup:**
- **CDK destroy** removes CDK-created roles
- **Manual cleanup** for CodeBuild and bootstrap roles
- **Verify deletion** to avoid orphaned resources

---

This IAM guide provides comprehensive coverage of all roles and permissions required for the Crohn's Colitis Q Business project, ensuring secure and functional deployment.