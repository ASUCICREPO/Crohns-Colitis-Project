# Crohn's Colitis Q Business Application

A conversational AI assistant built with AWS Q Business for Crohn's and Colitis patients.

## 🏗️ Project Structure

```
crohns-colitis-project/
├── backend/                    # AWS CDK Infrastructure
│   ├── bin/                    # CDK entry points
│   ├── lib/                    # CDK stacks
│   ├── lambda/                 # Lambda functions
│   ├── config/                 # Configuration
│   └── package.json            # Dependencies
├── frontend/                   # React Widget
│   ├── src/                    # Source code
│   ├── public/                 # Static assets
│   └── package.json            # Dependencies
├── scripts/                    # Deployment scripts
│   ├── deploy.sh              # Main deployment
│   ├── build-widget.sh        # Frontend build
│   └── create-data-sources.sh # Data source setup
├── buildspec.yml              # AWS CodeBuild
├── amplify.yml                # AWS Amplify
├── import_q_business.py       # Q Business setup
└── export_q_business.py       # Q Business export

```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- AWS CLI configured
- CDK CLI installed

### Deploy Backend
```bash
cd backend
npm install
cdk bootstrap
cdk deploy
```

### Deploy Frontend
```bash
cd frontend
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

## 🛠️ Development

### Backend
- AWS CDK with TypeScript
- Lambda functions (Node.js)
- Q Business, DynamoDB, API Gateway

### Frontend
- React with Vite
- Material-UI components
- Multi-language support

## 📖 Documentation

- API endpoints auto-generated
- Q Business application configured
- Web crawler for medical websites
- Responsive chat widget