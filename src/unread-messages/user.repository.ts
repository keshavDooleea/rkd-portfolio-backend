import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AbsUnreadMessageRepository } from './abs-unread-message.repository';
import {
  UserUnreadMessage,
  UserUnreadMessageDocument,
} from './schemas/unread-message.schema';

@Injectable()
export class UserUnreadMessageRepository extends AbsUnreadMessageRepository<
  UserUnreadMessageDocument,
  UserUnreadMessage
> {
  constructor(
    @InjectModel(UserUnreadMessage.name)
    userUnreadMesssageModel: Model<UserUnreadMessageDocument>,
  ) {
    super(userUnreadMesssageModel);
  }
}
