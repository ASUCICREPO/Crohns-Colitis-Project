import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
export interface QBusinessStackProps extends cdk.StackProps {
    applicationId?: string;
    sourceEmail?: string;
    destinationEmail?: string;
}
export declare class QBusinessStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: QBusinessStackProps);
}
