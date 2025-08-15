#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { QBusinessStack } from '../lib/qbusiness-stack';
import { config } from '../config/environment';

const app = new cdk.App();

new QBusinessStack(app, 'CrohnsColitisQBusinessStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || config.aws.region,
  },
  applicationId: config.qbusiness.applicationId,
  sourceEmail: config.email.sourceEmail,
  destinationEmail: config.email.destinationEmail,
});