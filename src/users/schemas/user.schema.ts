import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Message } from './message.schema';
import { Document, Types } from 'mongoose';

@Schema()
export class User {
  @Prop({ type: [Types.ObjectId], default: [], ref: Message.name })
  messages: Message[];
}

export type UserDocument = User & Document;

export const UserSchema = SchemaFactory.createForClass(User);
