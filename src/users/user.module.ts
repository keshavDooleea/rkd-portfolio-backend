import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { MyJwtService } from 'src/jwt/jwt.service';
import { Message, MessageSchema } from 'src/users/schemas/message.schema';
import { User, UserSchema } from 'src/users/schemas/user.schema';
import { UserTokenManager } from './user-token.manager';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Message.name, schema: MessageSchema },
    ]),
    JwtModule.register({ secret: `${process.env.JWT_SECRET_KEY}` }),
  ],
  controllers: [UserController],
  providers: [MyJwtService, UserService, UserTokenManager, UserRepository],
  exports: [MyJwtService, UserService, UserTokenManager, UserRepository],
})
export class UserModule {}
