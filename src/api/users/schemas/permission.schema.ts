import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PermissionDocument = Permission & Document;

export interface PermissionModelInterface {
  _id?: any;
  name: string;
  name_public: string;
  group_permissions?: string;
}

@Schema()
export class Permission extends Document {
  @Prop()
  name_public: string;

  @Prop()
  name: string;

  @Prop()
  group_permissions: string;
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);
