import { IsString, IsEmail, IsInt, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsString()
  nombre: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsInt()
  rolId: number;

  @IsInt()
  @IsOptional()
  municipioId?: number;

  @IsString()
  dni: string;
}
