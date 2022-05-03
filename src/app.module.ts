import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatGateway } from 'src/gateways/chat/chat.gateway';
import { UnreadMessageModule } from './unread-messages/unread-message.module';
import { ChatController } from './controllers/chat.controller';
import { UserModule } from './users/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env' }),
    MongooseModule.forRoot(
      `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@rkd.oztgw.mongodb.net/${process.env.MONGO_DB_NAME}?retryWrites=true&w=majority`,
    ),
    UserModule,
    UnreadMessageModule,
  ],
  controllers: [ChatController],
  providers: [ChatGateway],
})
export class AppModule {}
