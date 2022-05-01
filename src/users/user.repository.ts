import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model, FilterQuery } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
  ) {}

  async create(user: User): Promise<UserDocument> {
    const newUser = new this.userModel(user);
    return await newUser.save();
  }

  async findById(userFilterQuery: FilterQuery<User>): Promise<UserDocument> {
    return await this.userModel.findById(userFilterQuery);
  }

  async findAll(): Promise<UserDocument[]> {
    return await this.userModel.find();
  }

  async findUserMessages(
    userFilterQuery: FilterQuery<User>,
  ): Promise<UserDocument> {
    return new Promise(async (resolve, reject) => {
      await this.userModel
        .findById(userFilterQuery)
        .populate('messages', null, Message.name)
        .exec((err, user) => {
          if (err || !user) {
            reject(err);
          }
          resolve(user);
        });
    });
  }

  async saveMessage(message: Message, userId: string): Promise<Message> {
    return new Promise(async (resolve, reject) => {
      try {
        const newMessage = new this.messageModel(message);
        const savedMessage = await newMessage.save();

        const user = await this.findById({ _id: userId });
        await user.messages.push(savedMessage._id);
        await user.save();
        resolve(newMessage);
      } catch (error) {
        reject(`Error saving new message for user ${userId}`);
      }
    });
  }
}
