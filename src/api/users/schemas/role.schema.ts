import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('roles')
export class Rol {
  @PrimaryGeneratedColumn('uuid') // Clave primaria de tipo UUID
  id: string;

  @Column({
    type: 'character varying',
    length: 50,
    unique: true,
    nullable: false,
  })
  nombre: string;

  @Column({ type: 'jsonb', nullable: true })
  permisos: object;
}