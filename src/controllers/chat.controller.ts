import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { MyJwtService } from 'src/jwt/jwt.service';
import { UserTokenManager } from 'src/users/user-token.manager';

interface IAuthPassword {
  password: string;
}

@Controller('chat')
export class ChatController {
  constructor(
    private readonly jwtService: MyJwtService,
    private readonly userTokenManager: UserTokenManager,
  ) {}

  @Get('/token/:id')
  @HttpCode(HttpStatus.OK)
  async onVerifyChatToken(@Param() params) {
    return {
      isValid: await this.userTokenManager.doesChatTokenMatchPassword(
        params.id,
      ),
    };
  }

  @Post('/auth')
  @HttpCode(HttpStatus.OK)
  async onPostAuthPassword(@Body() { password }: IAuthPassword) {
    if (password !== process.env.RKD_CHAT_AUTH_PASSWORD) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: '',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const chatToken = await this.jwtService.signChatUser(password);

    return { chatToken };
  }
}
