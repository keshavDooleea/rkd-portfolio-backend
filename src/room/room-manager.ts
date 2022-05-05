import { Socket, Server } from 'socket.io';

interface IChatRoomDetail {
  socketId: string;
  isChatOpen: boolean;
}

export class RoomManager {
  // room = userId
  private rooms: Map<string, IChatRoomDetail> = new Map();
  private rkdId: string;

  constructor(RKD_ID: string) {
    this.rkdId = RKD_ID;
  }

  addNewRoom(userId: string, client: Socket) {
    if (!this.rooms.has(userId)) {
      client.join(userId);
      this.rooms.set(userId, { socketId: client.id, isChatOpen: false });
    }
  }

  disconnect(client: Socket) {
    this.rooms.forEach((room, userId) => {
      if (room.socketId === client.id) {
        client.leave(userId);
        this.rooms.delete(userId);
        console.log(`Client disconnected: ${userId}`);
        return;
      }
    });
  }

  RKDjoinAllRooms(client: Socket) {
    const availableRooms = Array.from(this.rooms.keys()).filter((room) => {
      if (room !== this.rkdId) {
        client.join(room);
        return room;
      }
    });

    console.log(`RKD joined ${availableRooms.length} rooms`);
  }

  isUserConnected(userId: string) {
    return this.rooms.has(userId);
  }

  isRkdConnected() {
    return this.isUserConnected(this.rkdId);
  }

  getConnectedRooms() {
    return Array.from(this.rooms.keys()).filter(
      (roomIds) => roomIds !== this.rkdId,
    );
  }

  emitUpdateRooms(server: Server) {
    server.emit('updatedConnectedRooms', this.getConnectedRooms());
  }

  openUserChat(userId: string) {
    this.rooms.get(userId).isChatOpen = true;
  }

  closeUserChat(userId: string) {
    this.rooms.get(userId).isChatOpen = false;
  }

  isUserChatOpen(userId: string): boolean {
    return this.rooms.get(userId).isChatOpen;
  }
}
