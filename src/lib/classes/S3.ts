import { IAwsConfig, IAwsObject, IS3ObjectKind } from '@/definitions/s3';

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

  constructor(awsConfig: IAwsConfig) {
    this.awsConfig = awsConfig;

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

  private async getPresignedUri(command: PutObjectCommand | GetObjectCommand) {
    const signedRequest = new S3RequestPresigner(this.client.config);

    const request = await createRequest(
      this.client,
      command,
    );

    return formatUrl(
      await signedRequest.presign(
        request,
        {
          expiresIn: 60 * 60 * 2,
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
    const head = await this.getObjectHead(objectKind, objectId);

    const uri = await this.getPresignedUri(
      new GetObjectCommand(
        this.getClientParams(
          objectKind,
          objectId,
        ),
      ),
    );

    return {
      uri,
      mime: head.ContentType,
    };
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
