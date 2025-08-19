# AWS Services Documentation

## Overview
This document outlines all AWS services used in the Crohn's Colitis Q Business Application and their specific roles in the architecture.

## Core Services

### 1. Amazon Q Business
**Purpose**: Conversational AI engine for medical Q&A
- **Application**: Main Q Business application for Crohn's and Colitis support
- **Index**: Document index for medical content storage and retrieval
- **Retriever**: Native index retriever for content search
- **Data Sources**: Web crawler for medical websites
- **Identity Type**: Anonymous access for public users

**Key Features**:
- Conversational AI with medical knowledge
- Source attribution for answers
- Confidence scoring
- Multi-language support integration

### 2. AWS Lambda
**Purpose**: Serverless compute for API endpoints

#### Functions:
- **Chat Lambda**: Handles Q Business chat interactions
- **Email Lambda**: Processes follow-up email requests
- **Translation Lambda**: Provides real-time translation
- **Conversation Lambda**: Manages chat history retrieval
- **Data Source Creator**: Automated web crawler setup
- **Amplify Deployer**: Frontend deployment automation

**Configuration**:
- Runtime: Node.js 18.x
- Memory: 256MB
- Timeout: 5 minutes
- Environment variables for service integration

### 3. Amazon API Gateway
**Purpose**: RESTful API management and routing

#### Endpoints:
- `POST /chat` - Q Business chat interactions
- `POST /email` - Email collection and forwarding
- `GET /conversation` - Chat history retrieval
- `POST /translate` - Text translation
- `GET /health` - Health check

**Features**:
- CORS enabled for cross-origin requests
- Lambda proxy integration
- Request/response transformation

### 4. Amazon DynamoDB
**Purpose**: Conversation history and session management

#### Table Structure:
- **Table Name**: `crohns-colitis-conversations`
- **Partition Key**: `sessionId` (String)
- **Attributes**:
  - `conversationId` - Q Business conversation ID
  - `lastSystemMessageId` - Last bot message ID
  - `chatHistory` - JSON array of chat messages
  - `lastUpdated` - Timestamp
  - `ttl` - Time-to-live (30 days)

**Features**:
- Pay-per-request billing
- Automatic TTL for data cleanup
- Session persistence across page loads

### 5. Amazon S3
**Purpose**: Static asset storage and build artifacts

#### Buckets:
- **Data Source Bucket**: Stores URL files for web crawler
- **Frontend Build Bucket**: Stores React build artifacts for Amplify

**Features**:
- Versioning disabled for cost optimization
- Auto-delete objects on stack deletion
- EventBridge integration for build triggers

### 6. Amazon SES (Simple Email Service)
**Purpose**: Email delivery for follow-up requests

**Configuration**:
- Source email verification required
- Destination email for support team
- CC functionality for user confirmation
- HTML and text email support

**Email Content**:
- User contact information
- Original question
- Full conversation history
- Unique request ID for tracking

### 7. Amazon Translate
**Purpose**: Real-time language translation

**Supported Languages**:
- English (EN)
- Spanish (ES)
- Extensible for additional languages

**Features**:
- Automatic language detection
- Bidirectional translation
- Integration with Q Business responses

### 8. AWS Amplify
**Purpose**: Frontend hosting and deployment

**Configuration**:
- React application hosting
- Automatic deployments from S3 builds
- CDN distribution
- Custom domain support

### 9. Amazon EventBridge
**Purpose**: Event-driven architecture for deployments

**Rules**:
- S3 object creation events
- Automatic Amplify deployment triggers
- Build artifact processing

### 10. AWS IAM (Identity and Access Management)
**Purpose**: Security and access control

#### Roles:
- **Q Business Application Role**: CloudWatch and logging permissions
- **Lambda Execution Role**: Q Business, DynamoDB, SES, Translate access
- **Web Crawler Role**: Document indexing permissions
- **Data Source Creator Role**: S3 and Q Business management
- **Amplify Deployer Role**: Deployment automation

## Service Integration Flow

```
User Request → API Gateway → Lambda Functions → AWS Services
                                ↓
                            Q Business ← DynamoDB
                                ↓         ↓
                            Translate → SES
                                ↓
                            S3 → EventBridge → Amplify
```

## Cost Optimization Features

1. **DynamoDB**: Pay-per-request billing, automatic TTL
2. **Lambda**: Minimal memory allocation, efficient code
3. **S3**: Lifecycle policies, auto-deletion
4. **Q Business**: Starter tier index configuration
5. **API Gateway**: REST API (not WebSocket) for lower costs

## Security Features

1. **CORS**: Configured for secure cross-origin requests
2. **IAM**: Least privilege access policies
3. **Anonymous Access**: No user authentication required
4. **Data Encryption**: At-rest and in-transit encryption
5. **TTL**: Automatic data cleanup for privacy

## Monitoring and Logging

1. **CloudWatch Logs**: Lambda function logging
2. **CloudWatch Metrics**: Q Business application metrics
3. **API Gateway Logs**: Request/response logging
4. **Error Handling**: Comprehensive error responses

## Deployment Architecture

1. **Infrastructure as Code**: AWS CDK with TypeScript
2. **Automated Deployment**: EventBridge + Lambda triggers
3. **Build Pipeline**: S3 → EventBridge → Amplify
4. **Environment Management**: Separate dev/prod stacks

## Regional Considerations

- **Primary Region**: us-west-2 (configurable)
- **Multi-AZ**: Automatic for managed services
- **Global Services**: CloudFront (via Amplify), Route 53 (if custom domain)

## Compliance and Privacy

- **Data Retention**: 30-day TTL on conversation data
- **Email Privacy**: User consent required for follow-ups
- **Medical Content**: No PHI storage, general medical information only
- **GDPR Considerations**: Data deletion via TTL, minimal data collection