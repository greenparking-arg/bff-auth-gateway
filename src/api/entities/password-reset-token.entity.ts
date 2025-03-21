import { Entity, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity('password_reset_tokens')
export class PasswordResetToken {
  @Column({ primary: true })
  token: string;

  @Column({ default: false })
  used: boolean;

  @ManyToOne(() => User, (user) => user.passwordResetTokens)
  user: User;
}
