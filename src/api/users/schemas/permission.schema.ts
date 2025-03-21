import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PermisosDocument = Permisos & Document;

export interface PermisosModelInterface {
  _id?: any;
  name: string;
  name_public: string;
  group_permisos?: string;
}

@Schema()
export class Permisos extends Document {
  @Prop()
  name_public: string;

  @Prop()
  name: string;

  @Prop()
  group_permisos: string;
}

export const permisoschema = SchemaFactory.createForClass(Permisos);
