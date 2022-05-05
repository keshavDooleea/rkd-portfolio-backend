import { UnreadMessageBody } from 'src/utils/constants';
import { AbsUnreadMessageRepository } from './abs-unread-message.repository';
import { UnreadMessageDocument } from './schemas/unread-message.schema';

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

  mapDocsToObject(
    unreadMessagesDocs: UnreadMessageDocument[],
  ): UnreadMessageBody[] {
    return unreadMessagesDocs.map((doc: UnreadMessageDocument) => {
      return {
        userId: doc._id,
        unreadCount: doc.count,
      } as UnreadMessageBody;
    });
  }
}
