import { getRepository, Repository } from 'typeorm';

import Service from '@/lib/classes/Service';
import { ServerError } from '@/lib/utils';

import ApiError from '@/lib/utils/ApiError';

import UserService from '@/services/UserService';

import { ChatRoom } from '@/entities';

export default class ChatRoomService extends Service<ChatRoom> {
  constructor(repository: Repository<ChatRoom> = getRepository(ChatRoom)) {
    super(repository);
  }

  async create(data: Partial<ChatRoom>, userIds: string[]): Promise<ChatRoom> {
    const chatRoom = { ...data };
    const userService = new UserService();

    chatRoom.users = await userService.getByIds(userIds);

    if (chatRoom.users.length < 2) {
      throw ApiError.fromServerError(new ServerError(40));
    }

    return this.repository.save(chatRoom);
  }

  async getUserChatRooms(userId: string) {
    const builder = this.repository.createQueryBuilder('chatRoom');

    builder.leftJoin(
      'chatRoom.users',
      'user',
      'user.id = :id',
      { id: userId },
    ).leftJoinAndSelect('chatRoom.users', 'users');

    return builder.getMany();
  }
}
