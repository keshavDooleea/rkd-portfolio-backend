import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { UserService } from './user.service';

export interface IChatEmail {
  userToken: string | null;
  email: string;
}

interface IHTTPResponse<T> {
  status: number;
  data?: T;
}

@Controller('/api/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/email')
  @HttpCode(HttpStatus.OK)
  async setUserEmail(@Body() body: IChatEmail): Promise<IHTTPResponse<any>> {
    const userId = await this.userService.getUserIdFromToken(body.userToken);

    try {
      await this.userService.saveUserEmail(userId, body.email);
      return { status: 200 };
    } catch (error) {
      console.log('Error saving user email', userId);
      return { status: 500 };
    }
  }

  @Get('/:token/email')
  @HttpCode(HttpStatus.OK)
  async getUserEmail(@Param() params): Promise<IHTTPResponse<string>> {
    const userId = await this.userService.getUserIdFromToken(params.token);

    try {
      const user = await this.userService.getUserById(userId);
      return { status: 200, data: user.email };
    } catch (error) {
      console.log('Error getting user email', userId);
      return { status: 500 };
    }
  }
}
