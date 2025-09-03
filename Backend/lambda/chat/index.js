const { QBusinessClient, ChatSyncCommand } = require('@aws-sdk/client-qbusiness');
const { DynamoDBClient, PutItemCommand, GetItemCommand } = require('@aws-sdk/client-dynamodb');

exports.handler = async (event) => {
  try {
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key",
      "Access-Control-Allow-Methods": "OPTIONS,POST"
    };
    
    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 200, headers, body: '' };
    }
    
    const body = JSON.parse(event.body);
    const { message, conversationId, parentMessageId, sessionId } = body;
    
    const params = {
      applicationId: process.env.QBUSINESS_APPLICATION_ID,
      userMessage: message || body.userMessage
    };
    
    if (conversationId) params.conversationId = conversationId;
    if (parentMessageId) params.parentMessageId = parentMessageId;
    
    if (!params.applicationId || !params.userMessage) {
      throw new Error('Application ID and user message are required');
    }
    
    console.log('Calling QBusiness API with params:', JSON.stringify(params));
    
    const client = new QBusinessClient({ region: process.env.AWS_REGION });
    const cmd = new ChatSyncCommand(params);
    const response = await client.send(cmd);
    
    console.log('Response received:', JSON.stringify(response));
    
    // Store conversation in DynamoDB if sessionId provided
    if (sessionId) {
      try {
        const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });
        const ttl = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60);
        
        let chatHistory = [];
        try {
          const existingData = await dynamoClient.send(new GetItemCommand({
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Key: { sessionId: { S: sessionId } }
          }));
          if (existingData.Item && existingData.Item.chatHistory) {
            chatHistory = JSON.parse(existingData.Item.chatHistory.S);
          }
        } catch (getError) {
          console.log('No existing chat history found');
        }
        
        chatHistory.push({
          type: 'USER',
          message: message,
          timestamp: Date.now()
        });
        chatHistory.push({
          type: 'BOT',
          message: response.systemMessage || '',
          timestamp: Date.now(),
          conversationId: response.conversationId,
          systemMessageId: response.systemMessageId
        });
        
        await dynamoClient.send(new PutItemCommand({
          TableName: process.env.DYNAMODB_TABLE_NAME,
          Item: {
            sessionId: { S: sessionId },
            conversationId: { S: response.conversationId || "" },
            lastSystemMessageId: { S: response.systemMessageId || "" },
            chatHistory: { S: JSON.stringify(chatHistory) },
            lastUpdated: { N: Date.now().toString() },
            ttl: { N: ttl.toString() }
          }
        }));
      } catch (dbError) {
        console.error('DynamoDB error:', dbError);
      }
    }
    
    // Filter citations - only show website links, hide S3 document files
    let filteredSourceAttributions = [];
    if (response.sourceAttributions && response.sourceAttributions.length > 0) {
      filteredSourceAttributions = response.sourceAttributions.filter(source => {
        const url = source.url || '';
        const title = source.title || '';
        
        // Hide S3 document files (contains s3:// or amazonaws.com)
        const isS3Document = url.includes('s3://') || 
                            url.includes('amazonaws.com') ||
                            url.includes('s3.') ||
                            /\.(docx?|pdf|txt|rtf|pptx?)$/i.test(url) || 
                            /\.(docx?|pdf|txt|rtf|pptx?)$/i.test(title);
        
        // Show only website URLs (http/https but not S3)
        const isWebsiteUrl = (url.startsWith('http://') || url.startsWith('https://')) && 
                            !url.includes('amazonaws.com') && 
                            !url.includes('s3.');
        
        return !isS3Document && isWebsiteUrl;
      });
    }
    
    // Calculate confidence score
    let confidenceScore = 100;
    const systemMessage = response.systemMessage || '';
    const hasSourceAttributions = response.sourceAttributions && response.sourceAttributions.length > 0;
    
    if (!hasSourceAttributions) confidenceScore -= 30;
    
    const lowConfidenceIndicators = [
      'no answer is found', 'i don\'t have', 'i cannot find',
      'no information', 'unable to provide', 'not sure', 'i\'m sorry'
    ];
    
    const messageText = systemMessage.toLowerCase();
    const hasLowConfidenceIndicators = lowConfidenceIndicators.some(indicator => 
      messageText.includes(indicator)
    );
    
    if (hasLowConfidenceIndicators) confidenceScore -= 50;
    confidenceScore = Math.max(0, Math.min(100, confidenceScore));
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        ...response, 
        sourceAttributions: filteredSourceAttributions,
        confidenceScore 
      })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: error.message, stack: error.stack })
    };
  }
};