import { getRepository, Repository } from 'typeorm';

import { IS3ObjectKind } from '@/definitions/s3';

import { S3 } from '@/lib/classes/S3';
import Service from '@/lib/classes/Service';

import { FileUri } from '@/api/graphql/objectTypes';

import awsConfig from '@/configs/awsConfig';

import { ChatAttachment } from '@/entities';

export default class ChatAttachmentService extends Service<ChatAttachment> {
  constructor(repository: Repository<ChatAttachment> = getRepository(ChatAttachment)) {
    super(repository);
  }

  async get(id: string): Promise<ChatAttachment> {
    return this.repository.findOne({ id });
  }

  async hasUserRights(userId: string, chatAttachmentId: string): Promise<boolean> {
    const attachment = await this.repository.findOne({ id: chatAttachmentId }, { relations: ['user'] });
    return attachment.user.id === userId;
  }

  async isAttachedToMessage(chatAttachmentId: string): Promise<boolean> {
    const prevChatAttachment = await this.repository.findOne({
      id: chatAttachmentId,
    }, { relations: ['chatMessage'] });

    return !!prevChatAttachment.chatMessage;
  }

  async attachToMessage(messageId: string, chatAttachmentId: string): Promise<boolean> {
    const isAttachedToMessage = await this.isAttachedToMessage(chatAttachmentId);
    if (isAttachedToMessage) {
      return false;
    }

    const chatAttachment = await this.repository.save({
      id: chatAttachmentId,
      chatMessage: {
        id: messageId,
      },
    });

    return !!chatAttachment;
  }

  async create(userId: string): Promise<FileUri> {
    const chatAttachment = await this.repository.save({
      user: {
        id: userId,
      },
    });

    const s3 = new S3(awsConfig);
    const uri = await s3.getUploadUri(IS3ObjectKind.ATTACHMENT, chatAttachment.id);

    const { id } = chatAttachment;

    return {
      id,
      uri,
    };
  }
}
