import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Rol } from '../../entities/rol.entity'; // Ajusta la ruta según tu estructura
import { Municipio } from '../../entities/municipio.entity'; // Ajusta la ruta según tu estructura

@Entity('usuarios') // Nombre correcto de la tabla
export class User {
  @PrimaryGeneratedColumn('uuid') // Clave primaria de tipo UUID
  id: string;

  @Column({ type: 'varchar', length: 100, nullable: false }) // Nombre, no nulo
  nombre: string;

  @Column({ type: 'varchar', length: 100, unique: true, nullable: false }) // Email único, no nulo
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: false }) // Contraseña, no nulo
  password: string;

  @ManyToOne(() => Rol, { nullable: false }) // Relación con Rol, no nulo
  @JoinColumn({ name: 'rol_id' }) // Columna rol_id en la tabla
  rol: Rol;

  @ManyToOne(() => Municipio, { nullable: true }) // Relación con Municipio, puede ser nulo
  @JoinColumn({ name: 'municipio_id' }) // Columna municipio_id en la tabla
  municipio: Municipio;

  @Column({ type: 'integer', nullable: true }) // DNI, puede ser nulo
  dni: number;
}