import { getRepository, Repository } from 'typeorm';

import Service from '@/lib/classes/Service';
import { ServerError } from '@/lib/utils';

import ApiError from '@/lib/utils/ApiError';

import ChatRoomService from '@/services/ChatRoomService';

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
      .getMany();
  }

  async create(userId: string, data: Partial<ChatMessage>): Promise<ChatMessage> {
    return this.repository.save({
      text: data.text,
      chatRoom: {
        id: data.chatRoomId,
      },
      author: {
        id: userId,
      },
    });
  }
}
