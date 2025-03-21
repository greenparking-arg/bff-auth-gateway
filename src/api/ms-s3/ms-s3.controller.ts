import { Controller, Req, Res, Next, All, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Controller('files')
export class MsS3Controller {
  private readonly logger = new Logger(MsS3Controller.name);

  @All('*')
  handle(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    next();
  }

  @All()
  handleAll(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    next();
  }
}
