import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';

import { Construct } from 'constructs';
import { config } from '../config/environment';
import * as path from 'path';

export interface QBusinessStackProps extends cdk.StackProps {
  applicationId?: string;
  sourceEmail?: string;
  destinationEmail?: string;
}

export class QBusinessStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: QBusinessStackProps) {
    super(scope, id, props);

    const projectName = 'crohns-colitis';
    const applicationId = props?.applicationId || config.qbusiness.applicationId;
    
    // Email parameters from CDK context or props
    const sourceEmail = new cdk.CfnParameter(this, 'sourceEmail', {
      type: 'String',
      description: 'Source email address for SES (must be verified)',
      default: props?.sourceEmail || config.email.sourceEmail
    });
    
    const destinationEmail = new cdk.CfnParameter(this, 'destinationEmail', {
      type: 'String', 
      description: 'Destination email address for follow-up requests',
      default: props?.destinationEmail || config.email.destinationEmail
    });

    // Q Business Application Role
    const applicationRole = new iam.Role(this, "QBusinessApplicationRole", {
      assumedBy: new iam.ServicePrincipal("qbusiness.amazonaws.com"),
      inlinePolicies: {
        QBusinessApplicationPolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: ["cloudwatch:PutMetricData"],
              resources: ["*"],
              conditions: {
                StringEquals: { "cloudwatch:namespace": "AWS/QBusiness" },
              },
            }),
            new iam.PolicyStatement({
              actions: ["logs:DescribeLogGroups", "logs:CreateLogGroup"],
              resources: [`arn:aws:logs:${this.region}:${this.account}:log-group:/aws/qbusiness/*`],
            }),
            new iam.PolicyStatement({
              actions: ["logs:DescribeLogStreams", "logs:CreateLogStream", "logs:PutLogEvents"],
              resources: [`arn:aws:logs:${this.region}:${this.account}:log-group:/aws/qbusiness/*:log-stream:*`],
            }),
            new iam.PolicyStatement({
              actions: ["logs:DescribeLogGroups"],
              resources: [`arn:aws:logs:${this.region}:${this.account}:log-group:*`],
            }),
          ],
        }),
      },
    });

    // Q Business Application using CloudFormation
    const qBusinessApp = new cdk.CfnResource(this, 'QBusinessApplication', {
      type: 'AWS::QBusiness::Application',
      properties: {
        DisplayName: `${projectName}-application`,
        Description: 'Crohns Colitis AI Assistant Q Business Application',
        RoleArn: applicationRole.roleArn,
        IdentityType: 'ANONYMOUS'
      },
    });

    // Debug: print values before creating DataSource



    // Q Business Index
    const qBusinessIndex = new cdk.CfnResource(this, 'QBusinessIndex', {
      type: 'AWS::QBusiness::Index',
      properties: {
        ApplicationId: qBusinessApp.ref,
        DisplayName: `${projectName}-index`,
        Description: 'Main index for Crohns Colitis content',
        Type: 'STARTER',
        CapacityConfiguration: {
          Units: 1,
        },
        DocumentAttributeConfigurations: [
          {
            Name: '_source_uri',
            Type: 'STRING',
            Search: 'ENABLED'
          },
          {
            Name: '_document_title', 
            Type: 'STRING',
            Search: 'ENABLED'
          }
        ]
      },
    });

    // Q Business Retriever
    const qBusinessRetriever = new cdk.CfnResource(this, 'QBusinessRetriever', {
      type: 'AWS::QBusiness::Retriever',
      properties: {
        ApplicationId: qBusinessApp.ref,
        DisplayName: `${projectName}-retriever`,
        Type: 'NATIVE_INDEX',
        Configuration: {
          NativeIndexConfiguration: {
            IndexId: qBusinessIndex.getAtt('IndexId'),
          },
        },
      },
    });


    // Web Crawler Data Sources
    const webCrawlerRole = new iam.Role(this, "WebCrawlerRole", {
      assumedBy: new iam.ServicePrincipal("qbusiness.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonQBusinessWebCrawlerServiceRolePolicy')
      ]
    });

    // Data source URLs
    const dataSources = [
      {
        name: 'crohns-colitis-foundation',
        url: 'https://www.crohnscolitisfoundation.org/'
      },
      {
        name: 'gastro-org', 
        url: 'https://gastro.org/'
      },
      {
        name: 'crohns-colitis-community',
        url: 'https://www.crohnscolitiscommunity.org/crohns-colitis-expert-qa'
      }
    ];

    // Create data sources
    const webCrawlerDataSources = dataSources.map((source, index) => {
      return new cdk.CfnResource(this, `WebCrawlerDataSource${index + 1}`, {
        type: 'AWS::QBusiness::DataSource',
        properties: {
          ApplicationId: qBusinessApp.ref,
          IndexId: qBusinessIndex.getAtt('IndexId'),
          DisplayName: source.name,
          Type: 'WEBCRAWLER',
          Configuration: {
            webCrawlerConfiguration: {
              urls: {
                seedUrlConfiguration: {
                  seedUrls: [source.url]
                }
              },
              crawlDepth: 3,
              maxLinksPerPage: 100,
              maxContentSizePerPageInMegaBytes: 50,
              maxUrlsPerMinuteCrawlRate: 300,
              urlInclusionPatterns: [],
              urlExclusionPatterns: [],
              proxyConfiguration: {},
              authenticationConfiguration: {}
            }
          },
          RoleArn: webCrawlerRole.roleArn,
          SyncSchedule: {
            schedule: 'rate(7 days)',
            startTime: new Date().toISOString()
          }
        }
      });
    });

    
    console.log("📌 ApplicationId:", qBusinessApp.ref);
    console.log("📌 IndexId:", qBusinessIndex.getAtt('IndexId'));
    // console.log("📌 WebCrawlerRole ARN:", webCrawlerRole.roleArn);
    // DynamoDB Table for Conversations
    const conversationTable = new dynamodb.Table(this, 'ConversationTable', {
      tableName: config.dynamodb.tableName,
      partitionKey: { name: 'sessionId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      timeToLiveAttribute: 'ttl',
    });

    // Lambda Role with full Q Business access
    const lambdaRole = new iam.Role(this, "LambdaExecutionRole", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaBasicExecutionRole")],
      inlinePolicies: {
        QBusinessFullAccess: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                "qbusiness:ChatSync",
                "qbusiness:Chat",
                "qbusiness:GetApplication",
                "qbusiness:ListApplications",
                "qbusiness:GetRetriever",
                "qbusiness:ListRetrievers",
                "qbusiness:GetIndex",
                "qbusiness:ListIndices",

              ],
              resources: ["*"],
            }),
            new iam.PolicyStatement({
              actions: ["ses:SendEmail", "ses:SendRawEmail"],
              resources: ["*"],
            }),
            new iam.PolicyStatement({
              actions: ["translate:TranslateText"],
              resources: ["*"],
            }),
          ],
        }),
      },
    });

    // Grant DynamoDB permissions
    conversationTable.grantReadWriteData(lambdaRole);



    // Lambda Functions
    const chatLambda = new lambda.Function(this, 'ChatLambdaFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda/chat')),
      role: lambdaRole,
      timeout: cdk.Duration.seconds(config.lambda.timeout),
      memorySize: config.lambda.memorySize,
      environment: {
        QBUSINESS_APPLICATION_ID: qBusinessApp.ref,
        DYNAMODB_TABLE_NAME: conversationTable.tableName,
      },
    });

    const emailLambda = new lambda.Function(this, 'EmailLambdaFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda/email')),
      role: lambdaRole,
      timeout: cdk.Duration.seconds(config.lambda.timeout),
      memorySize: config.lambda.memorySize,
      environment: {
        SOURCE_EMAIL: sourceEmail.valueAsString,
        DESTINATION_EMAIL: destinationEmail.valueAsString,
      },
    });

    const conversationLambda = new lambda.Function(this, 'ConversationLambdaFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda/conversation')),
      role: lambdaRole,
      timeout: cdk.Duration.seconds(config.lambda.timeout),
      memorySize: config.lambda.memorySize,
      environment: {
        DYNAMODB_TABLE_NAME: conversationTable.tableName,
      },
    });

    const translationLambda = new lambda.Function(this, 'TranslationLambdaFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda/translation')),
      role: lambdaRole,
      timeout: cdk.Duration.seconds(config.lambda.timeout),
      memorySize: config.lambda.memorySize,
      environment: {},
    });

    // API Gateway
    const api = new apigateway.RestApi(this, 'AmazonQBusinessAPI', {
      restApiName: 'AmazonQBusinessAPI',
      description: 'API for Amazon Q Business Integration',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key'],
      },
    });

    // API Resources and Methods
    const chatResource = api.root.addResource('chat');
    chatResource.addMethod('POST', new apigateway.LambdaIntegration(chatLambda));
    
    const emailResource = api.root.addResource('email');
    emailResource.addMethod('POST', new apigateway.LambdaIntegration(emailLambda));
    
    const conversationResource = api.root.addResource('conversation');
    conversationResource.addMethod('GET', new apigateway.LambdaIntegration(conversationLambda));
    
    const translateResource = api.root.addResource('translate');
    translateResource.addMethod('POST', new apigateway.LambdaIntegration(translationLambda));

    // Outputs
    new cdk.CfnOutput(this, 'ApiEndpoint', {
      value: api.url,
      description: 'API Gateway endpoint URL',
    });

    new cdk.CfnOutput(this, 'ChatEndpoint', {
      value: `${api.url}chat`,
      description: 'Chat API endpoint URL',
    });

    new cdk.CfnOutput(this, 'EmailEndpoint', {
      value: `${api.url}email`,
      description: 'Email collection endpoint URL',
    });

    new cdk.CfnOutput(this, 'ConversationEndpoint', {
      value: `${api.url}conversation`,
      description: 'Conversation retrieval endpoint URL',
    });

    new cdk.CfnOutput(this, 'TranslateEndpoint', {
      value: `${api.url}translate`,
      description: 'Translation endpoint URL',
    });

    new cdk.CfnOutput(this, 'QBusinessApplicationId', {
      value: qBusinessApp.ref,
      description: 'Q Business Application ID',
    });

    new cdk.CfnOutput(this, 'QBusinessIndexId', {
      value: qBusinessIndex.getAtt('IndexId').toString(),
      description: 'Q Business Index ID',
    });

    // Output data source IDs
    webCrawlerDataSources.forEach((dataSource, index) => {
      new cdk.CfnOutput(this, `QBusinessDataSource${index + 1}Id`, {
        value: dataSource.ref,
        description: `Q Business Data Source ${index + 1} ID`
      });
    });

    new cdk.CfnOutput(this, 'QBusinessRetrieverId', {
      value: qBusinessRetriever.ref,
      description: 'Q Business Retriever ID',
    });

    new cdk.CfnOutput(this, 'DynamoDBTableName', {
      value: conversationTable.tableName,
      description: 'DynamoDB table name for conversations',
    });

    // Frontend will be deployed separately via Amplify Console or S3
    new cdk.CfnOutput(this, 'FrontendInstructions', {
      value: 'Deploy frontend manually using the API endpoints above',
      description: 'Frontend deployment instructions',
    });
  }
}