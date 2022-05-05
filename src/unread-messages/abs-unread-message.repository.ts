import { Model, UpdateQuery, QueryOptions } from 'mongoose';

export abstract class AbsUnreadMessageRepository<T, G> {
  protected unreadMesssageModel: Model<T>;

  constructor(model: Model<T>) {
    this.unreadMesssageModel = model;
  }

  async update(
    userId: string,
    query: UpdateQuery<G>,
    options: QueryOptions<G>,
  ) {
    return await this.unreadMesssageModel.findByIdAndUpdate(
      userId,
      query,
      options,
    );
  }

  async removeUnreadMessages(userId: string) {
    try {
      await this.unreadMesssageModel.findByIdAndDelete(userId);
    } catch (error) {}
  }

  async findById(userId: string): Promise<T[]> {
    const messages = await this.unreadMesssageModel.findById(userId);
    return messages ? [messages] : [];
  }

  async findAllUnreadMessages(): Promise<T[]> {
    return await this.unreadMesssageModel.find();
  }
}
