import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { CHAT_SOCKET_NAMESPACE, SocketBody } from 'src/utils/constants';
import { UserService } from 'src/users/user.service';
import { Message } from 'src/users/schemas/message.schema';

@WebSocketGateway({ namespace: CHAT_SOCKET_NAMESPACE })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private server: Server;

  private socketUsers: Map<string, string> = new Map();

  constructor(private readonly userService: UserService) {}

  async handleConnection(client: Socket) {
    const userToken = JSON.parse(client.handshake.query.userToken as string);
    let userId: string;

    if (!userToken) {
      const newUser = await this.userService.createNewUser();
      userId = newUser._id.toString();
      console.log(`Created new user with id ${userId}`);

      // update client's token
      const newUsertoken = await this.userService.getNewUserToken(userId);
      client.emit('updateToken', newUsertoken);
    } else {
      // existing User: deserialize token to get userId
      userId = await this.userService.getUserIdFromToken(userToken);
    }

    console.log(`New client connected: ${userId}`);

    // put to map
    if (!this.socketUsers.has(userId)) {
      client.join(userId);
      this.socketUsers.set(client.id, userId);
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${this.socketUsers.get(client.id)}`);
    this.socketUsers.delete(client.id);
  }

  @SubscribeMessage('getInitialMessages')
  async handleGetMessages(@MessageBody() body: SocketBody): Promise<Message[]> {
    if (!body.userToken) return [];

    const userId = await this.userService.getUserIdFromToken(body.userToken);

    try {
      const userWithMessages = await this.userService.getUserMessages(userId);
      return userWithMessages.messages;
    } catch (error) {
      console.log(`Error retrieving messages for user ${userId}`);
      return [];
    }
  }

  @SubscribeMessage('newUserMessage')
  async handleUserMessage(@MessageBody() body: SocketBody): Promise<void> {
    try {
      const userId = await this.userService.getUserIdFromToken(body.userToken);
      const savedMessage = await this.userService.saveMessage(
        body.data,
        body.userToken,
        'User',
      );

      this.server.to(userId).emit('savedMessage', savedMessage);
    } catch (error) {
      console.log(error);
    }
  }
}
