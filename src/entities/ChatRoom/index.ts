import {
  Field,
  ObjectType,
} from 'type-graphql';
import {
  Column,
  Entity,
  OneToMany,
  RelationId,
} from 'typeorm';

import { UserToChatRoom } from '@/entities/User/UserToChatRoom';

import { BaseEntity, ChatMessage } from '@/entities';

@ObjectType()
@Entity()
export class ChatRoom extends BaseEntity {
  @Field(() => String)
  @Column()
  name: string;

  @Field(() => [UserToChatRoom])
  @OneToMany(() => UserToChatRoom, (userToChatRoom) => userToChatRoom.chatRoom)
  userToChatRooms?: UserToChatRoom[];

  @Field(() => [String])
  @RelationId((chatRoom: ChatRoom) => chatRoom.chatMessages)
  chatMessageIds?: string[]

  @Field(() => [ChatMessage])
  @OneToMany(() => ChatMessage, (chatMessage) => chatMessage.chatRoom)
  chatMessages?: ChatMessage[];
}
