import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ContactDto } from './dtos/contact.dto';
import { SuccessResponse } from '../common/models/common.model';
import { MailService } from '../mail/mail.service';

@Controller('api/contact')
@ApiTags('Contact')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ContactController {
  constructor(
    private readonly mailService: MailService
  ) {
  }

  @Post('add')
  async addContact(@Request() req, @Body() body: ContactDto): Promise<SuccessResponse> {
    await this.mailService.sendContact(body.email, body.id, body.title, body.content);
    return new SuccessResponse();
  }
}
