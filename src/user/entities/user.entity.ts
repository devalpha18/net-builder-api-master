import {
  BeforeInsert,
  Column, CreateDateColumn, DeleteDateColumn,
  Entity, IsNull,
  JoinColumn,
  ManyToOne, Not, OneToMany,
  OneToOne, PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { hash } from 'bcrypt';

import { SoftDelete } from '../../common/core/soft-delete';
import { UserRole } from '../../common/enums/user-role.enum';
import { UserDto, UserWithProfileDto } from '../dtos/user.dto';
import { Profile } from './profile.entity';
import { Invitation } from './invitation.entity';
import { Friend } from './friend.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('user')
export class User {
  static scope = {
    default: {
      deletedAt: IsNull(),
    },
    allEntity: {
      deletedAt: Not(IsNull()),
    },
  };

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column({ nullable: true, default: undefined })
  walletAddress?: string;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @Column()
  @Exclude()
  password: string;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ default: 0 })
  star: number;

  @Exclude()
  @DeleteDateColumn()
  deletedAt?: string;

  @CreateDateColumn()
  @ApiProperty()
  createdAt: string;

  @UpdateDateColumn()
  @ApiProperty()
  updatedAt: string;

  @BeforeInsert()
  preProcess() {
    this.email = this.email.toLowerCase();
    return hash(this.password, 10).then(
      (encrypted) => (this.password = encrypted),
    );
  }

  @OneToOne(() => Profile, (profile) => profile.user)
  @JoinColumn()
  profile: Profile;

  @OneToOne(() => Invitation, (invitation) => invitation.user)
  @JoinColumn()
  invitation: Invitation;

  @ManyToOne(() => Profile, (profile) => profile.invitees)
  invitor: Profile;

  @OneToMany(() => Friend, (friend) => friend.parent)
  friends: Friend[]; // this is for me

  @OneToMany(() => Friend, (friend) => friend.children)
  parent: Friend[];

  toUserDto(): UserDto {
    return {
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      role: this.role,
      walletAddress: this.walletAddress,
      isEmailVerified: this.isEmailVerified,
      star: this.star,
      invitation: this.invitation ? this.invitation.id : null
    };
  }

  toUserWithProfileDto(): UserWithProfileDto {
    return {
      ...this.toUserDto(),
      invitor: this.invitor ? this.invitor.user.toUserDto() : null
    };
  }
}
