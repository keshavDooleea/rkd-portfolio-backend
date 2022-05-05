import { Injectable } from '@nestjs/common';
import { AbsUnreadMessageService } from './abs-unread-message.service';
import {
  UserUnreadMessage,
  UserUnreadMessageDocument,
} from './schemas/unread-message.schema';
import { UserUnreadMessageRepository } from './user.repository';

@Injectable()
export class UserUnreadMessageService extends AbsUnreadMessageService<
  UserUnreadMessageDocument,
  UserUnreadMessage
> {
  constructor(private readonly userRepository: UserUnreadMessageRepository) {
    super(userRepository);
  }

  async getUserUnreadMessages(userId) {
    return await this.repository.findById(userId);
  }
}
