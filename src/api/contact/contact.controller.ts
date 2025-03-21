import { Controller, Post, Body } from '@nestjs/common';
import { ContactService } from './contact.service';
import { Public } from '../../guards/public.guard';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Public()
  @Post('send')
  async sendContactEmail(
    @Body('email') email: string,
    @Body('name') name: string,
    @Body('subject') subject: string,
    @Body('text') text: string,
  ): Promise<{ message: string }> {
    await this.contactService.sendContactEmail(email, name, subject, text);
    return { message: 'Correo enviado correctamente' };
  }
}
