import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MessageAuthor = 'RKD' | 'User';

@Schema()
export class Message {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId: string;

  @Prop({ required: true })
  message: string;

  @Prop({ required: true })
  author: MessageAuthor;

  @Prop({ required: true })
  createdAt: Date;
}

export type MessageDocument = Message & Document;

export const MessageSchema = SchemaFactory.createForClass(Message);
