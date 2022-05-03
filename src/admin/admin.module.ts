import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminRepository } from './admin.repository';
import { AdminService } from './admin.service';
import {
  UnreadMessage,
  UnreadMessageSchema,
} from './schemas/unread-message.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UnreadMessage.name, schema: UnreadMessageSchema },
    ]),
  ],
  providers: [AdminService, AdminRepository],
  exports: [AdminService, AdminRepository],
})
export class AdminModule {}
