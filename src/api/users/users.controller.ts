import { Controller, Post, Body, HttpCode, HttpStatus, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { Public } from '../../guards/public.guard';
import { UsersService } from './users.service';

@Controller('public/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('check')
  checkIfExists(@Body('userIdentifier') userIdentifier: string, @Body('email') email: string) {
    return this.usersService.checkIfExists(userIdentifier, email);
  }

}
