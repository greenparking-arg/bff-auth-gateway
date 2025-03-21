import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../api/users/users.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AuthMiddleware.name);

  private readonly publicUrls: string[] = [
    '/base/auth/password-reset',
    '/api/v1/public/users/register',
    '/api/v1/public/users/check',
    '/api/v1/contact/send',
  ];

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private usersService: UsersService,
  ) {}

  /**
   * Middleware to authenticate and authorize the request using JWT token.
   * It extracts the token from the request header, verifies it, and fetches the user associated with the token.
   * If the token is invalid or the user is not found, it responds with an unauthorized status.
   *
   * @param {Request} req - The HTTP request object.
   * @param {Response} res - The HTTP response object.
   * @param {NextFunction} next - The callback to pass control to the next middleware function.
   */
  async use(req: Request, res: Response, next: NextFunction) {
    if (this.isPublicUrl(req)) {
      next();
      return;
    }

    try {
      const token = this.extractTokenFromHeader(req);

      if (!token) {
        res.status(401).send({
          message: 'Unauthorized',
          statusCode: 401,
        });
      }

      const jwtUser = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      const user = await this.usersService.findByUserTokenPersonal(jwtUser);

      console.log(user);

      if (!user) {
        res.status(401).send({
          message: 'Unauthorized',
          statusCode: 401,
        });
      }

      req['user'] = user;
      next();
    } catch (error) {
      this.logger.warn(`Unauthorized request to: ${req.originalUrl}`);
      res.status(401).send({
        message: 'Unauthorized',
        statusCode: 401,
      });
    }
  }

  /**
   * The function extracts a token from the authorization header of a request if the type is "bearer".
   * @param {Request} request - The `request` parameter is of type `Request`. It represents an HTTP request object that
   * contains information about the incoming request, such as headers, body, and query parameters.
   * @returns a string if the type of authorization is 'bearer', otherwise it returns undefined.
   */
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  /**
   * The function checks if the request URL is in the list of public URLs that do not require authentication.
   * @param {Request} req - The request object.
   * @returns a boolean indicating whether the URL is public or not.
   */
  private isPublicUrl(req: Request): boolean {
    console.log(req.url);
    return this.publicUrls.some((url) => req.url.includes(url));
  }
}
