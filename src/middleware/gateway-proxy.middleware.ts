import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { createProxyMiddleware, debugProxyErrorsPlugin, loggerPlugin } from 'http-proxy-middleware';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GatewayProxyMiddleware implements NestMiddleware {
  private readonly logger = new Logger(GatewayProxyMiddleware.name);

  constructor(private configService: ConfigService) {}

  /**
   * Middleware function that proxies a request to a target URL defined in the configuration services.
   *
   * @param {Request} req - The incoming HTTP request object.
   * @param {Response} res - The outgoing HTTP response object.
   * @param {NextFunction} next - The next middleware function in the stack.
   */
  use(req: Request, res: Response, next: NextFunction) {
    const target = this.configService.get<string>('URL_GATEWAY');

    const proxy = createProxyMiddleware({
      target: target,
      pathRewrite: {
        '/api/v1/gateway': '',
      },
      changeOrigin: true,
      timeout: 10000,
      on: {
        proxyReq: (proxyReq, req: Request, res: Response) => {
          this.logger.debug(
            `Proxying GATEWAY_PROXY - ${req.method} HEADERS -  ${JSON.stringify(req.headers)} - request to: ${target}${req.url}`,
          );

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
