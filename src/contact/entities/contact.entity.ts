import { Column, Entity } from 'typeorm';
import { SoftDelete } from '../../common/core/soft-delete';
import { ContactDto } from '../dtos/contact.dto';

@Entity('contact')
export class Contact extends SoftDelete {
  @Column()
  email: string;

  @Column()
  id: string;

  @Column()
  title: string;

  @Column()
  content: string;

  toContactDto(): ContactDto {
    return {
      email: this.email,
      id: this.id,
      title: this.title,
      content: this.content
    };
  }
}