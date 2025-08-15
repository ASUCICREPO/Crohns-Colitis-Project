#!/bin/bash
# Create data sources for existing Amazon Q Business application

APP_ID="01f63a3e-5367-4e1b-a77c-94b0f83aecec"
INDEX_ID="436be91c-17ef-4c8e-aace-fabcb53e38e8"

# Create IAM role for data sources
ROLE_NAME="QBusinessDataSourceRole-$(date +%s)"
ROLE_ARN=$(aws iam create-role \
  --role-name "$ROLE_NAME" \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": {"Service": "qbusiness.amazonaws.com"},
      "Action": "sts:AssumeRole"
    }]
  }' \
  --query 'Role.Arn' \
  --output text)

# Create inline policy for web crawling
aws iam put-role-policy \
  --role-name "$ROLE_NAME" \
  --policy-name "WebCrawlerPolicy" \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Action": [
        "qbusiness:BatchPutDocument",
        "qbusiness:BatchDeleteDocument"
      ],
      "Resource": "*"
    }]
  }'

sleep 30

# Create web crawler data source
DATASOURCE_ID=$(aws qbusiness create-data-source \
  --application-id "$APP_ID" \
  --index-id "$INDEX_ID" \
  --display-name "CrohnsColitisCrawler" \
  --role-arn "$ROLE_ARN" \
  --configuration '{
    "type": "WEBCRAWLER",
    "version": "1.0.0",
    "syncMode": "FULL_CRAWL",
    "connectionConfiguration": {
      "repositoryEndpointMetadata": {
        "siteUrl": "https://www.crohnscolitisfoundation.org/"
      }
    },
    "repositoryConfigurations": {
      "webCrawler": {
        "urlConfiguration": {
          "seedUrls": [
            {"url": "https://www.crohnscolitisfoundation.org/"},
            {"url": "https://gastro.org/"},
            {"url": "https://www.crohnscolitiscommunity.org/"}
          ]
        },
        "crawlConfiguration": {
          "crawlDepth": 2,
          "maxLinksPerPage": 50
        }
      }
    }
  }' \
  --query 'dataSourceId' \
  --output text)

# Start sync
aws qbusiness start-data-source-sync-job \
  --application-id "$APP_ID" \
  --index-id "$INDEX_ID" \
  --data-source-id "$DATASOURCE_ID"

echo "Data Source ID: $DATASOURCE_ID"
echo "Sync started. Check status with:"
echo "aws qbusiness list-data-source-sync-jobs --application-id $APP_ID --index-id $INDEX_ID --data-source-id $DATASOURCE_ID"