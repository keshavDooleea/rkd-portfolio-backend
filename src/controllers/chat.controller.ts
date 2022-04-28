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

interface IAuthPassword {
  password: string;
}

@Controller('chat')
export class ChatController {
  constructor(private readonly jwtService: MyJwtService) {}

  @Get('/token/:id')
  @HttpCode(HttpStatus.OK)
  async onVerifyChatToken(@Param() params) {
    const token = params.id;

    if (!token || token === 'null') return false;

    const password = await this.jwtService.verifyChatToken(token);

    return { isValid: password === process.env.RKD_CHAT_AUTH_PASSWORD };
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
