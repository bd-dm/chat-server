import { Field, ObjectType } from 'type-graphql';
import {
  Column,
  Entity,
  OneToMany,
} from 'typeorm';

import { UserToChatRoom } from '@/entities/User/UserToChatRoom';

import { BaseEntity, ChatMessage } from '@/entities';

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field(() => String)
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  socketId?: string;

  @OneToMany(() => UserToChatRoom, (userToChatRoom) => userToChatRoom.user)
  userToChatRooms?: UserToChatRoom[];

  @OneToMany(() => ChatMessage, (chatMessage) => chatMessage.author)
  chatMessages?: ChatMessage[];
}
