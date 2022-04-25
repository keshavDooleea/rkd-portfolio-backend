import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { CHAT_SOCKET_NAMESPACE } from 'src/utils/constants';
import { ObjectId, Types } from 'mongoose';
import { UserService } from 'src/users/user.service';

@WebSocketGateway({ namespace: CHAT_SOCKET_NAMESPACE })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private server: Server;

  private socketUsers: Map<string, any> = new Map();

  constructor(private readonly userService: UserService) {}

  async handleConnection(client: Socket) {
    const userToken = JSON.parse(client.handshake.query.userToken as string);
    let userId: ObjectId;

    if (!userToken) {
      const newUser = await this.userService.createNewUser();
      userId = newUser._id;

      // generate token

      // emit token to client and save
    }

    // deserialize token to get userId

    // put to map
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('message')
  handleMessage(@MessageBody() body: any): void {
    console.log('bodyy', body);
    this.server.emit('message', 'GOT IT');
  }
}
