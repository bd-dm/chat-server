import { Field, ObjectType } from 'type-graphql';
import {
  Column, Entity, ManyToOne, OneToMany, RelationId,
} from 'typeorm';

import { BaseEntityId } from '@/entities/BaseEntity';
import { ChatAttachment } from '@/entities/ChatAttachment';

import { IPaginatorResult } from '@/definitions/pagination';
import { IS3ObjectKind } from '@/definitions/s3';

import { S3 } from '@/lib/classes/S3';

import { FileUri, PaginatedPageMeta } from '@/api/graphql/objectTypes';

import awsConfig from '@/configs/awsConfig';

import { BaseEntity, ChatRoom, User } from '@/entities';

@ObjectType()
@Entity()
export class ChatMessage extends BaseEntity {
  @Field(() => String)
  @Column()
  text: string;

  @RelationId((chatMessage: ChatMessage) => chatMessage.chatRoom)
  authorId?: string;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.chatMessages)
  author?: User;

  @RelationId((chatMessage: ChatMessage) => chatMessage.chatRoom)
  chatRoomId?: string;

  @Field(() => BaseEntityId)
  @ManyToOne(() => ChatRoom, (chatRoom) => chatRoom.chatMessages)
  chatRoom?: ChatRoom;

  @RelationId((chatMessage: ChatMessage) => chatMessage.chatAttachments)
  chatAttachmentIds?: string[];

  @Field(() => [FileUri])
  async attachments(): Promise<FileUri[]> {
    const attachments = this.chatAttachments;
    const files: FileUri[] = [];

    const s3 = new S3(awsConfig);
    for (let i = 0; i < attachments.length; i++) {
      const object = await s3.getObject(IS3ObjectKind.ATTACHMENT, attachments[i].id);

      files.push({
        id: attachments[i].id,
        uri: object.uri,
        mime: object.mime,
      });
    }

    return files;
  }

  @OneToMany(() => ChatAttachment, (chatAttachment) => chatAttachment.chatMessage, {
    cascade: true,
    eager: true,
  })
  chatAttachments: ChatAttachment[];
}

@ObjectType()
export class ChatMessagePaginated implements IPaginatorResult<ChatMessage> {
  @Field(() => [ChatMessage])
  data: ChatMessage[];

  @Field(() => PaginatedPageMeta)
  pageMeta: PaginatedPageMeta;
}
