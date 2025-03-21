import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SendContactDto {
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  @IsEmail({}, { message: 'Debe ser un correo electrónico válido' })
  email: string;

  @IsNotEmpty({ message: 'El mensaje es obligatorio' })
  @IsString()
  message: string;
}
