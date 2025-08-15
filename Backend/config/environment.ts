export const config = {
  aws: {
    region: 'us-west-2',
  },
  qbusiness: {
    applicationId: process.env.QBUSINESS_APPLICATION_ID || '',
  },
  email: {
    sourceEmail: process.env.SOURCE_EMAIL || 'rajuhemanth456@gmail.com',
    destinationEmail: process.env.DESTINATION_EMAIL || 'hkoneti@asu.edu',
  },
  dynamodb: {
    tableName: `CrohnsColitisChat-${Date.now()}`,
    ttlDays: 30,
  },
  lambda: {
    timeout: 30,
    memorySize: 256,
    runtime: 'nodejs18.x',
  },
};