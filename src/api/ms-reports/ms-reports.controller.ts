import { Controller, Req, Res, Next, All, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Controller('reports')
export class MsReportsController {
  private readonly logger = new Logger(MsReportsController.name);

  @All('*')
  handle(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    next();
  }

  @All()
  handleAll(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    next();
  }
}
