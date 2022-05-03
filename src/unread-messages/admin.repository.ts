import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AbsUnreadMessageRepository } from './abs-unread-message.repository';
import {
  AdminUnreadMessage,
  AdminUnreadMessageDocument,
} from './schemas/unread-message.schema';

@Injectable()
export class AdminUnreadMessageRepository extends AbsUnreadMessageRepository<
  AdminUnreadMessageDocument,
  AdminUnreadMessage
> {
  constructor(
    @InjectModel(AdminUnreadMessage.name)
    adminUnreadMesssageModel: Model<AdminUnreadMessageDocument>,
  ) {
    super(adminUnreadMesssageModel);
  }
}
