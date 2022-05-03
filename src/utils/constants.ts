// socket
export const CHAT_SOCKET_NAMESPACE = 'chat';

export interface SocketBody {
  data: any;
  userToken: string;
  userId: string;
  room: string;
}

export interface UnreadMessageBody {
  userId: string;
  unreadCount: number;
}
