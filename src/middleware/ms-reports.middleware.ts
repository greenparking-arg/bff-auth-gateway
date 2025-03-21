import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { createProxyMiddleware, debugProxyErrorsPlugin, loggerPlugin } from 'http-proxy-middleware';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MsReportsMiddleware implements NestMiddleware {
  private readonly logger = new Logger(MsReportsMiddleware.name);

  constructor(private configService: ConfigService) {}

  /**
   * Middleware function that proxies a request to a target URL defined in the configuration service.
   *
   * @param {Request} req - The incoming HTTP request object.
   * @param {Response} res - The outgoing HTTP response object.
   * @param {NextFunction} next - The next middleware function in the stack.
   */
  use(req: Request, res: Response, next: NextFunction) {
    const target = this.configService.get<string>('URL_MS_REPORTS');

    const proxy = createProxyMiddleware({
      target: target,
      pathRewrite: {
        '/api/v1': '',
      },
      changeOrigin: true,
      timeout: 30000,
      on: {
        proxyReq: (proxyReq, req: Request, res: Response) => {
          this.logger.debug(`Proxying MS-REPORTS - ${req.method} request to: ${target}${req.url}`);

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
