import { Column, Entity, OneToMany, OneToOne } from 'typeorm';
import { SoftDelete } from '../../common/core/soft-delete';
import { User } from './user.entity';
import { ProfileDto } from '../dtos/profile.dto';

@Entity('profile')
export class Profile extends SoftDelete {
  @OneToOne(() => User, (user) => user.profile)
  user: User;

  @OneToMany(() => User, (user) => user.invitor)
  invitees: User[];

  @Column({ default: 0 })
  level: number;
}
