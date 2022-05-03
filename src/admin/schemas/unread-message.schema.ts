import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'admin-unread-messages' })
export class UnreadMessage {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId: string;

  @Prop({ required: true })
  count: number;
}

export type UnreadMessageDocument = UnreadMessage & Document;

export const UnreadMessageSchema = SchemaFactory.createForClass(UnreadMessage);
