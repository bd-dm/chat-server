import { getRepository, Repository } from 'typeorm';

import Service from '@/lib/classes/Service';

import { ChatMessage } from '@/entities';

export default class ChatMessageService extends Service<ChatMessage> {
  constructor(repository: Repository<ChatMessage> = getRepository(ChatMessage)) {
    super(repository);
  }
}
