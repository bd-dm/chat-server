import { getRepository, Repository, SelectQueryBuilder } from 'typeorm';

import { ISocketEvents } from '@/definitions/socket';

import Service from '@/lib/classes/Service';
import { ServerError } from '@/lib/utils';

import ApiError from '@/lib/utils/ApiError';

import SocketServer from '@/api/sockets';

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
      ).leftJoin(
        'chatMessage.chatRoom',
        'chatRoom',
      )
      .select([
        'chatMessage.id',
        'chatMessage.createdAt',
        'chatMessage.updatedAt',
        'chatMessage.text',
        'chatRoom.id',
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

  async list(userId: string, chatRoomId: string): Promise<ChatMessage[]> {
    const chatRoomService = new ChatRoomService();
    const hasUserRights = await chatRoomService.hasUserRights(userId, chatRoomId);

    if (!hasUserRights) {
      throw ApiError.fromServerError(new ServerError(50));
    }

    let builder = this.repository.createQueryBuilder('chatMessage');
    builder = ChatMessageService.exposeRelations(builder);
    return builder.where('chatMessage.chatRoomId = :chatRoomId', { chatRoomId })
      .addOrderBy('chatMessage.createdAt', 'ASC')
      .getMany();
  }

  async create(userId: string, data: Partial<ChatMessage>): Promise<ChatMessage> {
    const message = await this.repository.save({
      text: data.text,
      chatRoom: {
        id: data.chatRoomId,
      },
      author: {
        id: userId,
      },
    });

    if (!message) {
      throw ApiError.fromServerError(new ServerError(60));
    }

    const userService = new UserService();
    const chatRoomService = new ChatRoomService();

    const chatRoom = await chatRoomService.get(data.chatRoomId);
    const chatRoomUserIds = chatRoom.userToChatRooms.map(
      (userToChatRoom) => userToChatRoom.userId,
    );

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
