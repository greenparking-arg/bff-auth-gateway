import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../entities/user.entity'; // Ajusta la ruta según tu estructura

@Entity('personal_tokens')
export class PersonalToken {
  @PrimaryGeneratedColumn('uuid') // Usa UUID como clave primaria
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  token: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  lastSession: string;

  @Column({ type: 'integer', default: 0 })
  attempts: number;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}