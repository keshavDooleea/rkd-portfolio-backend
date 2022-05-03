import { Injectable } from '@nestjs/common';
import { UnreadMessageBody } from 'src/utils/constants';
import { AdminRepository } from './admin.repository';
import { UnreadMessageDocument } from './schemas/unread-message.schema';

@Injectable()
export class AdminService {
  constructor(private readonly adminRepository: AdminRepository) {}

  async saveUnreadMessage(body: UnreadMessageBody): Promise<void> {
    const { userId, unreadCount } = body;
    const updateQuery = { count: unreadCount };
    const options = { upsert: true };
    await this.adminRepository.update(userId, updateQuery, options);
  }

  async getAllUnreadMessages(): Promise<UnreadMessageDocument[]> {
    return await this.adminRepository.findAllUnreadMessages();
  }

  async removeUnreadMessages(userId: string): Promise<void> {
    await this.adminRepository.removeUnreadMessages(userId);
  }
}
