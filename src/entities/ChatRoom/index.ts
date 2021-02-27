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

import { BaseEntity, ChatMessage, User } from '@/entities';

@ObjectType()
@Entity()
export class ChatRoom extends BaseEntity {
  @Field(() => String)
  @Column()
  name: string;

  @OneToMany(() => UserToChatRoom, (userToChatRoom) => userToChatRoom.chatRoom)
  userToChatRooms?: UserToChatRoom[];

  @Field(() => [User])
  users(): User[] {
    return this.userToChatRooms.map((userToChatRooms) => userToChatRooms.user);
  }

  @RelationId((chatRoom: ChatRoom) => chatRoom.chatMessages)
  chatMessageIds?: string[]

  @OneToMany(() => ChatMessage, (chatMessage) => chatMessage.chatRoom)
  chatMessages?: ChatMessage[];
}
