import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity'; // Ajusta la ruta según tu estructura
import { Rol } from '../entities/rol.entity'; // Ajusta la ruta
import { Permission } from '../entities/permission.entity'; // Ajusta la ruta
import { PersonalToken } from '../entities/personal-token.entity'; // Ajusta la ruta
import { UsersService } from './users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Rol, Permission, PersonalToken]),
  ],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}