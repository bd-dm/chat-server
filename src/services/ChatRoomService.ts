import {
  DeepPartial,
  EntityManager,
  getManager,
  getRepository,
  Repository,
  SelectQueryBuilder,
  Transaction,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  TransactionManager,
} from 'typeorm';

import { UserToChatRoom } from '@/entities/User/UserToChatRoom';

import Service from '@/lib/classes/Service';
import { ServerError } from '@/lib/utils';

import ApiError from '@/lib/utils/ApiError';

import UserService from '@/services/UserService';

import { ChatRoom } from '@/entities';

export default class ChatRoomService extends Service<ChatRoom> {
  constructor(repository: Repository<ChatRoom> = getRepository(ChatRoom)) {
    super(repository);
  }

  static exposeRelations(builder: SelectQueryBuilder<ChatRoom>): SelectQueryBuilder<ChatRoom> {
    return builder.leftJoin(
      'chatRoom.userToChatRooms',
      'userToChatRoom',
    )
      .leftJoin(
        'userToChatRoom.user',
        'userToChatRoomUser',
      )
      .leftJoin(
        'chatRoom.chatMessages',
        'chatMessages',
      )
      .addSelect([
        'userToChatRoom.id',
        'userToChatRoom.createdAt',
        'userToChatRoom.updatedAt',
        'userToChatRoom.userId',
        'userToChatRoomUser.id',
        'userToChatRoomUser.createdAt',
        'userToChatRoomUser.updatedAt',
        'userToChatRoomUser.email',
        'chatMessages.id',
        'chatMessages.createdAt',
        'chatMessages.updatedAt',
        'chatMessages.name',
        'chatMessages.text',
        'chatMessages.author',
      ]);
  }

  async get(id: string): Promise<ChatRoom> {
    let qb = await this.repository
      .createQueryBuilder('chatRoom');

    qb = ChatRoomService.exposeRelations(qb);

    qb.where({ id })
      .addSelect([
        'chatRoom.id',
        'chatRoom.createdAt',
        'chatRoom.updatedAt',
        'chatRoom.name',
      ]);

    return qb.getOne();
  }

  @Transaction()
  async create(
    data: DeepPartial<ChatRoom>,
    userIds: string[],
    @TransactionManager() manager: EntityManager = getManager(),
  ): Promise<ChatRoom> {
    const userService = new UserService();
    const users = await userService.getByIds(userIds);

    if (users.length < 2) {
      throw ApiError.fromServerError(new ServerError(40));
    }

    // Создаём комнату чата
    const chatRoomEntity = manager.create(ChatRoom, data);
    const chatRoomResult = await manager.save(chatRoomEntity);

    // Добавляем в комнату пользователей
    const userToChatRooms = users.map((user) => ({
      user,
      chatRoom: chatRoomResult,
    }));
    const userToChatRoomEntities = manager.create(UserToChatRoom, userToChatRooms);
    await manager.save(userToChatRoomEntities);

    return chatRoomResult;
  }

  async getByUser(userId: string): Promise<ChatRoom[]> {
    const qb = await this.repository
      .createQueryBuilder('chatRoom')
      .innerJoin(
        'chatRoom.userToChatRooms',
        'userToChatRoomConcrete',
        'userToChatRoomConcrete.userId = :userId',
        { userId },
      )
      .leftJoin(
        'chatRoom.userToChatRooms',
        'userToChatRoom',
      )
      .leftJoin(
        'userToChatRoom.user',
        'userToChatRoomUser',
      )
      .leftJoin(
        'chatRoom.chatMessages',
        'chatMessages',
      )
      .addSelect([
        'chatRoom.id',
        'chatRoom.createdAt',
        'chatRoom.updatedAt',
        'chatRoom.name',
        'userToChatRoom.id',
        'userToChatRoom.createdAt',
        'userToChatRoom.updatedAt',
        'userToChatRoom.userId',
        'userToChatRoomUser.id',
        'userToChatRoomUser.createdAt',
        'userToChatRoomUser.updatedAt',
        'userToChatRoomUser.email',
        'chatMessages.id',
        'chatMessages.createdAt',
        'chatMessages.updatedAt',
        'chatMessages.name',
        'chatMessages.text',
        'chatMessages.author',
      ]);

    return qb.getMany();
  }
}
