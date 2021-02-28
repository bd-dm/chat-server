import { IAwsConfig, IAwsObject, IS3ObjectKind } from '@/definitions/s3';

import RedisClient from '@/lib/classes/RedisClient';
import { ServerError } from '@/lib/utils';

import {
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { S3RequestPresigner } from '@aws-sdk/s3-request-presigner';
import { createRequest } from '@aws-sdk/util-create-request';
import { formatUrl } from '@aws-sdk/util-format-url';

export class S3 {
  private awsConfig: IAwsConfig;

  private readonly client: S3Client;

  constructor(config: IAwsConfig) {
    this.awsConfig = config;

    this.client = this.getS3Client();
  }

  private getS3Client() {
    return new S3Client({
      region: this.awsConfig.region,
      credentials: {
        accessKeyId: this.awsConfig.accessKeyId,
        secretAccessKey: this.awsConfig.secretAccessKey,
      },
    });
  }

  private getClientParams(objectKind: IS3ObjectKind, objectId: string) {
    let bucketName = '';

    switch (objectKind) {
      case IS3ObjectKind.ATTACHMENT:
        bucketName = this.awsConfig.buckets.attachments;
        break;
      default:
        throw new ServerError(70);
    }

    return {
      Bucket: bucketName,
      Key: `object-${objectKind}-${objectId}`,
      ContentType: 'application/octet-stream',
    };
  }

  private async getPresignedUri(command: PutObjectCommand | GetObjectCommand): Promise<string> {
    const signedRequest = new S3RequestPresigner(this.client.config);

    const request = await createRequest(
      this.client,
      command,
    );

    return formatUrl(
      await signedRequest.presign(
        request,
        {
          expiresIn: this.awsConfig.getUrlExpires,
        },
      ),
    );
  }

  private async getObjectHead(
    objectKind: IS3ObjectKind,
    objectId: string,
  ) {
    return this.client.send(
      new HeadObjectCommand(
        this.getClientParams(
          objectKind,
          objectId,
        ),
      ),
    );
  }

  async getUploadUri(
    objectKind: IS3ObjectKind,
    objectId: string,
  ) {
    return this.getPresignedUri(
      new PutObjectCommand(
        this.getClientParams(
          objectKind,
          objectId,
        ),
      ),
    );
  }

  async getObject(
    objectKind: IS3ObjectKind,
    objectId: string,
  ): Promise<IAwsObject> {
    try {
      const KEY = `aws-object-uri:${objectKind}-${objectId}`;

      const cachedValue = await RedisClient.get(KEY);

      let result = JSON.parse(cachedValue);

      if (!cachedValue) {
        const head = await this.getObjectHead(objectKind, objectId);

        const url = await this.getPresignedUri(
          new GetObjectCommand(
            this.getClientParams(
              objectKind,
              objectId,
            ),
          ),
        );

        result = {
          uri: url,
          mime: head.ContentType,
        };

        await RedisClient.set(KEY, JSON.stringify(result), this.awsConfig.getUrlExpires);
      }

      return result;
    } catch (e) {
      console.error(e);
    }
  }

  async isObjectExists(
    objectKind: IS3ObjectKind,
    objectId: string,
  ): Promise<boolean> {
    try {
      await this.getObjectHead(objectKind, objectId);

      return true;
    } catch (e) {
      return false;
    }
  }
}
