import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Req,
  Logger,
} from '@nestjs/common';
import { LoginAuthDto } from './dto/login-auth.dto';
import { Public } from '../../guards/public.guard';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { RefreshAuthDto } from './dto/refresh-auth.dto';
import { Throttle } from '@nestjs/throttler';
import { Rol } from '../entities/rol.entity';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
  ) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 100, ttl: 60000 } })
  @Post('/sign-in')
  async create(@Body() loginAuthDto: LoginAuthDto) {
    const user = await this.userService.findByEmail(loginAuthDto.email);

    this.authService.validateUser(user);

    const isPasswordValid = await this.authService.validatePassword(loginAuthDto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Incorrect User or Password.');
    }

    const role: any | Rol = await this.userService.findByRolePermisos(user?.rol);

    if (!role) {
      throw new BadRequestException('The user is blocked, please contact your administrator.');
    }

    return this.authService.generateAccessToken(user, role);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 100, ttl: 20000 } })
  @Post('/refresh')
  async refresh(@Body() refreshAuthDto: RefreshAuthDto) {
    const isTokenExpired = await this.authService.willExpireToken(refreshAuthDto.refreshToken);

    if (!isTokenExpired) throw new UnauthorizedException('Invalid token.');

    const decodeToken = this.authService.decode(refreshAuthDto.refreshToken);

    const user = await this.userService.findByUserTokenPersonal(decodeToken);

    this.authService.validateUser(user);

    const role: any = await this.userService.findByRolePermisos(user?.rol);

    return this.authService.generateAccessToken(user, role, true);
  }

  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 100, ttl: 60000 } })
  @Post('/sign-out')
  async logout(@Req() req: any) {
    const tokenLogout = await this.userService.findByUserTokenPersonalLogout(req.user);

    return {
      success: tokenLogout,
    };
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('/request-password-reset')
  async requestPasswordReset(@Body() body: RequestPasswordResetDto) {
    this.logger.log(`Request de reset de contraseña para: ${body.email}`);

    try {
      const result = await this.authService.requestPasswordReset(body.email);

      this.logger.log(`Reset de contraseña solicitado correctamente para: ${body.email}`);
      return result;
    } catch (error) {
      this.logger.error(`Error al solicitar reset de contraseña para: ${body.email}`, error.stack);
      throw error;
    }
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('/reset-password')
  async resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(body.token, body.password);
  }
}
