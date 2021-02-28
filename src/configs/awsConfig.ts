import { IAwsConfig } from '@/definitions/s3';

const awsConfig: IAwsConfig = {
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  getUrlExpires: 60 * 60 * 2,
  buckets: {
    attachments: process.env.AWS_BUCKET_ATTACHMENTS,
  },
};

export default awsConfig;
