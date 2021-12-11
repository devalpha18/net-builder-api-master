import { Column, Entity, ManyToOne } from 'typeorm';
import { SoftDelete } from '../../common/core/soft-delete';
import { User } from './user.entity';
import { FriendDto } from '../dtos/friend.dto';

@Entity('friend')
export class Friend extends SoftDelete {
  @ManyToOne(() => User, (user) => user.friends)
  parent: User;

  @Column()
  level: number;

  @ManyToOne(() => User, (user) => user.parent)
  children: User;

  toFriendDto(): FriendDto {
    return {
      level: this.level,
      user: this.children.toUserDto()
    };
  }
}
