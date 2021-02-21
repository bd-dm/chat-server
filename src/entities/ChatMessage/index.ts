import {
  Field,
  ObjectType,
} from 'type-graphql';
import {
  Column,
  Entity,
  ManyToOne,
} from 'typeorm';

import { BaseEntity, ChatRoom, User } from '@/entities';

@ObjectType()
@Entity()
export class ChatMessage extends BaseEntity {
  @Field()
  @Column()
  name: string;

  @Field()
  @Column()
  text: string;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.chatMessages)
  author: User;

  @ManyToOne(() => ChatRoom, (chatRoom) => chatRoom.chatMessages)
  chatRoom: ChatRoom;
}
