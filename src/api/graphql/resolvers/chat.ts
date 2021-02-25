import {
  ArrayMinSize, IsString, IsUUID, MinLength,
} from 'class-validator';
import {
  Arg, Authorized, Ctx, Field, InputType, Mutation, Query, Resolver,
} from 'type-graphql';

import { IUserToChatRoomRole } from '@/entities/User/UserToChatRoom';

import ChatMessageService from '@/services/ChatMessageService';
import ChatRoomService from '@/services/ChatRoomService';

import { IContext } from '@/definitions';
import { ChatMessage, ChatRoom } from '@/entities';

@InputType()
export class ChatCreateInput {
  @Field()
  @MinLength(3)
  name: string;

  @Field(() => [String])
  @ArrayMinSize(1)
  @IsString({ each: true })
  userIds: string[];
}

@InputType()
export class ChatSendMessageInput {
  @Field()
  @IsUUID()
  chatRoomId: string;

  @Field()
  @MinLength(3)
  text: string;
}

@Resolver()
export default class ChatResolver {
  @Authorized()
  @Query(() => [ChatRoom])
  async chatGetList(@Ctx() ctx: IContext) {
    const chatRoomService = new ChatRoomService();
    return chatRoomService.getByUser(ctx.user.id);
  }

  @Authorized()
  @Mutation(() => ChatRoom)
  async chatCreate(
    @Arg('data') data: ChatCreateInput,
    @Ctx() ctx: IContext,
  ): Promise<ChatRoom> {
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

  @Authorized()
  @Mutation(() => ChatMessage)
  async chatSendMessage(
    @Arg('data') data: ChatSendMessageInput,
    @Ctx() ctx: IContext,
  ): Promise<ChatMessage> {
    const chatMessageService = new ChatMessageService();
    return chatMessageService.create(ctx.user.id, data);
  }
}
