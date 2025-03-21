import { Controller, Post, Body, HttpCode, HttpStatus, Get, Param } from '@nestjs/common';
import { Public } from '../../guards/public.guard';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('public/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('check')
  checkIfExists(@Body('userIdentifier') userIdentifier: string, @Body('email') email: string) {
    return this.usersService.checkIfExists(userIdentifier, email);
  }

  @Public()
  @HttpCode(HttpStatus.CREATED)
  @Post()
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  findUserById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }
}
