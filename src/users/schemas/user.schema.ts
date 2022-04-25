import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Message, MessageSchema } from './message.schema';
import { Document } from 'mongoose';

@Schema()
export class User {
  @Prop({ type: [MessageSchema], default: [], ref: Message.name })
  messages: Message[];
}

export type UserDocument = User & Document;

export const UserSchema = SchemaFactory.createForClass(User);
