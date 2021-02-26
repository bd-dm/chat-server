import { getRepository, Repository } from 'typeorm';

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

  async list(userId: string, chatRoomId: string): Promise<ChatMessage[]> {
    const chatRoomService = new ChatRoomService();
    const hasUserRights = await chatRoomService.hasUserRights(userId, chatRoomId);

    if (!hasUserRights) {
      throw ApiError.fromServerError(new ServerError(50));
    }

    return this.repository.createQueryBuilder('chatMessage')
      .leftJoinAndSelect(
        'chatMessage.author',
        'author',
      )
      .where('chatMessage.chatRoomId = :chatRoomId', { chatRoomId })
      .select([
        'chatMessage.id',
        'chatMessage.createdAt',
        'chatMessage.updatedAt',
        'chatMessage.text',
        'author.id',
        'author.createdAt',
        'author.updatedAt',
        'author.email',
      ])
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

    for (let i = 0; i < socketIds.length; i++) {
      SocketServer
        .getInstance()
        .to(socketIds[i].socketId)
        .emit(ISocketEvents.CHAT_NEW_MESSAGE, message);
    }

    return message;
  }
}
