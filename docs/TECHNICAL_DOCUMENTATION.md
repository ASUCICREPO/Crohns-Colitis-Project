# Technical Documentation - Crohn's Colitis Q Business Application

## System Overview

A serverless conversational AI application built on AWS, providing medical information and support for Crohn's disease and ulcerative colitis patients through a multi-language chat interface.

## Architecture

### High-Level Architecture
```
Frontend (React) → API Gateway → Lambda Functions → AWS Services
                                      ↓
                              Amazon Q Business
                                      ↓
                              DynamoDB + SES + Translate
```

### Component Architecture
- **Frontend**: React 18 widget with Material-UI
- **API Layer**: REST API via API Gateway
- **Compute**: Serverless Lambda functions
- **AI Engine**: Amazon Q Business with web crawler data sources
- **Storage**: DynamoDB for sessions, S3 for assets
- **Communication**: SES for email, Translate for multi-language
- **Deployment**: EventBridge-triggered CI/CD to Amplify

## Technical Stack

### Backend Infrastructure
- **Language**: TypeScript (CDK), Node.js (Lambda)
- **Framework**: AWS CDK 2.161.1
- **Runtime**: Node.js 18.x
- **Architecture**: Serverless, event-driven

### Frontend Application
- **Framework**: React 18 with Create React App
- **UI Library**: Material-UI 5.15
- **Internationalization**: Custom translation system with AWS Translate
- **State Management**: React Context
- **Build Tool**: React Scripts

## Core Components

### 1. Amazon Q Business Integration
```typescript
// Chat Lambda Function
const params = {
  applicationId: process.env.QBUSINESS_APPLICATION_ID,
  userMessage: message,
  conversationId?: conversationId,
  parentMessageId?: parentMessageId
};

const response = await client.send(new ChatSyncCommand(params));
```

**Configuration**:
- Identity Type: Anonymous
- Index Type: Starter (1 unit)
- Data Sources: Web crawler for medical websites
- Retriever: Native index configuration

### 2. API Gateway Endpoints
```
POST /chat        - Q Business chat interactions
POST /email       - Email collection and forwarding  
GET /conversation - Chat history retrieval
POST /translate   - Text translation
GET /health       - Health check
```

### 3. Lambda Functions

#### Chat Function
- **Purpose**: Q Business integration and conversation management
- **Memory**: 256MB, Timeout: 5min
- **Features**: Confidence scoring, DynamoDB session storage

#### Email Function  
- **Purpose**: Follow-up request processing
- **Integration**: SES for email delivery
- **Features**: Conversation history inclusion, CC to user

#### Translation Function
- **Purpose**: Real-time language translation
- **Integration**: Amazon Translate
- **Supported**: EN ↔ ES (extensible)

#### Conversation Function
- **Purpose**: Session history retrieval
- **Integration**: DynamoDB queries
- **Features**: TTL-based cleanup (30 days)

### 4. Data Storage

#### DynamoDB Schema
```json
{
  "sessionId": "string (partition key)",
  "conversationId": "string", 
  "lastSystemMessageId": "string",
  "chatHistory": "string (JSON array)",
  "lastUpdated": "number (timestamp)",
  "ttl": "number (30 days)"
}
```

#### S3 Buckets
- **Data Sources**: URL files for web crawler
- **Build Artifacts**: Frontend builds for Amplify deployment

### 5. CI/CD Pipeline

#### EventBridge Automation
```typescript
// S3 Event Pattern
{
  source: ["aws.s3"],
  detailType: ["Object Created"],
  detail: {
    bucket: { name: [frontendBucket] },
    object: { key: [{ prefix: "builds/" }, { suffix: ".zip" }] }
  }
}
```

**Flow**: S3 Upload → EventBridge → Lambda → Amplify Deployment

## Security Implementation

### IAM Roles and Policies
- **Principle of Least Privilege**: Service-specific permissions
- **Cross-Service Access**: Secure role assumptions
- **Resource-Level Permissions**: Scoped to specific resources

### Data Protection
- **Encryption**: At-rest and in-transit
- **Data Retention**: 30-day TTL on conversations
- **Privacy**: No PHI storage, anonymous access

### CORS Configuration
```typescript
defaultCorsPreflightOptions: {
  allowOrigins: apigateway.Cors.ALL_ORIGINS,
  allowMethods: apigateway.Cors.ALL_METHODS,
  allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key']
}
```

## Performance Optimization

### Lambda Optimization
- **Memory Allocation**: 256MB (cost-optimized)
- **Cold Start Mitigation**: Minimal dependencies
- **Connection Reuse**: AWS SDK v3 with connection pooling

### DynamoDB Optimization
- **Billing Mode**: Pay-per-request
- **TTL**: Automatic data cleanup
- **Single-table Design**: Efficient queries

### Frontend Optimization
- **Bundle Size**: Source maps disabled in production
- **Lazy Loading**: Component-level code splitting
- **Caching**: Browser caching for static assets

## Monitoring and Observability

### CloudWatch Integration
- **Lambda Logs**: Structured logging with correlation IDs
- **API Gateway Logs**: Request/response logging
- **Custom Metrics**: Q Business application metrics

### Error Handling
```typescript
// Standardized error responses
{
  statusCode: 500,
  headers: { "Access-Control-Allow-Origin": "*" },
  body: JSON.stringify({ 
    error: error.message, 
    requestId: context.awsRequestId 
  })
}
```

## Deployment Strategy

### Infrastructure as Code
```bash
# Backend deployment
cd Backend
npm install
cdk bootstrap
cdk deploy

# Frontend deployment  
cd Frontend
npm run build
# Automated via EventBridge pipeline
```

### Environment Management
- **Configuration**: Environment variables and CDK context
- **Secrets**: AWS Systems Manager Parameter Store
- **Multi-Environment**: Separate CDK stacks per environment

## Scalability Considerations

### Auto-Scaling Components
- **Lambda**: Automatic concurrency scaling
- **API Gateway**: Built-in scaling
- **DynamoDB**: On-demand scaling
- **Q Business**: Managed service scaling

### Cost Optimization
- **Serverless Architecture**: Pay-per-use model
- **Resource Right-Sizing**: Optimized memory/timeout settings
- **Data Lifecycle**: TTL-based cleanup

## Integration Points

### External Services
- **Medical Websites**: Web crawler data sources
- **Email Providers**: SES integration
- **CDN**: CloudFront via Amplify

### Frontend Integration
```javascript
// API Service Integration
const response = await fetch(`${API_BASE_URL}/chat`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message, sessionId, language })
});
```

## Development Workflow

### Local Development
```bash
# Backend testing
cd Backend
npm run build
npm run watch

# Frontend development
cd Frontend  
npm start
```

### Testing Strategy
- **Unit Tests**: Removed for production (were in services/)
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Manual testing via sample pages

## Troubleshooting Guide

### Common Issues
1. **Q Business Permissions**: Verify application role ARN
2. **CORS Errors**: Check API Gateway CORS configuration
3. **Lambda Timeouts**: Monitor CloudWatch logs for performance
4. **DynamoDB Access**: Verify IAM permissions for Lambda role

### Debug Commands
```bash
# Check CDK deployment
cdk diff
cdk synth

# Monitor Lambda logs
aws logs tail /aws/lambda/function-name --follow

# Test API endpoints
curl -X POST https://api-url/chat -d '{"message":"test"}'
```

## Future Enhancements

### Planned Features
- **Additional Languages**: Extend translation support
- **Advanced Analytics**: User interaction tracking
- **Content Management**: Dynamic data source updates
- **Mobile App**: React Native implementation

### Technical Debt
- **Error Handling**: Enhanced error categorization
- **Caching**: Redis integration for session caching
- **Monitoring**: Custom dashboards and alerting
- **Testing**: Automated test suite implementation