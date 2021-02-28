import {
  DeepPartial,
  getRepository,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';

import { IPaginatorParams, IPaginatorResult } from '@/definitions/pagination';
import { ISocketEvents } from '@/definitions/socket';

import { Paginator } from '@/lib/classes/Paginator';
import Service from '@/lib/classes/Service';
import { ServerError } from '@/lib/utils';

import ApiError from '@/lib/utils/ApiError';

import SocketServer from '@/api/sockets';

import ChatAttachmentService from '@/services/ChatAttachmentService';
import ChatRoomService from '@/services/ChatRoomService';
import UserService from '@/services/UserService';

import { ChatMessage } from '@/entities';

export default class ChatMessageService extends Service<ChatMessage> {
  constructor(repository: Repository<ChatMessage> = getRepository(ChatMessage)) {
    super(repository);
  }

  static exposeRelations(
    builder: SelectQueryBuilder<ChatMessage>,
  ): SelectQueryBuilder<ChatMessage> {
    return builder
      .leftJoin(
        'chatMessage.author',
        'author',
      )
      .leftJoin(
        'chatMessage.chatRoom',
        'chatRoom',
      )
      .leftJoin(
        'chatMessage.chatAttachments',
        'chatAttachment',
      )
      .select([
        'chatMessage.id',
        'chatMessage.createdAt',
        'chatMessage.updatedAt',
        'chatMessage.text',
        'chatRoom.id',
        'chatAttachment.id',
        'chatAttachment.createdAt',
        'chatAttachment.updatedAt',
        'author.id',
        'author.createdAt',
        'author.updatedAt',
        'author.email',
      ]);
  }

  async get(id: string): Promise<ChatMessage> {
    let builder = this.repository.createQueryBuilder('chatMessage');
    builder = ChatMessageService.exposeRelations(builder);
    return builder
      .where('chatMessage.id = :id', { id })
      .getOne();
  }

  async list(
    userId: string,
    chatRoomId: string,
    paginationParams: IPaginatorParams = {
      limit: 30,
      offset: 0,
    },
  ): Promise<IPaginatorResult<ChatMessage>> {
    const chatRoomService = new ChatRoomService();
    const hasUserRights = await chatRoomService.hasUserRights(userId, chatRoomId);

    if (!hasUserRights) {
      throw ApiError.fromServerError(new ServerError(50));
    }

    let builder = this.repository.createQueryBuilder('chatMessage');

    builder = ChatMessageService.exposeRelations(builder);
    builder = builder
      .where('chatMessage.chatRoomId = :chatRoomId', { chatRoomId })
      .addOrderBy('chatMessage.createdAt', 'DESC');

    const paginator = new Paginator(builder);

    return paginator.paginate({
      paginationParams,
    });
  }

  async create(userId: string, data: Partial<ChatMessage>): Promise<ChatMessage> {
    const userService = new UserService();
    const chatRoomService = new ChatRoomService();
    const chatAttachmentService = new ChatAttachmentService();

    const chatRoom = await chatRoomService.get(data.chatRoomId);
    if (!chatRoom) {
      throw ApiError.fromServerError(new ServerError(60));
    }

    const chatRoomUserIds = chatRoom.userToChatRooms.map(
      (userToChatRoom) => userToChatRoom.userId,
    );

    if (!chatRoomUserIds.includes(userId)) {
      throw ApiError.fromServerError(new ServerError(90));
    }

    const messageBody: DeepPartial<ChatMessage> = {
      text: data.text,
      chatRoom: {
        id: data.chatRoomId,
      },
      author: {
        id: userId,
      },

    };

    if (data.chatAttachmentIds) {
      messageBody.chatAttachments = [];

      for (let i = 0; i < data.chatAttachmentIds.length; i++) {
        const chatAttachmentId = data.chatAttachmentIds[i];
        const hasUserRights = await chatAttachmentService.hasUserRights(userId, chatAttachmentId);

        if (!hasUserRights) {
          throw ApiError.fromServerError(new ServerError(100));
        }

        const isAlreadyAttached = await chatAttachmentService.isAttachedToMessage(chatAttachmentId);
        if (isAlreadyAttached) {
          throw ApiError.fromServerError(new ServerError(100));
        }

        messageBody.chatAttachments.push({
          id: chatAttachmentId,
        });
      }
    }

    const message = await this.repository.save(messageBody);

    if (!message) {
      throw ApiError.fromServerError(new ServerError(60));
    }

    const socketIds = await userService.getSocketIds(chatRoomUserIds);
    const newMessage = await this.get(message.id);

    for (let i = 0; i < socketIds.length; i++) {
      SocketServer
        .getInstance()
        .to(socketIds[i].socketId)
        .emit(ISocketEvents.CHAT_NEW_MESSAGE, newMessage);
    }

    return newMessage;
  }
}
