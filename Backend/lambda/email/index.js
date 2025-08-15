const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key',
    'Access-Control-Allow-Methods': 'OPTIONS,POST'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const body = JSON.parse(event.body);
    const { email, firstName, lastName, phone, question, conversationId, chatHistory, ccEmail } = body;

    console.log('Received request:', { email, firstName, lastName, phone, question, conversationId, chatHistoryLength: chatHistory?.length || 0 });

    if (!email || !question || !firstName || !lastName) {
      throw new Error('Email, first name, last name, and question are required');
    }

    const client = new SESClient({ region: process.env.AWS_REGION });
    const timestamp = new Date().toISOString();
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Process chat history for email
    const conversationText = chatHistory && chatHistory.length > 0 
      ? chatHistory.map((msg, index) => {
          const sender = msg.sentBy === 'USER' ? 'User' : 'Assistant';
          const message = msg.message || '';
          return `${index + 1}. ${sender}: ${message}`;
        }).join('\n\n')
      : 'No conversation history available';

    // Create email content
    const fullName = `${firstName} ${lastName}`;
    const emailSubject = `Follow-up Request from ${fullName} - ${question.substring(0, 40)}...`;
    const emailBody = `Follow-up Request Details:

User Name: ${fullName}
User Email: ${email}
User Phone: ${phone || 'Not provided'}
Original Question: ${question}
Conversation ID: ${conversationId || 'N/A'}
Timestamp: ${timestamp}
Request ID: ${requestId}

--- FULL CONVERSATION HISTORY ---

${conversationText}

--- END OF CONVERSATION ---`;

    console.log('Email content prepared');

    const emailParams = {
      Source: process.env.SOURCE_EMAIL,
      Destination: {
        ToAddresses: [process.env.DESTINATION_EMAIL],
        CcAddresses: [email]
      },
      Message: {
        Subject: {
          Data: emailSubject,
          Charset: 'UTF-8'
        },
        Body: {
          Text: {
            Data: emailBody,
            Charset: 'UTF-8'
          }
        }
      }
    };

    console.log('Sending email via SES');

    const sesResponse = await client.send(new SendEmailCommand(emailParams));
    console.log('SES Response successful:', sesResponse.MessageId);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, requestId, messageId: sesResponse.MessageId })
    };
  } catch (error) {
    console.error('Email function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message, stack: error.stack })
    };
  }
};