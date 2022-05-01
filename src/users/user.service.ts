import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { UserDocument } from './schemas/user.schema';
import { MyJwtService } from 'src/jwt/jwt.service';
import { Message, MessageAuthor } from './schemas/message.schema';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: MyJwtService,
  ) {}

  async createNewUser(): Promise<UserDocument> {
    return await this.userRepository.create({
      messages: [],
    });
  }

  getRKDId = () => process.env.RKD_CHAT_MONGO_ID;

  async getUserById(userId: string): Promise<UserDocument> {
    return await this.userRepository.findById({ _id: userId });
  }

  async getUserByToken(token: string): Promise<UserDocument> {
    const userId = await this.getUserIdFromToken(token);
    return await this.userRepository.findById({ _id: userId });
  }

  async getNewUserToken(userId: string): Promise<string> {
    return await this.jwtService.sign(userId);
  }

  async getUserIdFromToken(userToken: string): Promise<string> {
    return await this.jwtService.verify(userToken);
  }

  async getUserMessages(userId: string): Promise<UserDocument> {
    return await this.userRepository.findUserMessages({ _id: userId });
  }

  async getAllUsers(): Promise<UserDocument[]> {
    return await this.userRepository.findAll();
  }

  async saveMessage(
    userId: string,
    message: string,
    author: MessageAuthor,
  ): Promise<Message> {
    const newMessage: Message = {
      userId,
      message,
      author,
      createdAt: new Date(),
    };

    return await this.userRepository.saveMessage(newMessage, userId);
  }
}
