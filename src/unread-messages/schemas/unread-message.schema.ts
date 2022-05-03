import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

class UnreadMessage {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId: string;

  @Prop({ required: true, default: 0 })
  count: number;
}

// admin - rkd chat app
@Schema({ collection: 'admin-unread-messages' })
export class AdminUnreadMessage extends UnreadMessage {}
export type AdminUnreadMessageDocument = AdminUnreadMessage & Document;
export const AdminUnreadMessageSchema =
  SchemaFactory.createForClass(AdminUnreadMessage);

// user - normal rkd portfolio
@Schema({ collection: 'user-unread-messages' })
export class UserUnreadMessage extends UnreadMessage {}
export type UserUnreadMessageDocument = UserUnreadMessage & Document;
export const UserUnreadMessageSchema =
  SchemaFactory.createForClass(UserUnreadMessage);
