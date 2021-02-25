import { ArrayMinSize, IsString, MinLength } from 'class-validator';
import {
  Arg, Authorized, Ctx, Field, InputType, Mutation, Query, Resolver,
} from 'type-graphql';

import { IUserToChatRoomRole } from '@/entities/User/UserToChatRoom';

import ChatRoomService from '@/services/ChatRoomService';

import { IContext } from '@/definitions';
import { ChatRoom } from '@/entities';

@InputType()
export class ChatRoomCreateInput {
  @Field()
  @MinLength(3)
  name: string;

  @Field(() => [String])
  @ArrayMinSize(1)
  @IsString({ each: true })
  userIds: string[];
}

@Resolver()
export default class ChatRoomResolver {
  @Authorized()
  @Query(() => [ChatRoom])
  async chatRoomGetList(@Ctx() ctx: IContext) {
    const chatRoomService = new ChatRoomService();
    return chatRoomService.getByUser(ctx.user.id);
  }

  @Authorized()
  @Mutation(() => ChatRoom)
  async chatRoomCreate(@Arg('data') data: ChatRoomCreateInput, @Ctx() ctx: IContext): Promise<ChatRoom> {
    const chatRoomService = new ChatRoomService();

    const userList = [
      {
        id: ctx.user.id,
        role: IUserToChatRoomRole.CREATOR,
      },
      ...data.userIds.map((id) => (
        {
          id,
          role: IUserToChatRoomRole.MEMBER,
        }
      )),
    ];

    const chatRoomBasic = await chatRoomService.create(data, userList);

    return chatRoomService.get(chatRoomBasic.id);
  }
}
