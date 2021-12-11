import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { AddUserDto } from './dtos/add-user.dto';
import { getFromDto } from '../common/utils/repository.util';
import { Profile } from './entities/profile.entity';
import { Invitation } from './entities/invitation.entity';
import { Friend } from './entities/friend.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    @InjectRepository(Invitation)
    private readonly invitationRepository: Repository<Invitation>,
    @InjectRepository(Friend)
    private readonly friendRepository: Repository<Friend>,
  ) {}

  findUserByEmail(email: string): Promise<User> {
    return this.userRepository.findOne({
      relations: ['profile', 'invitation', 'friends', 'profile.invitees', 'invitor', 'invitor.user'],
      where: { email: email.toLowerCase() },
    });
  }

  findUserById(id: number): Promise<User> {
    return this.userRepository.findOne({
      relations: ['profile', 'invitation', 'friends', 'friends.parent', 'friends.children', 'profile.invitees', 'invitor', 'invitor.user'],
      where: { id },
    });
  }

  async add(payload: AddUserDto, throwError = true): Promise<User> {
    const found = await this.userRepository.findOne({ email: payload.email });
    if (found && throwError) {
      throw new BadRequestException('Email already taken');
    } else if (found && !throwError) {
      return found;
    }
    const user: User = getFromDto(payload, new User());
    user.profile = await this.profileRepository.save(new Profile());
    user.invitation = await this.invitationRepository.save(new Invitation());
    return this.userRepository.save(user);
  }

  async verifyEmail(email: string): Promise<User> {
    const user = await this.findUserByEmail(email);
    if (!user) {
      throw new BadRequestException('Invalid email address');
    }
    user.isEmailVerified = true;
    return this.userRepository.save(user);
  }

  saveProfile(payload: Profile): Promise<Profile> {
    return this.profileRepository.save(payload);
  }

  async saveUser(user: User): Promise<User> {
    return this.userRepository.save(user);
  }

  findOnlyUserByEmail(email: string): Promise<User> {
    return this.userRepository.findOne({ email });
  }

  findOnlyUserById(Id: string): Promise<User> {
    return this.userRepository.findOne(Id);
  }

  findOnlyUserByWalletAddress(walletAddress: string): Promise<User> {
    return this.userRepository.findOne({ walletAddress });
  }

  async findOnlyUserByInviteId(Id: string): Promise<User> {
    const invitation = await this.invitationRepository.findOne({
      relations: ['user', 'user.profile'],
      where: { id: Id },
    });

    return invitation.user;
  }

  async walkthroughParents(inviteId: string, user: User) {
    const invitation = await this.invitationRepository.findOne({
      relations: ['user', 'user.profile'],
      where: { id: inviteId },
    });

    user.invitor = invitation.user.profile;
    await this.userRepository.save(user);

    let parent = user;
    let level = 1;
    do {
      parent = await this.findParentByUserId(parent.id);
      await this.addAsFriend(user, level, parent);
      level ++;
    } while (parent.invitor)

    return this.userRepository.save(invitation.user);
  }

  private async addAsFriend(me: User, level: number, parent: User): Promise<User> {
    let friend = new Friend();
    friend.children = me;
    friend.parent = parent;
    friend.level = level;
    friend = await this.friendRepository.save(friend);
    parent.friends = [...parent.friends, friend];
    return this.userRepository.save(parent);
  }

  private async findParentByUserId(userId: number): Promise<User> {
    const user = await this.findUserById(userId);
    const parentUser = user.invitor ? user.invitor.user : null;
    if (parentUser) {
      return this.findUserById(parentUser.id);
    } else {
      return null;
    }
  }
}
