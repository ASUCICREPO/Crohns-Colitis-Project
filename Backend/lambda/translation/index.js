const { TranslateClient, TranslateTextCommand } = require('@aws-sdk/client-translate');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
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

    if (sourceLanguage === targetLanguage) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ translatedText: text })
      };
    }

    const client = new TranslateClient({ region: process.env.AWS_REGION });
    const params = {
      Text: text,
      SourceLanguageCode: sourceLanguage,
      TargetLanguageCode: targetLanguage
    };

    const result = await client.send(new TranslateTextCommand(params));

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