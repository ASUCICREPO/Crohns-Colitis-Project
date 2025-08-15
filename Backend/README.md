# Backend for Catholic Charities AI Assistant

## Overview

The backend of the Catholic Charities AI Assistant is responsible for managing data sources, processing user queries, and automating deployments. It leverages AWS services orchestrated through AWS CDK to provide a scalable and maintainable infrastructure. This README provides a detailed explanation of the backend architecture, component interactions, deployment process, and configuration.

## Table of Contents

- [Architecture](#architecture)
  - [Key Components](#key-components)
  - [Lambda Functions](#lambda-functions)
- [Component Interactions](#component-interactions)
- [Deployment Process](#deployment-process)
- [Configuration](#configuration)
- [Monitoring and Logging](#monitoring-and-logging)
- [Adding New Data Sources](#adding-new-data-sources)
- [Important Notes](#important-notes)

## Architecture

The backend architecture is built using AWS services defined as code via AWS CDK. It consists of the following key components:

### Key Components

- **Amazon S3 Buckets**:
  - `DataSourceBucket`: Stores text files (e.g., `urls1.txt`) containing URLs to be crawled and indexed by Amazon Q Business.
  - `FrontendBuildBucket`: Stores zipped frontend build artifacts for automated deployment.

- **Amazon Q Business**:
  - An application with an index and retriever for conversational AI capabilities.
  - Web crawler data sources are created based on the URL files stored in the `DataSourceBucket`.

- **AWS Lambda Functions**:
  - Manage data sources, handle chat queries, and automate frontend deployments.

- **API Gateway**:
  - Provides RESTful endpoints (`/chat` and `/health`) for the frontend to interact with the backend.

- **EventBridge**:
  - Monitors S3 uploads to the `FrontendBuildBucket` and triggers automated deployments.

### Lambda Functions

- **DataSourceCreator**:
  - **Runtime**: Python 3.11
  - **Handler**: `index.handler`
  - **Purpose**: Reads URL files from the `DataSourceBucket` and creates corresponding web crawler data sources in Amazon Q Business.
  - **Trigger**: Invoked as a custom resource during CDK stack deployment.

- **ChatLambdaFunction**:
  - **Runtime**: Python 3.11
  - **Handler**: `lambda_function.lambda_handler`
  - **Purpose**: Handles incoming chat queries from the frontend, interacts with Amazon Q Business to get responses, and returns the results with source attributions.
  - **Trigger**: Invoked by API Gateway on `/chat` POST requests.

- **AmplifyDeployer**:
  - **Runtime**: Python 3.11
  - **Handler**: `index.handler`
  - **Purpose**: Starts AWS Amplify deployments when new frontend builds are uploaded to the `FrontendBuildBucket`.
  - **Trigger**: Invoked by EventBridge on S3 object creation events.

## Component Interactions

1. **Data Source Management**:
   - During stack deployment, the `DataSourceCreator` Lambda is invoked as a custom resource.
   - It reads `.txt` files from the `DataSourceBucket`, each containing URLs to be crawled.
   - For each file, it creates a web crawler data source in Amazon Q Business, configuring it to index the specified URLs.

2. **Chat Functionality**:
   - When a user submits a query via the frontend, it sends a POST request to the API Gateway's `/chat` endpoint.
   - The API Gateway routes this request to the `ChatLambdaFunction`.
   - The Lambda function extracts the user's message and calls the Amazon Q Business `chat_sync` API.
   - Amazon Q Business processes the query using its indexed data and returns a response with source attributions.
   - The Lambda function formats the response and sends it back to the frontend via the API Gateway.

3. **Deployment Automation**:
   - When a new frontend build is ready, it's zipped and uploaded to the `FrontendBuildBucket` with a key starting with `builds/`.
   - EventBridge detects this upload and triggers the `AmplifyDeployer` Lambda.
   - The Lambda function retrieves the Amplify app ID and branch name from its environment variables.
   - It then calls the AWS Amplify API to start a deployment using the uploaded build artifact.
   - This ensures that the latest frontend is automatically deployed without manual intervention.

## Deployment Process

The backend is deployed using AWS CDK, with the deployment process automated through AWS CodeBuild.

- **deploy.sh**:
  - Prompts the user for necessary parameters (e.g., GitHub URL, project name, AWS region).
  - Creates or updates an IAM role for CodeBuild.
  - Sets up a CodeBuild project with the specified parameters.
  - Starts a build that executes the `buildspec.yml` file.

- **buildspec.yml**:
  - Installs dependencies and the AWS CDK CLI.
  - Bootstraps the CDK environment.
  - Deploys the CDK stack, which provisions all backend resources.
  - Tests the API Gateway endpoints.
  - Triggers data source sync jobs for Amazon Q Business.
  - Builds the frontend, uploads the build artifact to S3, and triggers the automated deployment via EventBridge.

This process ensures consistent deployment and configuration across different environments.

## Configuration

The backend relies on several parameters and environment variables:

- **Parameters** (provided via `deploy.sh` or CDK context):
  - `projectName`: Used to name resources uniquely.
  - `urlFilesPath`: Location of the URL files for data sources.
  - `amplifyAppName` and `amplifyBranchName`: For frontend deployment.
  - `AWS_REGION`: The region where resources are deployed (default: `us-west-2`).

- **Environment Variables**:
  - `QBUSINESS_APPLICATION_ID`: Set in the `ChatLambdaFunction` to identify the Amazon Q Business application.
  - `AMPLIFY_APP_ID` and `AMPLIFY_BRANCH_NAME`: Set in the `AmplifyDeployer` Lambda for deployment automation.

These parameters are passed to the CDK stack and CodeBuild environment during deployment.

## Monitoring and Logging

- All Lambda functions are configured to log to AWS CloudWatch.
- API Gateway access logs can be enabled for detailed request tracking.
- Amazon Q Business provides its own logging and monitoring capabilities through CloudWatch.

It is recommended to set up CloudWatch alarms and dashboards for critical metrics, such as Lambda errors or API Gateway latency.

## Adding New Data Sources

To add new URLs for indexing:

1. Create a new `.txt` file in the `data-sources` directory, listing the URLs to be crawled (one per line).
2. Update the `urlFilesPath` parameter in the deployment script or CDK context.
3. Redeploy the stack to create a new data source for the additional URLs.

Alternatively, you can manually add data sources through the Amazon Q Business console after deployment.

## Important Notes

- **Region Selection**: The project is optimized for the `us-west-2` region. Deployment in other regions, such as `us-east-1`, may require additional configuration or face connectivity issues with certain URLs.
- **Data Source Syncing**: The sync job for data sources may not start immediately after creation. A polling mechanism is implemented in `buildspec.yml` to wait for the data source to be ready.
- **URL Accessibility**: Ensure that all URLs in the data source files are publicly accessible and not restricted by geo-location or IP rules, as this can affect the web crawler's ability to index them.
- **Custom Resource for Data Sources**: The `DataSourcesCustomResource` is a CDK custom resource that invokes the `DataSourceCreator` Lambda during stack deployment, ensuring data sources are automatically created or updated based on the URL files in S3.