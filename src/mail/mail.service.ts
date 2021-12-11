import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(
    private mailerService: MailerService
  ) {
  }
  async sendUpdateInfoCodeVerification(userEmail:string, code: string) {
    await this.mailerService.sendMail({
      to: userEmail,
      subject: 'Verification code',
      template: './update-user',
      context: {
        code: code
      }
    })
  }
  async sendForgotPasswordCodeVerification(userEmail:string, code: string) {
    await this.mailerService.sendMail({
      to: userEmail,
      subject: 'Verification code',
      template: './forgot-password',
      context: {
        code: code
      }
    })
  }
  async sendContact(email:string, id: string, title: string, content: string) {
    await this.mailerService.sendMail({
      to: 'cuteadonis32@gmail.com',
      subject: title,
      template: './contact',
      context: {
        email: email,
        id: id,
        title: title,
        content: content
      }
    })
  }
}
