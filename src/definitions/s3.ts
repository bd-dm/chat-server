export enum IS3ObjectKind {
  ATTACHMENT = 'ATTACHMENT',
}

export interface IAwsConfig {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  getUrlExpires: number;
  buckets: {
    attachments: string;
  };
}

export interface IAwsObject {
  mime: string;
  uri: string;
}
