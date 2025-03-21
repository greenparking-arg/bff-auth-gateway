import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { createProxyMiddleware, debugProxyErrorsPlugin, loggerPlugin } from 'http-proxy-middleware';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MsS3Middleware implements NestMiddleware {
  private readonly logger = new Logger(MsS3Middleware.name);

  constructor(private configService: ConfigService) {}

  /**
   * Middleware function that proxies a request to a target URL defined in the configuration services.
   *
   * @param {Request} req - The incoming HTTP request object.
   * @param {Response} res - The outgoing HTTP response object.
   * @param {NextFunction} next - The next middleware function in the stack.
   */
  use(req: Request, res: Response, next: NextFunction) {
    const target = this.configService.get<string>('URL_MS_S3');

    const proxy = createProxyMiddleware({
      target: target,
      pathRewrite: {
        '/api/v1/files': '',
      },
      changeOrigin: true,
      timeout: 10000,
      on: {
        proxyReq: (proxyReq, req: Request, res: Response) => {
          this.logger.debug(
            `Proxying ms-s3 - ${req.method} HEADERS -  ${JSON.stringify(req.headers)} - request to: ${target}${req.url}`,
          );

          proxyReq.setHeader('s3-endpoint', this.configService.get<string>('S3_ENDPOINT'));

          proxyReq.setHeader('s3-region', this.configService.get<string>('S3_REGION'));

          proxyReq.setHeader('s3-access-key-id', this.configService.get<string>('S3_ACCESS_KEY_ID'));

          proxyReq.setHeader('s3-access-secret-key', this.configService.get<string>('S3_SECRET_ACCESS_KEY'));

          proxyReq.setHeader('s3-url', this.configService.get<string>('S3_URL'));

          proxyReq.setHeader('s3-bucket', this.configService.get<string>('S3_ACCESS_BUCKET'));

          proxyReq.setHeader('api-key', this.configService.get<string>('APIKEY_S3'));

          if (req.body && req.headers['content-type'] === 'application/json') {
            const bodyData = JSON.stringify(req.body);
            proxyReq.setHeader('Content-Type', 'application/json');
            proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
            proxyReq.write(bodyData);
          }
        },
        error: (err, req, res) => {
          this.logger.error(`Proxy error: ${err.message}`);
        },
      },
      plugins: [debugProxyErrorsPlugin, loggerPlugin],
    });

    proxy(req, res, next);
  }
}
