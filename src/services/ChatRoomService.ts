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

import {
  IUserToChatRoomRole,
  UserToChatRoom,
} from '@/entities/User/UserToChatRoom';

import { ISocketEvents } from '@/definitions/socket';

import Service from '@/lib/classes/Service';
import { ServerError } from '@/lib/utils';

import ApiError from '@/lib/utils/ApiError';

import SocketServer from '@/api/sockets';

import UserService from '@/services/UserService';

import { ChatRoom } from '@/entities';

export interface IChatRoomCreateUser {
  id: string,
  role: IUserToChatRoomRole
}

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
        'user',
      )
      .leftJoin(
        'chatRoom.chatMessages',
        'chatMessage',
      )
      .addSelect([
        'userToChatRoom.id',
        'userToChatRoom.createdAt',
        'userToChatRoom.updatedAt',
        'userToChatRoom.userId',
        'user.id',
        'user.createdAt',
        'user.updatedAt',
        'user.email',
        'chatMessage.id',
        'chatMessage.createdAt',
        'chatMessage.updatedAt',
        'chatMessage.text',
        'chatMessage.author',
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
    userList: IChatRoomCreateUser[],
    @TransactionManager() manager: EntityManager = getManager(),
  ): Promise<ChatRoom> {
    const userService = new UserService();
    const users = await userService.getByIds(userList.map((user) => user.id));

    if (users.length < 2) {
      throw ApiError.fromServerError(new ServerError(40));
    }

    // Создаём комнату чата
    const chatRoomEntity = manager.create(ChatRoom, data);
    const chatRoomResult = await manager.save(chatRoomEntity);

    // Добавляем в комнату пользователей
    const userToChatRooms: Partial<UserToChatRoom>[] = users.map((user) => ({
      user,
      chatRoom: chatRoomResult,
      role: userList.find((el) => el.id === user.id).role,
    }));
    const userToChatRoomEntities = manager.create(UserToChatRoom, userToChatRooms);
    await manager.save(userToChatRoomEntities);

    // Оповещаем сокеты пользователей
    const socketIds = await userService.getSocketIds(userList.map((user) => user.id));
    for (let i = 0; i < socketIds.length; i++) {
      SocketServer
        .getInstance()
        .to(socketIds[i].socketId)
        .emit(ISocketEvents.CHAT_NEW_ROOM, chatRoomResult);
    }

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
        'user',
      )
      .leftJoin(
        'chatRoom.chatMessages',
        'chatMessage',
      )
      .leftJoin(
        'chatMessage.author',
        'chatMessageAuthor',
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
        'userToChatRoom.role',
        'user.id',
        'user.createdAt',
        'user.updatedAt',
        'user.email',
        'chatMessageAuthor.id',
        'chatMessageAuthor.createdAt',
        'chatMessageAuthor.updatedAt',
        'chatMessageAuthor.email',
        'chatMessage.id',
        'chatMessage.createdAt',
        'chatMessage.updatedAt',
        'chatMessage.text',
        'chatMessage.author',
      ]);

    return qb.getMany();
  }

  async hasUserRights(userId: string, chatRoomId: string): Promise<boolean> {
    const qb = this.repository
      .createQueryBuilder('chatRoom')
      .leftJoin(
        'chatRoom.userToChatRooms',
        'userToChatRoom',
      )
      .where({ id: chatRoomId })
      .select([
        'chatRoom.id',
        'userToChatRoom.userId',
      ]);

    const room = await qb.getOne();

    if (!room) {
      return false;
    }

    const roomUserIds = room.userToChatRooms?.map((userToChatRoom) => userToChatRoom.userId);

    return roomUserIds.includes(userId);
  }
}
