import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
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

    // Web Crawler Role
    const webCrawlerRole = new iam.Role(this, "WebCrawlerRole", {
      assumedBy: new iam.ServicePrincipal("qbusiness.amazonaws.com"),
      inlinePolicies: {
        WebCrawlerPolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: ["qbusiness:BatchPutDocument", "qbusiness:BatchDeleteDocument"],
              resources: ["*"],
            }),
          ],
        }),
      },
    });

    // Web Crawler Data Source
    const webCrawlerDataSource = new cdk.CfnResource(this, 'WebCrawlerDataSource', {
      type: 'AWS::QBusiness::DataSource',
      properties: {
        ApplicationId: qBusinessApp.ref,
        IndexId: qBusinessIndex.getAtt('IndexId'),
        DisplayName: 'WebCrawlerDataSource',
        Type: 'WEBCRAWLER',
        RoleArn: webCrawlerRole.roleArn,
        Configuration: {
          WebCrawlerConfiguration: {
            Urls: {
              SeedUrls: [
                'https://www.crohnscolitisfoundation.org/',
                'https://gastro.org/',
                'https://www.crohnscolitiscommunity.org/crohns-colitis-expert-qa'
              ]
            },
            CrawlDepth: 3,
            CrawlSubDomain: true,
            CrawlAllDomain: false,
            MaxLinksPerUrl: 100,
            RateLimit: 300,
            MaxFileSize: 50,
            HonorRobots: true,
            CrawlAttachments: true,
            AuthenticationConfiguration: {
              AuthenticationType: 'NoAuthentication'
            }
          }
        }
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

    new cdk.CfnOutput(this, 'QBusinessDataSourceId', {
      value: webCrawlerDataSource.ref,
      description: 'Q Business Data Source ID',
    });

    new cdk.CfnOutput(this, 'QBusinessRetrieverId', {
      value: qBusinessRetriever.ref,
      description: 'Q Business Retriever ID',
    });

    new cdk.CfnOutput(this, 'DynamoDBTableName', {
      value: conversationTable.tableName,
      description: 'DynamoDB table name for conversations',
    });
  }
}