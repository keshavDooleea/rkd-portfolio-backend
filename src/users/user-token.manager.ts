import { Injectable } from '@nestjs/common';
import { MyJwtService } from 'src/jwt/jwt.service';
import { UserService } from './user.service';

@Injectable()
export class UserTokenManager {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: MyJwtService,
  ) {}

  async doesChatTokenMatchPassword(userToken: string): Promise<boolean> {
    if (!userToken || userToken === 'null' || userToken === undefined) {
      return false;
    }

    const password = await this.jwtService.verifyChatToken(userToken);
    return password === process.env.RKD_CHAT_AUTH_PASSWORD;
  }

  async getUserId(userToken: string, isRKD: string) {
    if (
      isRKD === 'true' &&
      (await this.doesChatTokenMatchPassword(userToken))
    ) {
      return process.env.RKD_CHAT_MONGO_ID;
    }

    // existing user: deserialize token to get userId
    if (userToken) {
      return await this.userService.getUserIdFromToken(userToken);
    }

    if (!userToken) {
      const newUser = await this.userService.createNewUser();
      const userId = newUser._id.toString();
      console.log(`Created new user with id ${userId}`);
      return userId;
    }
  }
}
