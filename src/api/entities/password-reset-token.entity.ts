import { Entity, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class PasswordResetToken {
  @Column({ primary: true })
  token: string;

  @ManyToOne(() => User)
  user: User;

  @Column({ default: false })
  used: boolean;
}