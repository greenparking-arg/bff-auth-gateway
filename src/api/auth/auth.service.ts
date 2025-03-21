import { BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import dayjs from 'dayjs';
import { Rol } from '../entities/rol.entity';
import { User } from '../entities/user.entity';
import { v4 as uuidv4 } from 'uuid';
import { UsersService } from '../users/users.service';
import { PasswordResetToken } from './schemas/password-reset-token.schema';
import { ContactService } from '../contact/contact.service';
import { CreatePdfService } from '../../services/create-pdf.service';
import * as crypto from 'node:crypto';

export interface Payload {
  id: number;
  name: string;
  email: string;
  role: Rol;
  value: string;
  createToken: any;
  permissions: string[]; // Ajusta según el tipo real de permissions
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private usersService: UsersService,
    private contactService: ContactService,
    private createPdfService: CreatePdfService,
    @InjectRepository(PasswordResetToken)
    private readonly passwordResetTokenRepository: Repository<PasswordResetToken>,
  ) {}

  /**
   * Validates a plain text password against a hashed password.
   *
   * @param {string} plainTextPassword - The plain text password to be validated.
   * @param {string} hashedPassword - The hashed password for comparison.
   * @return {Promise<boolean>} - A Promise that resolves to a boolean indicating whether the plain text password matches the hashed password.
   */
  async validatePassword(plainTextPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainTextPassword, hashedPassword);
  }

  /**
   * return jwt signed
   * @param user
   * @param role
   */
  payload = (user: User, role: Rol): Payload => {
    let pd = {
      id: user.id,
      name: user.nombre,
      email: user.email,
      role: user.rol,
      value: uuidv4(),
      createToken: dayjs().unix(),
      permissions: role?.permisos?.length ? role.permisos.map((value) => value.nombre) : [],
    };

    return pd;
  };

  async generateAccessToken(
    user: User,
    role: Rol,
    refresh: boolean = false,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const payload = this.payload(user, role);
    try {
      if (refresh) {
        await this.usersService.refreshActivePersonalToken(payload);
      } else {
        await this.usersService.createActivePersonalToken(payload);
      }
    } catch (e) {
      this.logger.error(e);
      throw new BadRequestException('The user is blocked, please contact your administrator.');
    }

    return {
      accessToken: this.sign(payload),
      refreshToken: this.sign(payload, {
        expiresIn: this.configService.get('JWT_SECRET_EXPIRES_REFRESH_IN'),
      }),
    };
  }

  /**
   * Signs a payload using JWT.
   *
   * @param {Partial<User>} payload - The payload to sign.
   * @param {JwtSignOptions} [options] - The options for signing the payload (optional).
   * @private
   * @returns {string} - The signed JWT token.
   */
  private sign(payload: Payload, options?: JwtSignOptions): string {
    return this.jwtService.sign(payload, options);
  }

  /**
   * Checks if the given token will expire in the future.
   *
   * @param {string} token - The JWT token to be checked.
   * false if it will not, and undefined if an error occurs during verification.
   */
  async willExpireToken(token: string): Promise<boolean | undefined> {
    try {
      await this.verify(token, this.configService.get('JWT_SECRET'));
      const payload = this.decode(token);
      const now = dayjs(new Date()).unix();

      return payload.exp > now;
    } catch (e) {
      return undefined;
    }
  }

  /**
   * return jwt signed
   * @param token
   * @param secret
   */
  verify(token: string, secret: string) {
    return this.jwtService.verifyAsync(token, { secret });
  }

  /**
   * return jwt signed
   * @param token
   */
  decode(token: string) {
    return this.jwtService.decode(token);
  }

  /**
   * Validates the provided user based on their role and associated company ids.
   *
   * @param {User} user - The user object to be validated.
   */
  validateUser(user: User) {
    if (!user) {
      throw new UnauthorizedException('Incorrect User or Password.');
    }

    if (!user.rol) throw new BadRequestException('The user is blocked, please contact your administrator.');

    this.logger.debug(user);
  }

  /**
   * Initiates the password reset process for the user identified by the provided email.
   *
   * @param {string} email - The email address of the user requesting the password reset.
   */
  async requestPasswordReset(email: string) {
    const user = await this.usersService.findByEmail(email.toLowerCase());
    if (!user) {
      this.logger.error(`${email.toLowerCase()} The email is not registered.`);
      return;
    }

    const token = crypto.randomBytes(20).toString('hex');

    // Crear una nueva instancia de PasswordResetToken usando TypeORM
    const resetToken = this.passwordResetTokenRepository.create({
      token,
      user, // Pasamos la instancia completa de User (si la relación está definida)
    });

    // Guardar el token en la base de datos
    await this.passwordResetTokenRepository.save(resetToken);

    const configuration = {
      logo: this.configService.get('APP_LOGO'),
      color: this.configService.get('APP_COLOR'),
      passwordLink: this.configService.get('RECOVERY_PASSWORD_PUBLIC_URL'),
    };

    this.logger.log(`configuration.passwordLink: ${configuration.passwordLink}`);

    const data = {
      logo: configuration.logo || '',
      usuario: `${user.nombre || ''}`,
      reset_url: `${configuration.passwordLink}/${token}`,
    };

    this.logger.log(`data.reset_url: ${data.reset_url}`);

    const htmlData = this.createPdfService.renderTemplateComponent('../templates/password-reset.template.hbs', data);

    await this.contactService.sendPasswordRecovery(
      user.email,
      'Facil Parking: Pedido de cambio de contraseña 🔑',
      htmlData,
    );
  }

  /**
   * Resets the password for the user identified by the provided password reset token.
   *
   * @param {string} token - The password reset token.
   * @param {string} newPassword - The new password to be set.
   */
  async resetPassword(token: string, newPassword: string) {
    const resetToken = await this.passwordResetTokenRepository.findOne({
      where: { token },
      relations: ['user'], // Cargar la relación con User
    });

    if (!resetToken || resetToken.used) {
      this.logger.error('Invalid or expired password reset token');
      throw new Error('Invalid or expired password reset token');
    }

    // Pasar el ID del usuario en lugar de la instancia completa
    const user = await this.usersService.findById(resetToken.user.id);

    if (!user) {
      this.logger.error('User not found');
      throw new Error('Invalid User or expired password reset token');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await this.usersService.userRepository.save(user);

    resetToken.used = true;
    await this.passwordResetTokenRepository.save(resetToken);

    return;
  }
}
