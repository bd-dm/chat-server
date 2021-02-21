import {
  Field,
  ObjectType,
} from 'type-graphql';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany, OneToMany, RelationId,
} from 'typeorm';

import { BaseEntity, ChatMessage, User } from '@/entities';

@ObjectType()
@Entity()
export class ChatRoom extends BaseEntity {
  @Field()
  @Column()
  name: string;

  @RelationId((chatRoom: ChatRoom) => chatRoom.users)
  usersIds: string[]

  @Field(() => [User])
  @ManyToMany(() => User, (user) => user.chatRooms)
  @JoinTable()
  users: User[];

  @RelationId((chatRoom: ChatRoom) => chatRoom.chatMessages)
  chatMessageIds: string[]

  @OneToMany(() => ChatMessage, (chatMessage) => chatMessage.chatRoom)
  chatMessages: ChatMessage[];
}
