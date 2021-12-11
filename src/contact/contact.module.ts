import { Module } from '@nestjs/common';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';
import { MailModule } from '../mail/mail.module';

@Module({
  controllers: [ContactController],
  providers: [ContactService],
  imports: [
    MailModule
  ]
})
export class ContactModule {}
