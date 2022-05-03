import { Injectable } from '@nestjs/common';
import { AdminRepository } from './admin.repository';
import { UnreadMessageDocument } from './schemas/unread-message.schema';

@Injectable()
export class AdminService {
  constructor(private readonly adminRepository: AdminRepository) {}

  async saveUnreadMessage(userId: string): Promise<void> {
    const updateQuery = { $inc: { count: 1 } };
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
