#!/usr/bin/env node
import "source-map-support/register"
import * as cdk from "aws-cdk-lib"
import { CrohnsColitisStack } from "../lib/catholic-charities-stack"

const app = new cdk.App()

// Get parameters from context or environment variables
const githubUrl = app.node.tryGetContext("githubUrl") || process.env.GITHUB_URL
const projectName = app.node.tryGetContext("projectName") || process.env.PROJECT_NAME 
const urlFilesPath = app.node.tryGetContext("urlFilesPath") || process.env.URL_FILES_PATH 
const amplifyAppName = app.node.tryGetContext("amplifyAppName") || process.env.AMPLIFY_APP_NAME
const amplifyBranchName = app.node.tryGetContext("amplifyBranchName") || process.env.AMPLIFY_BRANCH_NAME


new CrohnsColitisStack(app, "CrohnsColitisStack", {
  githubUrl,
  projectName,
  urlFilesPath,
  amplifyAppName,
  amplifyBranchName,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
})
