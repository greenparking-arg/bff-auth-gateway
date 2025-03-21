import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable } from 'typeorm';
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

  @ManyToMany(() => Permisos, (permiso) => permiso.roles)
  @JoinTable() // Crea una tabla de unión automáticamente (ej. roles_permisos)
  permisos: Permisos[];
}
