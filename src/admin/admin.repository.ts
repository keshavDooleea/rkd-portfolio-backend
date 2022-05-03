import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, UpdateQuery, QueryOptions } from 'mongoose';
import {
  UnreadMessage,
  UnreadMessageDocument,
} from './schemas/unread-message.schema';

@Injectable()
export class AdminRepository {
  constructor(
    @InjectModel(UnreadMessage.name)
    private unreadMesssageModel: Model<UnreadMessageDocument>,
  ) {}

  async update(
    userId: string,
    query: UpdateQuery<UnreadMessage>,
    options: QueryOptions<UnreadMessage>,
  ) {
    return await this.unreadMesssageModel.findByIdAndUpdate(
      userId,
      query,
      options,
    );
  }

  async removeUnreadMessages(userId: string) {
    await this.unreadMesssageModel.findByIdAndDelete(userId);
  }

  async findAllUnreadMessages(): Promise<UnreadMessageDocument[]> {
    return await this.unreadMesssageModel.find();
  }
}
