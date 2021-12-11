import { Entity, OneToOne } from 'typeorm';
import { SoftDelete } from '../../common/core/soft-delete';
import { User } from './user.entity';

@Entity('invitation')
export class Invitation extends SoftDelete {
  @OneToOne(() => User, (user) => user.invitation)
  user: User;
}
