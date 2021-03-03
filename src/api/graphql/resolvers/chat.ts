import {
  ArrayMaxSize,
  ArrayMinSize,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  Arg,
  Authorized,
  Ctx,
  Field,
  InputType,
  Mutation,
  Query,
  Resolver,
} from 'type-graphql';

import { ChatMessagePaginated } from '@/entities/ChatMessage';
import { IUserToChatRoomRole } from '@/entities/User/UserToChatRoom';

import { IPaginatorResult } from '@/definitions/pagination';

import { PaginatedInput } from '@/api/graphql/inputTypes';
import { FileUri } from '@/api/graphql/objectTypes';

import ChatAttachmentService from '@/services/ChatAttachmentService';
import ChatMessageService from '@/services/ChatMessageService';
import ChatRoomService from '@/services/ChatRoomService';

import { CHAT_MESSAGE_ATTACHMENT } from '@/consts';
import { IContext } from '@/definitions';
import { ChatMessage, ChatRoom } from '@/entities';

@InputType()
export class ChatCreateInput {
  @Field()
  @MinLength(3)
  @MaxLength(255)
  name: string;

  @Field(() => [String])
  @ArrayMinSize(1)
  @IsString({ each: true })
  userIds: string[];
}

@InputType()
export class ChatMessageSendInput {
  @Field()
  @IsUUID()
  chatRoomId: string;

  @Field()
  @MinLength(1)
  text: string;

  @Field(() => [String], { nullable: true })
  @ArrayMaxSize(CHAT_MESSAGE_ATTACHMENT.MAX_FILES)
  chatAttachmentIds: string[];
}

@InputType()
export class ChatMessageListInput {
  @Field()
  @IsUUID()
  chatRoomId: string;
}

@InputType()
export class ChatMessageGetAttachmentUploadUrisInput {
  @Field(() => [String])
  @ArrayMaxSize(CHAT_MESSAGE_ATTACHMENT.MAX_FILES)
  @ArrayMinSize(1)
  names: string[];
}

@Resolver()
export default class ChatResolver {
  @Authorized()
  @Query(() => [ChatRoom])
  async chatList(@Ctx() ctx: IContext) {
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
  @Query(() => [FileUri])
  async chatMessageGetAttachmentUploadUris(
    @Arg('data') data: ChatMessageGetAttachmentUploadUrisInput,
    @Ctx() ctx: IContext,
  ): Promise<FileUri[]> {
    const results: FileUri[] = [];
    for (let i = 0; i < data.names.length; i++) {
      const chatAttachmentService = new ChatAttachmentService();
      const item = await chatAttachmentService.create(ctx.user.id, {
        name: data.names[i],
      });

      results.push(item);
    }

    return results;
  }

  @Authorized()
  @Mutation(() => ChatMessage)
  async chatMessageSend(
    @Arg('data') data: ChatMessageSendInput,
    @Ctx() ctx: IContext,
  ): Promise<ChatMessage> {
    const chatMessageService = new ChatMessageService();
    return chatMessageService.create(ctx.user.id, data);
  }

  @Authorized()
  @Query(() => ChatMessagePaginated)
  async chatMessageList(
    @Arg('data') data: ChatMessageListInput,
    @Arg('pagination', { nullable: true }) pagination: PaginatedInput,
    @Ctx() ctx: IContext,
  ): Promise<IPaginatorResult<ChatMessage>> {
    const chatMessageService = new ChatMessageService();
    return chatMessageService.list(ctx.user.id, data.chatRoomId, pagination);
  }
}
