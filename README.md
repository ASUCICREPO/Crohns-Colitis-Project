# Crohn's Colitis Q Business Application

A conversational AI assistant built with AWS Q Business for Crohn's and Colitis patients.

## Disclaimers

Customers are responsible for making their own independent assessment of the information in this document.

This document:

(a) is for informational purposes only,

(b) references AWS product offerings and practices, which are subject to change without notice,

(c) does not create any commitments or assurances from AWS and its affiliates, suppliers or licensors. AWS products or services are provided "as is" without warranties, representations, or conditions of any kind, whether express or implied. The responsibilities and liabilities of AWS to its customers are controlled by AWS agreements, and this document is not part of, nor does it modify, any agreement between AWS and its customers, and

(d) is not to be considered a recommendation or viewpoint of AWS.

Additionally, you are solely responsible for testing, security and optimizing all code and assets on GitHub repo, and all such code and assets should be considered:

(a) as-is and without warranties or representations of any kind,

(b) not suitable for production environments, or on production or other critical data, and

(c) to include shortcuts in order to support rapid prototyping such as, but not limited to, relaxed authentication and authorization and a lack of strict adherence to security best practices.

All work produced is open source. More information can be found in the GitHub repo.

## 🏗️ Project Structure

```
crohns-colitis-project/
├── Backend/                    # AWS CDK Infrastructure
│   ├── bin/                    # CDK entry points
│   ├── lib/                    # CDK stacks
│   ├── lambda/                 # Lambda functions
│   ├── config/                 # Configuration
│   ├── data-sources/           # Q Business data sources
│   └── package.json            # Dependencies
├── Frontend/                   # React Widget
│   ├── src/                    # Source code
│   │   ├── Components/         # React components
│   │   ├── services/           # API services
│   │   ├── utils/              # Utilities
│   │   └── Assets/             # Images & icons
│   ├── public/                 # Static assets
│   └── package.json            # Dependencies
├── scripts/                    # Deployment scripts
│   ├── deploy.sh              # Main deployment
│   ├── build-widget.sh        # Frontend build
│   └── create-data-sources.sh # Data source setup
├── docs/                       # Documentation
├── buildspec.yml              # AWS CodeBuild
└── amplify.yml                # AWS Amplify
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- AWS CLI configured
- CDK CLI installed

### Deploy Backend
```bash
cd Backend
npm install
cdk bootstrap
cdk deploy
```

### Deploy Frontend
```bash
cd Frontend
npm install
npm run build
```

### Full Deployment
```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

## 🔧 Configuration

Set environment variables:
```bash
export SOURCE_EMAIL="your-email@domain.com"
export DESTINATION_EMAIL="support@domain.com"
export AWS_REGION="us-west-2"
```

## 📚 Features

- **Q Business Integration** - Conversational AI
- **Multi-language Support** - Translation service
- **Email Collection** - Follow-up requests
- **Conversation History** - DynamoDB storage
- **Web Crawler** - Automatic content indexing

## 🏗️ AWS Services

See [AWS Services Documentation](docs/AWS_SERVICES.md) for detailed information about:
- Amazon Q Business (Conversational AI)
- AWS Lambda (Serverless functions)
- Amazon API Gateway (REST API)
- Amazon DynamoDB (Session storage)
- Amazon S3 (Static assets)
- Amazon SES (Email service)
- Amazon Translate (Multi-language)
- AWS Amplify (Frontend hosting)
- Amazon EventBridge (Event automation)
- AWS IAM (Security & access control)

## 📋 Technical Documentation

See [Technical Documentation](docs/TECHNICAL_DOCUMENTATION.md) for comprehensive details on:
- System architecture and component design
- Implementation details and code examples
- Security, performance, and scalability considerations
- Deployment strategies and troubleshooting guides

## 🛠️ Technology Stack

### Backend
- AWS CDK with TypeScript
- Lambda functions (Node.js)
- Q Business, DynamoDB, API Gateway
- Translation service integration

### Frontend
- React 18 with Create React App
- Material-UI components
- Multi-language support (i18next)
- Responsive chat widget

## 📖 Production Features

- Conversational AI with Q Business
- Real-time translation service
- Email collection for follow-ups
- Conversation history storage
- Cross-page chat persistence
- Mobile-responsive design
