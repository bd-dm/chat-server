import {
  Field,
  ObjectType,
} from 'type-graphql';
import {
  Column,
  Entity,
  ManyToOne, RelationId,
} from 'typeorm';

import { BaseEntity, ChatMessage, User } from '@/entities';

@ObjectType()
@Entity()
export class ChatAttachment extends BaseEntity {
  @Field()
  @Column()
  name: string;

  @ManyToOne(() => User, (user) => user.chatAttachments)
  user: User;

  @RelationId((chatAttachment: ChatAttachment) => chatAttachment.chatMessage)
  chatMessageId?: string;

  @ManyToOne(() => ChatMessage, (chatMessage) => chatMessage.chatAttachments)
  chatMessage: ChatMessage;
}
