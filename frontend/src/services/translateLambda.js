// Lambda function for Amazon Translate integration
// This should be deployed as a separate Lambda function

const AWS = require('aws-sdk');

const translate = new AWS.Translate({
  region: process.env.AWS_REGION || 'us-east-1'
});

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const { text, sourceLanguage, targetLanguage } = JSON.parse(event.body);

    if (!text || !sourceLanguage || !targetLanguage) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required parameters' })
      };
    }

    // Skip translation if source and target are the same
    if (sourceLanguage === targetLanguage) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ translatedText: text })
      };
    }

    const params = {
      Text: text,
      SourceLanguageCode: sourceLanguage,
      TargetLanguageCode: targetLanguage
    };

    const result = await translate.translateText(params).promise();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        translatedText: result.TranslatedText,
        sourceLanguage: result.SourceLanguageCode,
        targetLanguage: result.TargetLanguageCode
      })
    };

  } catch (error) {
    console.error('Translation error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Translation failed',
        message: error.message 
      })
    };
  }
};