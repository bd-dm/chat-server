import {
  Field,
  ObjectType,
} from 'type-graphql';
import {
  Column,
  Entity,
  OneToMany,
} from 'typeorm';

import { UserToChatRoom } from '@/entities/User/UserToChatRoom';

import { BaseEntity, ChatMessage, User } from '@/entities';

@ObjectType()
@Entity()
export class ChatRoom extends BaseEntity {
  @Field(() => String)
  @Column({ length: 255 })
  name: string;

  @OneToMany(() => UserToChatRoom, (userToChatRoom) => userToChatRoom.chatRoom)
  userToChatRooms?: UserToChatRoom[];

  @Field(() => [User])
  users(): User[] {
    return this.userToChatRooms.map((userToChatRooms) => userToChatRooms.user);
  }

  @OneToMany(() => ChatMessage, (chatMessage) => chatMessage.chatRoom)
  chatMessages?: ChatMessage[];
}
