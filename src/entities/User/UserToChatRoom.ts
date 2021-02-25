import { Field, ObjectType } from 'type-graphql';
import {
  Column,
  Entity,
  ManyToOne,
} from 'typeorm';

import { BaseEntity, ChatRoom, User } from '@/entities';

export enum IUserToChatRoomRole {
  CREATOR = 'CREATOR',
  MEMBER = 'MEMBER',
}

@ObjectType()
@Entity()
export class UserToChatRoom extends BaseEntity {
  @Field(() => String)
  @Column()
  userId: string;

  @Field(() => String)
  @Column()
  chatRoomId: string;

  @Field(() => String)
  @Column({ default: IUserToChatRoomRole.MEMBER })
  role: IUserToChatRoomRole;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.userToChatRooms)
  user?: User;

  @Field(() => ChatRoom)
  @ManyToOne(() => ChatRoom, (chatRoom) => chatRoom.userToChatRooms)
  chatRoom?: ChatRoom;
}
