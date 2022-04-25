import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { UserDocument } from './schemas/user.schema';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async createNewUser(): Promise<UserDocument> {
    return await this.userRepository.create({
      messages: [],
    });
  }

  async getUserById(userId: string): Promise<UserDocument> {
    return await this.userRepository.findById({ _id: userId });
  }
}
