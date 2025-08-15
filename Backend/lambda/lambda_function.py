import json
import boto3
import logging
from botocore.exceptions import ClientError
import os
from datetime import datetime

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize AWS clients
qbusiness_client = boto3.client('qbusiness')

def lambda_handler(event, context):
    """
    AWS Lambda function for Crohns Colitis Q Business chatbot
    - Stateless operation for simplicity
    - Anonymous access enabled
    - Returns simple response with sources
    """
    
    # Set CORS headers
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
    }
    
    try:
        # Handle preflight OPTIONS request
        if event.get('httpMethod') == 'OPTIONS':
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'message': 'CORS preflight successful'})
            }
        
        # Handle health check
        if event.get('httpMethod') == 'GET':
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({
                    'status': 'healthy',
                    'service': 'Crohns Colitis AI Assistant',
                    'timestamp': datetime.utcnow().isoformat()
                })
            }
        
        # Parse the request body
        if 'body' in event:
            if isinstance(event['body'], str):
                body = json.loads(event['body'])
            else:
                body = event['body']
        else:
            raise ValueError("Request body is missing")
        
        # Extract required parameters
        user_message = body.get('message', '').strip()
        
        if not user_message:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({
                    'error': 'Message is required',
                    'success': False
                })
            }
        
        # Get environment variables
        application_id = os.environ.get('QBUSINESS_APPLICATION_ID')
        
        if not application_id:
            raise ValueError("QBUSINESS_APPLICATION_ID environment variable is not set")
        
        logger.info(f"Processing message: {user_message}")
        logger.info(f"Application ID: {application_id}")
        
        # Prepare the request for Amazon Q Business
        chat_request = {
            'applicationId': application_id,
            'userMessage': user_message
            # No userId for anonymous access
            # No conversationId for stateless operation
        }
        
        logger.info("Calling Amazon Q Business API")
        
        # Call Amazon Q Business
        response = qbusiness_client.chat_sync(**chat_request)
        
        logger.info("Successfully received response from Amazon Q Business")
        logger.info(f"Response keys: {list(response.keys())}")
        
        # Extract the response
        bot_response = ""
        source_urls = []
        
        # Get the main system message
        if 'systemMessage' in response:
            bot_response = response['systemMessage']
            logger.info(f"System message length: {len(bot_response)}")
        
        # Extract URLs from source attributions
        if 'sourceAttributions' in response:
            logger.info(f"Found {len(response['sourceAttributions'])} source attributions")
            
            for attribution in response['sourceAttributions']:
                url = attribution.get('url', '').strip()
                if url:  # Only add non-empty URLs
                    source_urls.append(url)
            
            # Remove duplicates while preserving order
            source_urls = list(dict.fromkeys(source_urls))
            logger.info(f"Extracted {len(source_urls)} unique source URLs")
        
        # Prepare the response
        chat_response = {
            'success': True,
            'message': bot_response,
            'sources': source_urls,
            'timestamp': datetime.utcnow().isoformat(),
            'metadata': {
                'sourceCount': len(source_urls),
                'responseLength': len(bot_response),
                'applicationId': application_id
            }
        }
        
        logger.info(f"Prepared response with {len(source_urls)} source URLs")
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps(chat_response)
        }
        
    except ClientError as e:
        logger.error(f"AWS Client Error: {str(e)}")
        error_code = e.response['Error']['Code']
        error_message = e.response['Error']['Message']
        
        # Handle specific Q Business errors
        if error_code == 'AccessDeniedException':
            error_message = "Access denied to Q Business application. Please check permissions."
        elif error_code == 'ResourceNotFoundException':
            error_message = "Q Business application not found. Please check the application ID."
        elif error_code == 'ThrottlingException':
            error_message = "Request was throttled. Please try again later."
        elif error_code == 'ValidationException':
            error_message = f"Validation error: {error_message}"
        
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({
                'error': f"AWS Error ({error_code}): {error_message}",
                'success': False,
                'errorCode': error_code
            })
        }
        
    except ValueError as e:
        logger.error(f"Validation Error: {str(e)}")
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({
                'error': str(e),
                'success': False
            })
        }
        
    except Exception as e:
        logger.error(f"Unexpected Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({
                'error': 'Internal server error',
                'success': False,
                'details': str(e) if os.environ.get('DEBUG') == 'true' else None
            })
        }
