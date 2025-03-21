import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Rol } from './rol.entity';
import { PersonalToken } from './personal-token.entity';
import { PasswordResetToken } from './password-reset-token.entity';
import { Municipio } from './municipio.entity';

@Entity('usuarios')
export class User {
  @PrimaryGeneratedColumn() // Clave primaria de tipo UUID
  id: number;

  @Column({ length: 100 })
  nombre: string;

  @Column({ length: 100, unique: true })
  email: string;

  @Column({ length: 255 })
  password: string;

  @ManyToOne(() => Rol, (rol) => rol.usuarios)
  @JoinColumn({ name: 'rol_id' })
  rol: Rol;

  @ManyToOne(() => Municipio, { nullable: true }) // Relación con Municipio, puede ser nulo
  @JoinColumn({ name: 'municipio_id' }) // Columna municipio_id en la tabla
  municipio: Municipio;

  @Column({ type: 'varchar', length: 20, nullable: true }) // Agregado
  dni: string;

  @OneToMany(() => PersonalToken, (personalToken) => personalToken.user) // Agregado
  personalTokens: PersonalToken[];

  @OneToMany(() => PasswordResetToken, (token) => token.user)
  passwordResetTokens: PasswordResetToken[];
}
