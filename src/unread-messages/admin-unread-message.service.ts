import { Injectable } from '@nestjs/common';
import { AbsUnreadMessageService } from './abs-unread-message.service';
import { AdminUnreadMessageRepository } from './admin.repository';
import {
  AdminUnreadMessage,
  AdminUnreadMessageDocument,
} from './schemas/unread-message.schema';

@Injectable()
export class AdminUnreadMessageService extends AbsUnreadMessageService<
  AdminUnreadMessageDocument,
  AdminUnreadMessage
> {
  constructor(private readonly adminRepository: AdminUnreadMessageRepository) {
    super(adminRepository);
  }
}
