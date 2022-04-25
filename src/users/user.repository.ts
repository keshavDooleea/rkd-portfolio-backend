import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model, FilterQuery } from 'mongoose';

@Injectable()
export class UserRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(user: User): Promise<UserDocument> {
    const newUser = new this.userModel(user);
    return await newUser.save();
  }

  async findById(userFilterQuery: FilterQuery<User>): Promise<UserDocument> {
    return await this.userModel.findById(userFilterQuery);
  }
}
