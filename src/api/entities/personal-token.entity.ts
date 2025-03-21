import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity'; // Ajusta la ruta según tu estructura

@Entity('personal_tokens') // Nombre de la tabla en PostgreSQL
export class PersonalToken {
  @PrimaryGeneratedColumn('uuid') // Clave primaria de tipo UUID
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  token: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  lastSession: string;

  @Column({ type: 'integer', default: 0 })
  attempts: number;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @ManyToOne(() => User, (user) => user.personalTokens)
  user: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}