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
import { UserService } from 'src/users/user.service';
import { MyJwtService } from 'src/jwt/jwt.service';

@WebSocketGateway({ namespace: CHAT_SOCKET_NAMESPACE })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private server: Server;

  private socketUsers: Map<string, string> = new Map();

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: MyJwtService,
  ) {}

  async handleConnection(client: Socket) {
    const userToken = JSON.parse(client.handshake.query.userToken as string);
    let userId: string;

    if (!userToken) {
      console.log('Generating new User and JWT Token');
      const newUser = await this.userService.createNewUser();
      userId = newUser._id.toString();

      // update client's token
      const newUsertoken = await this.jwtService.sign(userId);
      client.emit('updateToken', newUsertoken);
    } else {
      // deserialize token to get userId
      userId = await this.jwtService.verify(userToken);
      const mongoUser = await this.userService.getUserById(userId);
      console.log('mongoUser', mongoUser);
    }

    // put to map
    if (!this.socketUsers.has(userId)) {
      client.join(userId);
      this.socketUsers.set(client.id, userId);
    }

    console.log(this.socketUsers);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    this.socketUsers.delete(client.id);
  }

  @SubscribeMessage('message')
  handleMessage(@MessageBody() body: any): void {
    console.log('bodyy', body);
    this.server.emit('message', 'GOT IT');
  }
}
