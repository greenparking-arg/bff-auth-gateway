import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Permiso } from '../interfaces/permissions.interface';

@Entity('roles')
export class Rol {
  @PrimaryGeneratedColumn('uuid') // Clave primaria de tipo UUID
  id: string;

  @Column({ length: 50, unique: true })
  nombre: string; // Ejemplo: 'admin', 'operador'

  @OneToMany(() => User, (usuario) => usuario.rol)
  usuarios: User[];

  @Column({ type: 'jsonb', nullable: true })
  permisos: Permiso[]; // Ejemplo: { 'users': ['create', 'read', 'update', 'delete'] }
}