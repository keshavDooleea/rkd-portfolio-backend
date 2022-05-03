import { AbsUnreadMessageRepository } from './abs-unread-message.repository';

export abstract class AbsUnreadMessageService<T, G> {
  constructor(
    protected readonly repository: AbsUnreadMessageRepository<T, G>,
  ) {}

  async saveUnreadMessage(userId: string): Promise<void> {
    const updateQuery = { $inc: { count: 1 } };
    const options = { upsert: true };
    await this.repository.update(userId, updateQuery, options);
  }

  async getAllUnreadMessages(): Promise<T[]> {
    return await this.repository.findAllUnreadMessages();
  }

  async removeUnreadMessages(userId: string): Promise<void> {
    await this.repository.removeUnreadMessages(userId);
  }
}
