export declare const config: {
    aws: {
        region: string;
    };
    qbusiness: {
        applicationId: string;
    };
    email: {
        sourceEmail: string;
        destinationEmail: string;
    };
    dynamodb: {
        tableName: string;
        ttlDays: number;
    };
    lambda: {
        timeout: number;
        memorySize: number;
        runtime: string;
    };
};
