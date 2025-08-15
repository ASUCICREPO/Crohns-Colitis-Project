const { DynamoDBClient, GetItemCommand } = require('@aws-sdk/client-dynamodb');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key',
    'Access-Control-Allow-Methods': 'OPTIONS,GET'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const sessionId = event.queryStringParameters?.sessionId;
    if (!sessionId) {
      throw new Error('Session ID is required');
    }

    const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });
    const result = await dynamoClient.send(new GetItemCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: { sessionId: { S: sessionId } }
    }));

    const conversation = result.Item ? {
      conversationId: result.Item.conversationId?.S || '',
      lastSystemMessageId: result.Item.lastSystemMessageId?.S || '',
      chatHistory: result.Item.chatHistory?.S ? JSON.parse(result.Item.chatHistory.S) : [],
      lastUpdated: result.Item.lastUpdated?.N || ''
    } : null;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ conversation })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};