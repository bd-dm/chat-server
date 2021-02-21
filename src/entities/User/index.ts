import { Field, ObjectType } from 'type-graphql';
import {
  Column, Entity, ManyToMany, OneToMany,
} from 'typeorm';

import { BaseEntity, ChatMessage, ChatRoom } from '@/entities';

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field()
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @ManyToMany(() => ChatRoom, (chatRoom) => chatRoom.users)
  chatRooms: ChatRoom;

  @OneToMany(() => ChatMessage, (chatMessage) => chatMessage.author)
  chatMessages: ChatRoom;
}
