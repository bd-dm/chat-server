import {
  Field,
  ObjectType,
} from 'type-graphql';
import {
  Column,
  Entity,
  ManyToOne,
  RelationId,
} from 'typeorm';

import { BaseEntity, ChatRoom, User } from '@/entities';

@ObjectType()
@Entity()
export class ChatMessage extends BaseEntity {
  @Field(() => String)
  @Column()
  text: string;

  @RelationId((chatMessage:ChatMessage) => chatMessage.chatRoom)
  authorId?: string;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.chatMessages)
  author?: User;

  @RelationId((chatMessage:ChatMessage) => chatMessage.chatRoom)
  chatRoomId?: string;

  @Field(() => ChatRoom)
  @ManyToOne(() => ChatRoom, (chatRoom) => chatRoom.chatMessages)
  chatRoom?: ChatRoom;
}
