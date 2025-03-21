import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Permisos } from './permisos.entity';

@Entity('roles')
export class Rol {
  @PrimaryGeneratedColumn() // Clave primaria de tipo UUID
  id: number;

  @Column({ length: 50, unique: true })
  nombre: string; // Ejemplo: 'admin', 'operador'

  @OneToMany(() => User, (usuario) => usuario.rol)
  usuarios: User[];

  @Column({ type: 'jsonb', nullable: true })
  permisos: Permisos[]; // Ejemplo: { 'users': ['create', 'read', 'update', 'delete'] }
}
