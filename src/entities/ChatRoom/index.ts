import {
  Field,
  ObjectType,
} from 'type-graphql';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany, OneToMany,
} from 'typeorm';

import { BaseEntity, ChatMessage, User } from '@/entities';

@ObjectType()
@Entity()
export class ChatRoom extends BaseEntity {
  @Field()
  @Column()
  name: string;

  @Field(() => [User])
  @ManyToMany(() => User, (user) => user.chatRooms)
  @JoinTable()
  users: User[];

  @OneToMany(() => ChatMessage, (chatMessage) => chatMessage.chatRoom)
  chatMessages: ChatMessage[];
}
