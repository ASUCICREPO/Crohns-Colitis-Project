"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QBusinessStack = void 0;
const cdk = require("aws-cdk-lib");
const iam = require("aws-cdk-lib/aws-iam");
const qbusiness = require("aws-cdk-lib/aws-qbusiness");
const lambda = require("aws-cdk-lib/aws-lambda");
const apigateway = require("aws-cdk-lib/aws-apigateway");
const dynamodb = require("aws-cdk-lib/aws-dynamodb");
const environment_1 = require("../config/environment");
const path = require("path");
class QBusinessStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        const projectName = 'crohns-colitis';
        const applicationId = props?.applicationId || environment_1.config.qbusiness.applicationId;
        const sourceEmail = props?.sourceEmail || environment_1.config.email.sourceEmail;
        const destinationEmail = props?.destinationEmail || environment_1.config.email.destinationEmail;
        // Q Business Application
        const qBusinessApp = new qbusiness.CfnApplication(this, "QBusinessApplication", {
            displayName: `${projectName}-application`,
            description: "Crohns Colitis AI Assistant Q Business Application",
            identityType: "ANONYMOUS",
        });
        // Q Business Index
        const qBusinessIndex = new qbusiness.CfnIndex(this, "QBusinessIndex", {
            applicationId: qBusinessApp.attrApplicationId,
            displayName: `${projectName}-index`,
            description: "Main index for Crohns Colitis content",
            type: "STARTER",
            capacityConfiguration: {
                units: 1,
            },
        });
        // DynamoDB Table for Conversations
        const conversationTable = new dynamodb.Table(this, 'ConversationTable', {
            tableName: environment_1.config.dynamodb.tableName,
            partitionKey: { name: 'sessionId', type: dynamodb.AttributeType.STRING },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            timeToLiveAttribute: 'ttl',
        });
        // Lambda Role
        const lambdaRole = new iam.Role(this, "LambdaExecutionRole", {
            assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
            managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaBasicExecutionRole")],
            inlinePolicies: {
                QBusinessAccess: new iam.PolicyDocument({
                    statements: [
                        new iam.PolicyStatement({
                            actions: [
                                "qbusiness:ChatSync",
                                "qbusiness:Chat",
                                "qbusiness:GetApplication",
                                "qbusiness:ListApplications",
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
            timeout: cdk.Duration.seconds(environment_1.config.lambda.timeout),
            memorySize: environment_1.config.lambda.memorySize,
            environment: {
                QBUSINESS_APPLICATION_ID: applicationId || qBusinessApp.attrApplicationId,
                DYNAMODB_TABLE_NAME: conversationTable.tableName,
                AWS_REGION: this.region,
            },
        });
        const emailLambda = new lambda.Function(this, 'EmailLambdaFunction', {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset(path.join(__dirname, '../lambda/email')),
            role: lambdaRole,
            timeout: cdk.Duration.seconds(environment_1.config.lambda.timeout),
            memorySize: environment_1.config.lambda.memorySize,
            environment: {
                SOURCE_EMAIL: sourceEmail,
                DESTINATION_EMAIL: destinationEmail,
                AWS_REGION: this.region,
            },
        });
        const conversationLambda = new lambda.Function(this, 'ConversationLambdaFunction', {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset(path.join(__dirname, '../lambda/conversation')),
            role: lambdaRole,
            timeout: cdk.Duration.seconds(environment_1.config.lambda.timeout),
            memorySize: environment_1.config.lambda.memorySize,
            environment: {
                DYNAMODB_TABLE_NAME: conversationTable.tableName,
                AWS_REGION: this.region,
            },
        });
        const translationLambda = new lambda.Function(this, 'TranslationLambdaFunction', {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset(path.join(__dirname, '../lambda/translation')),
            role: lambdaRole,
            timeout: cdk.Duration.seconds(environment_1.config.lambda.timeout),
            memorySize: environment_1.config.lambda.memorySize,
            environment: {
                AWS_REGION: this.region,
            },
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
            value: qBusinessApp.attrApplicationId,
            description: 'Q Business Application ID',
        });
        new cdk.CfnOutput(this, 'QBusinessIndexId', {
            value: qBusinessIndex.attrIndexId,
            description: 'Q Business Index ID',
        });
        new cdk.CfnOutput(this, 'DynamoDBTableName', {
            value: conversationTable.tableName,
            description: 'DynamoDB table name for conversations',
        });
    }
}
exports.QBusinessStack = QBusinessStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicWJ1c2luZXNzLXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsicWJ1c2luZXNzLXN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLG1DQUFtQztBQUNuQywyQ0FBMkM7QUFDM0MsdURBQXVEO0FBQ3ZELGlEQUFpRDtBQUNqRCx5REFBeUQ7QUFDekQscURBQXFEO0FBRXJELHVEQUErQztBQUMvQyw2QkFBNkI7QUFRN0IsTUFBYSxjQUFlLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFDM0MsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUEyQjtRQUNuRSxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4QixNQUFNLFdBQVcsR0FBRyxnQkFBZ0IsQ0FBQztRQUNyQyxNQUFNLGFBQWEsR0FBRyxLQUFLLEVBQUUsYUFBYSxJQUFJLG9CQUFNLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQztRQUM3RSxNQUFNLFdBQVcsR0FBRyxLQUFLLEVBQUUsV0FBVyxJQUFJLG9CQUFNLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQztRQUNuRSxNQUFNLGdCQUFnQixHQUFHLEtBQUssRUFBRSxnQkFBZ0IsSUFBSSxvQkFBTSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQztRQUVsRix5QkFBeUI7UUFDekIsTUFBTSxZQUFZLEdBQUcsSUFBSSxTQUFTLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxzQkFBc0IsRUFBRTtZQUM5RSxXQUFXLEVBQUUsR0FBRyxXQUFXLGNBQWM7WUFDekMsV0FBVyxFQUFFLG9EQUFvRDtZQUNqRSxZQUFZLEVBQUUsV0FBVztTQUMxQixDQUFDLENBQUM7UUFFSCxtQkFBbUI7UUFDbkIsTUFBTSxjQUFjLEdBQUcsSUFBSSxTQUFTLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxnQkFBZ0IsRUFBRTtZQUNwRSxhQUFhLEVBQUUsWUFBWSxDQUFDLGlCQUFpQjtZQUM3QyxXQUFXLEVBQUUs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QUMsQ0FBQztRQUVILElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsbUJBQW1CLEVBQUU7WUFDM0MsS0FBSyxFQUFFLEdBQUcsR0FBRyxDQUFDLEdBQUcsV0FBVztZQUM1QixXQUFXLEVBQUUsMEJBQTBCO1NBQ3hDLENBQUMsQ0FBQztRQUVILElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsd0JBQXdCLEVBQUU7WUFDaEQsS0FBSyxFQUFFLFlBQVksQ0FBQyxpQkFBaUI7WUFDckMsV0FBVyxFQUFFLDJCQUEyQjtTQUN6QyxDQUFDLENBQUM7UUFFSCxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLGtCQUFrQixFQUFFO1lBQzFDLEtBQUssRUFBRSxjQUFjLENBQUMsV0FBVztZQUNqQyxXQUFXLEVBQUUscUJBQXFCO1NBQ25DLENBQUMsQ0FBQztRQUVILElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsbUJBQW1CLEVBQUU7WUFDM0MsS0FBSyxFQUFFLGlCQUFpQixDQUFDLFNBQVM7WUFDbEMsV0FBVyxFQUFFLHVDQUF1QztTQUNyRCxDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0Y7QUExTEQsd0NBMExDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCAqIGFzIGlhbSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtaWFtJztcbmltcG9ydCAqIGFzIHFidXNpbmVzcyBmcm9tICdhd3MtY2RrLWxpYi9hd3MtcWJ1c2luZXNzJztcbmltcG9ydCAqIGFzIGxhbWJkYSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtbGFtYmRhJztcbmltcG9ydCAqIGFzIGFwaWdhdGV3YXkgZnJvbSAnYXdzLWNkay1saWIvYXdzLWFwaWdhdGV3YXknO1xuaW1wb3J0ICogYXMgZHluYW1vZGIgZnJvbSAnYXdzLWNkay1saWIvYXdzLWR5bmFtb2RiJztcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xuaW1wb3J0IHsgY29uZmlnIH0gZnJvbSAnLi4vY29uZmlnL2Vudmlyb25tZW50JztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgUUJ1c2luZXNzU3RhY2tQcm9wcyBleHRlbmRzIGNkay5TdGFja1Byb3BzIHtcbiAgYXBwbGljYXRpb25JZD86IHN0cmluZztcbiAgc291cmNlRW1haWw/OiBzdHJpbmc7XG4gIGRlc3RpbmF0aW9uRW1haWw/OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBjbGFzcyBRQnVzaW5lc3NTdGFjayBleHRlbmRzIGNkay5TdGFjayB7XG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzPzogUUJ1c2luZXNzU3RhY2tQcm9wcykge1xuICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xuXG4gICAgY29uc3QgcHJvamVjdE5hbWUgPSAnY3JvaG5zLWNvbGl0aXMnO1xuICAgIGNvbnN0IGFwcGxpY2F0aW9uSWQgPSBwcm9wcz8uYXBwbGljYXRpb25JZCB8fCBjb25maWcucWJ1c2luZXNzLmFwcGxpY2F0aW9uSWQ7XG4gICAgY29uc3Qgc291cmNlRW1haWwgPSBwcm9wcz8uc291cmNlRW1haWwgfHwgY29uZmlnLmVtYWlsLnNvdXJjZUVtYWlsO1xuICAgIGNvbnN0IGRlc3RpbmF0aW9uRW1haWwgPSBwcm9wcz8uZGVzdGluYXRpb25FbWFpbCB8fCBjb25maWcuZW1haWwuZGVzdGluYXRpb25FbWFpbDtcblxuICAgIC8vIFEgQnVzaW5lc3MgQXBwbGljYXRpb25cbiAgICBjb25zdCBxQnVzaW5lc3NBcHAgPSBuZXcgcWJ1c2luZXNzLkNmbkFwcGxpY2F0aW9uKHRoaXMsIFwiUUJ1c2luZXNzQXBwbGljYXRpb25cIiwge1xuICAgICAgZGlzcGxheU5hbWU6IGAke3Byb2plY3ROYW1lfS1hcHBsaWNhdGlvbmAsXG4gICAgICBkZXNjcmlwdGlvbjogXCJDcm9obnMgQ29saXRpcyBBSSBBc3Npc3RhbnQgUSBCdXNpbmVzcyBBcHBsaWNhdGlvblwiLFxuICAgICAgaWRlbnRpdHlUeXBlOiBcIkFOT05ZTU9VU1wiLFxuICAgIH0pO1xuXG4gICAgLy8gUSBCdXNpbmVzcyBJbmRleFxuICAgIGNvbnN0IHFCdXNpbmVzc0luZGV4ID0gbmV3IHFidXNpbmVzcy5DZm5JbmRleCh0aGlzLCBcIlFCdXNpbmVzc0luZGV4XCIsIHtcbiAgICAgIGFwcGxpY2F0aW9uSWQ6IHFCdXNpbmVzc0FwcC5hdHRyQXBwbGljYXRpb25JZCxcbiAgICAgIGRpc3BsYXlOYW1lOiBgJHtwcm9qZWN0TmFtZX0taW5kZXhgLFxuICAgICAgZGVzY3JpcHRpb246IFwiTWFpbiBpbmRleCBmb3IgQ3JvaG5zIENvbGl0aXMgY29udGVudFwiLFxuICAgICAgdHlwZTogXCJTVEFSVEVSXCIsXG4gICAgICBjYXBhY2l0eUNvbmZpZ3VyYXRpb246IHtcbiAgICAgICAgdW5pdHM6IDEsXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgLy8gRHluYW1vREIgVGFibGUgZm9yIENvbnZlcnNhdGlvbnNcbiAgICBjb25zdCBjb252ZXJzYXRpb25UYWJsZSA9IG5ldyBkeW5hbW9kYi5UYWJsZSh0aGlzLCAnQ29udmVyc2F0aW9uVGFibGUnLCB7XG4gICAgICB0YWJsZU5hbWU6IGNvbmZpZy5keW5hbW9kYi50YWJsZU5hbWUsXG4gICAgICBwYXJ0aXRpb25LZXk6IHsgbmFtZTogJ3Nlc3Npb25JZCcsIHR5cGU6IGR5bmFtb2RiLkF0dHJpYnV0ZVR5cGUuU1RSSU5HIH0sXG4gICAgICBiaWxsaW5nTW9kZTogZHluYW1vZGIuQmlsbGluZ01vZGUuUEFZX1BFUl9SRVFVRVNULFxuICAgICAgdGltZVRvTGl2ZUF0dHJpYnV0ZTogJ3R0bCcsXG4gICAgfSk7XG5cbiAgICAvLyBMYW1iZGEgUm9sZVxuICAgIGNvbnN0IGxhbWJkYVJvbGUgPSBuZXcgaWFtLlJvbGUodGhpcywgXCJMYW1iZGFFeGVjdXRpb25Sb2xlXCIsIHtcbiAgICAgIGFzc3VtZWRCeTogbmV3IGlhbS5TZXJ2aWNlUHJpbmNpcGFsKFwibGFtYmRhLmFtYXpvbmF3cy5jb21cIiksXG4gICAgICBtYW5hZ2VkUG9saWNpZXM6IFtpYW0uTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoXCJzZXJ2aWNlLXJvbGUvQVdTTGFtYmRhQmFzaWNFeGVjdXRpb25Sb2xlXCIpXSxcbiAgICAgIGlubGluZVBvbGljaWVzOiB7XG4gICAgICAgIFFCdXNpbmVzc0FjY2VzczogbmV3IGlhbS5Qb2xpY3lEb2N1bWVudCh7XG4gICAgICAgICAgc3RhdGVtZW50czogW1xuICAgICAgICAgICAgbmV3IGlhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgICAgICAgICBhY3Rpb25zOiBbXG4gICAgICAgICAgICAgICAgXCJxYnVzaW5lc3M6Q2hhdFN5bmNcIixcbiAgICAgICAgICAgICAgICBcInFidXNpbmVzczpDaGF0XCIsXG4gICAgICAgICAgICAgICAgXCJxYnVzaW5lc3M6R2V0QXBwbGljYXRpb25cIixcbiAgICAgICAgICAgICAgICBcInFidXNpbmVzczpMaXN0QXBwbGljYXRpb25zXCIsXG4gICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgIHJlc291cmNlczogW1wiKlwiXSxcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgbmV3IGlhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgICAgICAgICBhY3Rpb25zOiBbXCJzZXM6U2VuZEVtYWlsXCIsIFwic2VzOlNlbmRSYXdFbWFpbFwiXSxcbiAgICAgICAgICAgICAgcmVzb3VyY2VzOiBbXCIqXCJdLFxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBuZXcgaWFtLlBvbGljeVN0YXRlbWVudCh7XG4gICAgICAgICAgICAgIGFjdGlvbnM6IFtcInRyYW5zbGF0ZTpUcmFuc2xhdGVUZXh0XCJdLFxuICAgICAgICAgICAgICByZXNvdXJjZXM6IFtcIipcIl0sXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICBdLFxuICAgICAgICB9KSxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICAvLyBHcmFudCBEeW5hbW9EQiBwZXJtaXNzaW9uc1xuICAgIGNvbnZlcnNhdGlvblRhYmxlLmdyYW50UmVhZFdyaXRlRGF0YShsYW1iZGFSb2xlKTtcblxuICAgIC8vIExhbWJkYSBGdW5jdGlvbnNcbiAgICBjb25zdCBjaGF0TGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnQ2hhdExhbWJkYUZ1bmN0aW9uJywge1xuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXG4gICAgICBoYW5kbGVyOiAnaW5kZXguaGFuZGxlcicsXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQocGF0aC5qb2luKF9fZGlybmFtZSwgJy4uL2xhbWJkYS9jaGF0JykpLFxuICAgICAgcm9sZTogbGFtYmRhUm9sZSxcbiAgICAgIHRpbWVvdXQ6IGNkay5EdXJhdGlvbi5zZWNvbmRzKGNvbmZpZy5sYW1iZGEudGltZW91dCksXG4gICAgICBtZW1vcnlTaXplOiBjb25maWcubGFtYmRhLm1lbW9yeVNpemUsXG4gICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICBRQlVTSU5FU1NfQVBQTElDQVRJT05fSUQ6IGFwcGxpY2F0aW9uSWQgfHwgcUJ1c2luZXNzQXBwLmF0dHJBcHBsaWNhdGlvbklkLFxuICAgICAgICBEWU5BTU9EQl9UQUJMRV9OQU1FOiBjb252ZXJzYXRpb25UYWJsZS50YWJsZU5hbWUsXG4gICAgICAgIEFXU19SRUdJT046IHRoaXMucmVnaW9uLFxuICAgICAgfSxcbiAgICB9KTtcblxuICAgIGNvbnN0IGVtYWlsTGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnRW1haWxMYW1iZGFGdW5jdGlvbicsIHtcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxuICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KHBhdGguam9pbihfX2Rpcm5hbWUsICcuLi9sYW1iZGEvZW1haWwnKSksXG4gICAgICByb2xlOiBsYW1iZGFSb2xlLFxuICAgICAgdGltZW91dDogY2RrLkR1cmF0aW9uLnNlY29uZHMoY29uZmlnLmxhbWJkYS50aW1lb3V0KSxcbiAgICAgIG1lbW9yeVNpemU6IGNvbmZpZy5sYW1iZGEubWVtb3J5U2l6ZSxcbiAgICAgIGVudmlyb25tZW50OiB7XG4gICAgICAgIFNPVVJDRV9FTUFJTDogc291cmNlRW1haWwsXG4gICAgICAgIERFU1RJTkFUSU9OX0VNQUlMOiBkZXN0aW5hdGlvbkVtYWlsLFxuICAgICAgICBBV1NfUkVHSU9OOiB0aGlzLnJlZ2lvbixcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICBjb25zdCBjb252ZXJzYXRpb25MYW1iZGEgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdDb252ZXJzYXRpb25MYW1iZGFGdW5jdGlvbicsIHtcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxuICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KHBhdGguam9pbihfX2Rpcm5hbWUsICcuLi9sYW1iZGEvY29udmVyc2F0aW9uJykpLFxuICAgICAgcm9sZTogbGFtYmRhUm9sZSxcbiAgICAgIHRpbWVvdXQ6IGNkay5EdXJhdGlvbi5zZWNvbmRzKGNvbmZpZy5sYW1iZGEudGltZW91dCksXG4gICAgICBtZW1vcnlTaXplOiBjb25maWcubGFtYmRhLm1lbW9yeVNpemUsXG4gICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICBEWU5BTU9EQl9UQUJMRV9OQU1FOiBjb252ZXJzYXRpb25UYWJsZS50YWJsZU5hbWUsXG4gICAgICAgIEFXU19SRUdJT046IHRoaXMucmVnaW9uLFxuICAgICAgfSxcbiAgICB9KTtcblxuICAgIGNvbnN0IHRyYW5zbGF0aW9uTGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnVHJhbnNsYXRpb25MYW1iZGFGdW5jdGlvbicsIHtcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxuICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KHBhdGguam9pbihfX2Rpcm5hbWUsICcuLi9sYW1iZGEvdHJhbnNsYXRpb24nKSksXG4gICAgICByb2xlOiBsYW1iZGFSb2xlLFxuICAgICAgdGltZW91dDogY2RrLkR1cmF0aW9uLnNlY29uZHMoY29uZmlnLmxhbWJkYS50aW1lb3V0KSxcbiAgICAgIG1lbW9yeVNpemU6IGNvbmZpZy5sYW1iZGEubWVtb3J5U2l6ZSxcbiAgICAgIGVudmlyb25tZW50OiB7XG4gICAgICAgIEFXU19SRUdJT046IHRoaXMucmVnaW9uLFxuICAgICAgfSxcbiAgICB9KTtcblxuICAgIC8vIEFQSSBHYXRld2F5XG4gICAgY29uc3QgYXBpID0gbmV3IGFwaWdhdGV3YXkuUmVzdEFwaSh0aGlzLCAnQW1hem9uUUJ1c2luZXNzQVBJJywge1xuICAgICAgcmVzdEFwaU5hbWU6ICdBbWF6b25RQnVzaW5lc3NBUEknLFxuICAgICAgZGVzY3JpcHRpb246ICdBUEkgZm9yIEFtYXpvbiBRIEJ1c2luZXNzIEludGVncmF0aW9uJyxcbiAgICAgIGRlZmF1bHRDb3JzUHJlZmxpZ2h0T3B0aW9uczoge1xuICAgICAgICBhbGxvd09yaWdpbnM6IGFwaWdhdGV3YXkuQ29ycy5BTExfT1JJR0lOUyxcbiAgICAgICAgYWxsb3dNZXRob2RzOiBhcGlnYXRld2F5LkNvcnMuQUxMX01FVEhPRFMsXG4gICAgICAgIGFsbG93SGVhZGVyczogWydDb250ZW50LVR5cGUnLCAnWC1BbXotRGF0ZScsICdBdXRob3JpemF0aW9uJywgJ1gtQXBpLUtleSddLFxuICAgICAgfSxcbiAgICB9KTtcblxuICAgIC8vIEFQSSBSZXNvdXJjZXMgYW5kIE1ldGhvZHNcbiAgICBjb25zdCBjaGF0UmVzb3VyY2UgPSBhcGkucm9vdC5hZGRSZXNvdXJjZSgnY2hhdCcpO1xuICAgIGNoYXRSZXNvdXJjZS5hZGRNZXRob2QoJ1BPU1QnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihjaGF0TGFtYmRhKSk7XG4gICAgXG4gICAgY29uc3QgZW1haWxSZXNvdXJjZSA9IGFwaS5yb290LmFkZFJlc291cmNlKCdlbWFpbCcpO1xuICAgIGVtYWlsUmVzb3VyY2UuYWRkTWV0aG9kKCdQT1NUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oZW1haWxMYW1iZGEpKTtcbiAgICBcbiAgICBjb25zdCBjb252ZXJzYXRpb25SZXNvdXJjZSA9IGFwaS5yb290LmFkZFJlc291cmNlKCdjb252ZXJzYXRpb24nKTtcbiAgICBjb252ZXJzYXRpb25SZXNvdXJjZS5hZGRNZXRob2QoJ0dFVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGNvbnZlcnNhdGlvbkxhbWJkYSkpO1xuICAgIFxuICAgIGNvbnN0IHRyYW5zbGF0ZVJlc291cmNlID0gYXBpLnJvb3QuYWRkUmVzb3VyY2UoJ3RyYW5zbGF0ZScpO1xuICAgIHRyYW5zbGF0ZVJlc291cmNlLmFkZE1ldGhvZCgnUE9TVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKHRyYW5zbGF0aW9uTGFtYmRhKSk7XG5cbiAgICAvLyBPdXRwdXRzXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0FwaUVuZHBvaW50Jywge1xuICAgICAgdmFsdWU6IGFwaS51cmwsXG4gICAgICBkZXNjcmlwdGlvbjogJ0FQSSBHYXRld2F5IGVuZHBvaW50IFVSTCcsXG4gICAgfSk7XG5cbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnQ2hhdEVuZHBvaW50Jywge1xuICAgICAgdmFsdWU6IGAke2FwaS51cmx9Y2hhdGAsXG4gICAgICBkZXNjcmlwdGlvbjogJ0NoYXQgQVBJIGVuZHBvaW50IFVSTCcsXG4gICAgfSk7XG5cbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnRW1haWxFbmRwb2ludCcsIHtcbiAgICAgIHZhbHVlOiBgJHthcGkudXJsfWVtYWlsYCxcbiAgICAgIGRlc2NyaXB0aW9uOiAnRW1haWwgY29sbGVjdGlvbiBlbmRwb2ludCBVUkwnLFxuICAgIH0pO1xuXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0NvbnZlcnNhdGlvbkVuZHBvaW50Jywge1xuICAgICAgdmFsdWU6IGAke2FwaS51cmx9Y29udmVyc2F0aW9uYCxcbiAgICAgIGRlc2NyaXB0aW9uOiAnQ29udmVyc2F0aW9uIHJldHJpZXZhbCBlbmRwb2ludCBVUkwnLFxuICAgIH0pO1xuXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ1RyYW5zbGF0ZUVuZHBvaW50Jywge1xuICAgICAgdmFsdWU6IGAke2FwaS51cmx9dHJhbnNsYXRlYCxcbiAgICAgIGRlc2NyaXB0aW9uOiAnVHJhbnNsYXRpb24gZW5kcG9pbnQgVVJMJyxcbiAgICB9KTtcblxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdRQnVzaW5lc3NBcHBsaWNhdGlvbklkJywge1xuICAgICAgdmFsdWU6IHFCdXNpbmVzc0FwcC5hdHRyQXBwbGljYXRpb25JZCxcbiAgICAgIGRlc2NyaXB0aW9uOiAnUSBCdXNpbmVzcyBBcHBsaWNhdGlvbiBJRCcsXG4gICAgfSk7XG5cbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnUUJ1c2luZXNzSW5kZXhJZCcsIHtcbiAgICAgIHZhbHVlOiBxQnVzaW5lc3NJbmRleC5hdHRySW5kZXhJZCxcbiAgICAgIGRlc2NyaXB0aW9uOiAnUSBCdXNpbmVzcyBJbmRleCBJRCcsXG4gICAgfSk7XG5cbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnRHluYW1vREJUYWJsZU5hbWUnLCB7XG4gICAgICB2YWx1ZTogY29udmVyc2F0aW9uVGFibGUudGFibGVOYW1lLFxuICAgICAgZGVzY3JpcHRpb246ICdEeW5hbW9EQiB0YWJsZSBuYW1lIGZvciBjb252ZXJzYXRpb25zJyxcbiAgICB9KTtcbiAgfVxufSJdfQ==