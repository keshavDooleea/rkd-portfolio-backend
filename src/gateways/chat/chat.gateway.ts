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
  OfflineMessage,
  SocketBody,
  UnreadMessageBody,
} from 'src/utils/constants';
import { UserService } from 'src/users/user.service';
import { Message } from 'src/users/schemas/message.schema';
import { UserTokenManager } from 'src/users/user-token.manager';
import { UserDocument } from 'src/users/schemas/user.schema';
import { RoomManager } from 'src/room/room-manager';
import { AdminUnreadMessageService } from 'src/unread-messages/admin-unread-message.service';
import { UserUnreadMessageService } from 'src/unread-messages/user-unread-message.service';

@WebSocketGateway({ namespace: CHAT_SOCKET_NAMESPACE })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private server: Server;

  private roomManager: RoomManager;

  constructor(
    private readonly adminUnreadMsgService: AdminUnreadMessageService,
    private readonly userUnreadMsgService: UserUnreadMessageService,
    private readonly userService: UserService,
    private readonly userTokenManager: UserTokenManager,
  ) {
    this.roomManager = new RoomManager(this.userService.getRKDId());
  }

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
    this.roomManager.addNewRoom(userId, client);
    this.roomManager.emitUpdateRooms(this.server);

    if (isRKD === 'true') {
      this.roomManager.RKDjoinAllRooms(client);
    }
  }

  handleDisconnect(client: Socket) {
    this.roomManager.disconnect(client);
    this.roomManager.emitUpdateRooms(this.server);
  }

  @SubscribeMessage('RKDjoinAllRooms')
  async handleRKDjoinAllRooms(
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    this.roomManager.RKDjoinAllRooms(client);
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
      if (!this.roomManager.isRkdConnected()) {
        await this.adminUnreadMsgService.saveUnreadMessage(userId);
      }
    } catch (error) {
      console.log(error);
    }
  }

  @SubscribeMessage('newRKDMessage')
  async handleRKDMessage(
    @MessageBody() body: SocketBody,
  ): Promise<OfflineMessage> {
    try {
      const savedMessage = await this.userService.saveMessage(
        body.room,
        body.data,
        'RKD',
      );
      this.server.to(body.room).emit('savedMessage', savedMessage);

      // save message if user is offline or user's chat is closed
      const isUserOnline = this.roomManager.isUserConnected(body.room);
      const isChatOpen = this.roomManager.isUserChatOpen(body.room);

      if (!isUserOnline || !isChatOpen) {
        await this.userUnreadMsgService.saveUnreadMessage(body.room);
        this.server.to(body.room).emit('fetchUserUnreadMessage');
      }

      if (!isUserOnline) {
        return {
          isOnline: false,
          message: savedMessage,
        };
      }
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
      return this.roomManager.getConnectedRooms();
    } catch (error) {
      console.log(error);
    }
  }

  @SubscribeMessage('saveUnreadMessage')
  async saveUnreadMessage(
    @MessageBody() body: UnreadMessageBody,
  ): Promise<void> {
    try {
      await this.adminUnreadMsgService.saveUnreadMessage(body.userId);
    } catch (error) {
      console.log(error);
    }
  }

  @SubscribeMessage('getUnreadMessages')
  async getUnreadMessages(): Promise<UnreadMessageBody[]> {
    try {
      const unreadMessagesDocs =
        await this.adminUnreadMsgService.getAllUnreadMessages();
      return this.adminUnreadMsgService.mapDocsToObject(unreadMessagesDocs);
    } catch (error) {
      console.log(error);
    }
  }

  @SubscribeMessage('getUserUnreadMessages')
  async getUserUnreadMessages(
    @MessageBody() body: SocketBody,
  ): Promise<UnreadMessageBody> {
    try {
      const userId = await this.userService.getUserIdFromToken(body.userToken);
      const unreadMessagesDocs =
        await this.userUnreadMsgService.getUserUnreadMessages(userId);
      return this.userUnreadMsgService.mapDocsToObject(unreadMessagesDocs)[0];
    } catch (error) {
      console.log(error);
    }
  }

  @SubscribeMessage('clearUserUnreadMessages')
  async clearUserUnreadMessages(
    @MessageBody() body: SocketBody,
  ): Promise<Object> {
    try {
      const userId = await this.userService.getUserIdFromToken(body.userToken);
      await this.userUnreadMsgService.removeUnreadMessages(userId);
      return { status: 200 };
    } catch (error) {
      console.log(error);
    }
  }

  @SubscribeMessage('clearUnreadMessages')
  async clearUnreadMessages(
    @MessageBody() body: UnreadMessageBody,
  ): Promise<void> {
    try {
      await this.adminUnreadMsgService.removeUnreadMessages(body.userId);
    } catch (error) {
      console.log(error);
    }
  }

  @SubscribeMessage('setChatOpen')
  async setChatOpen(@MessageBody() body: SocketBody): Promise<void> {
    try {
      const userId = await this.userService.getUserIdFromToken(body.userToken);
      this.roomManager.openUserChat(userId);
    } catch (error) {
      console.log(error);
    }
  }

  @SubscribeMessage('setChatClose')
  async setChatClose(@MessageBody() body: SocketBody): Promise<void> {
    try {
      const userId = await this.userService.getUserIdFromToken(body.userToken);
      this.roomManager.closeUserChat(userId);
    } catch (error) {
      console.log(error);
    }
  }
}
