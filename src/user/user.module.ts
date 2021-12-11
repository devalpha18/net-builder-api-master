import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserService } from './user.service';

import { User } from './entities/user.entity';
import { Profile } from './entities/profile.entity';
import { Invitation } from './entities/invitation.entity';
import { Friend } from './entities/friend.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Profile, Invitation, Friend])],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
