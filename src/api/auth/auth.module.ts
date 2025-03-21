import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // Importamos TypeOrmModule en lugar de MongooseModule
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtRegister } from '../../jwt/jwt';
import { PasswordResetToken } from '../entities/password-reset-token.entity'; // Entidad de TypeORM
import { ContactService } from '../contact/contact.service';
import Handlebars from 'handlebars';
import { HANDLEBARS } from '../../constants/handlebar.constants';

@Module({
  imports: [
    UsersModule,
    JwtRegister,
    TypeOrmModule.forFeature([PasswordResetToken]), // Registramos la entidad con TypeORM
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    ContactService,
    {
      provide: HANDLEBARS,
      useFactory: () => {
        return Handlebars.create();
      },
    },
  ],
})
export class AuthModule {}