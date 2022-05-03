import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminUnreadMessageService } from './admin-unread-message.service';
import { AdminUnreadMessageRepository } from './admin.repository';
import {
  AdminUnreadMessage,
  AdminUnreadMessageSchema,
  UserUnreadMessage,
  UserUnreadMessageSchema,
} from './schemas/unread-message.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AdminUnreadMessage.name, schema: AdminUnreadMessageSchema },
      { name: UserUnreadMessage.name, schema: UserUnreadMessageSchema },
    ]),
  ],
  providers: [AdminUnreadMessageService, AdminUnreadMessageRepository],
  exports: [AdminUnreadMessageService, AdminUnreadMessageRepository],
})
export class UnreadMessageModule {}
