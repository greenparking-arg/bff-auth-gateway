import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sgMail from '@sendgrid/mail';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);
  constructor(private configService: ConfigService) {
    const sendGridApiKey = this.configService.get<string>('SEND_GRID_API_KEY');
    sgMail.setApiKey(sendGridApiKey);
  }

  /**
   * Sends a contact email using the provided parameters.
   *
   * @param {string} fromEmail - The email address of the sender.
   * @param {string} name - The name of the sender.
   * @param {string} subject - The subject of the email.
   * @param {string} text - The text content of the email.
   */
  async sendContactEmail(fromEmail: string, name: string, subject: string, text: string): Promise<void> {
    const msg = {
      to: 'contacto@beartrackapp.com',
      from: { email: 'emolina@beartrackapp.com', name: name },
      subject: fromEmail + ': ' + subject || 'Sin Asunto',
      text: text,
      html: `<p>${text}</p>`,
    };

    try {
      await sgMail.send(msg);
      this.logger.log('Correo enviado correctamente');
    } catch (error) {
      this.logger.error('Error al enviar el correo:', error.response ? error.response.body : error.message);
    }
  }

  /**
   * Sends a password recovery email to a specified email address.
   *
   * @param {string} toEmail - The recipient's email address.
   * @param {string} subject - The subject of the email.
   * @param {string} body - The body content of the email.
   */
  async sendPasswordRecovery(toEmail: string, subject: string, body: string): Promise<void> {
    const msg = {
      to: toEmail,
      from: { email: 'contacto@beartrackapp.com', name: 'Contacto Beartrack' },
      subject: subject,
      html: body,
    };

    try {
      await sgMail.send(msg);
      this.logger.log('Correo enviado correctamente');
    } catch (error) {
      this.logger.log('mensaje: ', msg);
      this.logger.error(
        'Error al enviar el correo con sendgrid:',
        error.response ? error.response.body : error.message,
      );
    }
  }
}
