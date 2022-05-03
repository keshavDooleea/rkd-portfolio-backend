import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import {
  CHAT_SOCKET_NAMESPACE,
  SocketBody,
  UnreadMessageBody,
} from 'src/utils/constants';
import { UserService } from 'src/users/user.service';
import { Message } from 'src/users/schemas/message.schema';
import { UserTokenManager } from 'src/users/user-token.manager';
import { UserDocument } from 'src/users/schemas/user.schema';
import { AdminService } from 'src/admin/admin.service';

@WebSocketGateway({ namespace: CHAT_SOCKET_NAMESPACE })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private server: Server;

  // room = userId
  private rooms: Map<string, string> = new Map();

  constructor(
    private readonly adminService: AdminService,
    private readonly userService: UserService,
    private readonly userTokenManager: UserTokenManager,
  ) {}

  async handleConnection(@ConnectedSocket() client: Socket) {
    const userToken = JSON.parse(client.handshake.query.userToken as string);
    const isRKD = client.handshake.query.isRKD as string;

    const userId: string = await this.userTokenManager.getUserId(
      userToken,
      isRKD,
    );

    if (!userToken) {
      // update client's token
      const newUsertoken = await this.userService.getNewUserToken(userId);
      client.emit('updateToken', newUsertoken);
    }

    console.log(`New client connected: ${userId}`);

    // put to map
    if (!this.rooms.has(userId)) {
      client.join(userId);
      this.rooms.set(userId, client.id);
    }

    if (isRKD === 'true') {
      this.RKDjoinAllRooms(client);
    }
  }

  handleDisconnect(client: Socket) {
    this.rooms.forEach((clientId, userId) => {
      if (clientId === client.id) {
        console.log(`Client disconnected: ${userId}`);
        this.rooms.delete(userId);
        return;
      }
    });
  }

  private RKDjoinAllRooms(@ConnectedSocket() client: Socket) {
    const availableRooms = Array.from(this.rooms.keys()).filter((room) => {
      if (room !== this.userService.getRKDId()) {
        client.join(room);
        return room;
      }
    });

    console.log(`RKD joined ${availableRooms.length} rooms`);
  }

  @SubscribeMessage('RKDjoinAllRooms')
  async handleRKDjoinAllRooms(
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    this.RKDjoinAllRooms(client);
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

  @SubscribeMessage('getAUserMessage')
  async getAUserMessage(@MessageBody() body: SocketBody): Promise<Message[]> {
    try {
      return (await this.userService.getUserMessages(body.userId)).messages;
    } catch (error) {
      console.log(`Error retrieving messages for user ${body.userId}`);
      return [];
    }
  }

  @SubscribeMessage('newUserMessage')
  async handleUserMessage(@MessageBody() body: SocketBody): Promise<void> {
    try {
      const userId = await this.userService.getUserIdFromToken(body.userToken);
      const savedMessage = await this.userService.saveMessage(
        userId,
        body.data,
        'User',
      );
      this.server.to(userId).emit('savedMessage', savedMessage);

      // save message if im offline
      if (!this.rooms.has(this.userService.getRKDId())) {
        await this.adminService.saveUnreadMessage(userId);
      }
    } catch (error) {
      console.log(error);
    }
  }

  @SubscribeMessage('newRKDMessage')
  async handleRKDMessage(@MessageBody() body: SocketBody): Promise<void> {
    try {
      const savedMessage = await this.userService.saveMessage(
        body.room,
        body.data,
        'RKD',
      );
      this.server.to(body.room).emit('savedMessage', savedMessage);
    } catch (error) {
      console.log(error);
    }
  }

  @SubscribeMessage('getAllRooms')
  async getAllRooms(@MessageBody() body: SocketBody): Promise<UserDocument[]> {
    try {
      return (await this.userService.getAllUsers())
        .map((userDoc: UserDocument) => userDoc._id)
        .filter(
          (roomIds) => roomIds.toString() !== process.env.RKD_CHAT_MONGO_ID,
        );
    } catch (error) {
      console.log(error);
    }
  }

  @SubscribeMessage('getConnectedRooms')
  async getConnectedRooms(): Promise<any> {
    try {
      return Array.from(this.rooms.keys()).filter(
        (roomIds) => roomIds !== process.env.RKD_CHAT_MONGO_ID,
      );
    } catch (error) {
      console.log(error);
    }
  }

  @SubscribeMessage('saveUnreadMessage')
  async saveUnreadMessage(
    @MessageBody() body: UnreadMessageBody,
  ): Promise<void> {
    try {
      await this.adminService.saveUnreadMessage(body.userId);
    } catch (error) {
      console.log(error);
    }
  }

  @SubscribeMessage('getUnreadMessages')
  async getUnreadMessages(): Promise<UnreadMessageBody[]> {
    try {
      const unreadMessagesDocs = await this.adminService.getAllUnreadMessages();
      return unreadMessagesDocs.map((doc) => {
        return {
          userId: doc._id,
          unreadCount: doc.count,
        } as UnreadMessageBody;
      });
    } catch (error) {
      console.log(error);
    }
  }

  @SubscribeMessage('clearUnreadMessages')
  async clearUnreadMessages(
    @MessageBody() body: UnreadMessageBody,
  ): Promise<void> {
    try {
      await this.adminService.removeUnreadMessages(body.userId);
    } catch (error) {
      console.log(error);
    }
  }
}
