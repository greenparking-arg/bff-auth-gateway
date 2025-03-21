import { Controller, Req, Res, Next, All, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Controller('gateway')
export class GatewayController {
  private readonly logger = new Logger(GatewayController.name);

  @All('*')
  handle(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    next();
  }

  @All()
  handleAll(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    next();
  }
}
