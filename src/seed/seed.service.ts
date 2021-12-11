import { Injectable } from '@nestjs/common';
import { generateAdminAccounts } from '../common/utils/seed-user.util';
import { UserService } from '../user/user.service';

@Injectable()
export class SeedService {
  constructor(
    private readonly userService: UserService
  ) {
  }

  async startDevelopmentSeed() {
    await this.seedUsers();
  }

  async seedUsers() {
    const users = [...generateAdminAccounts()];
    await Promise.all(
      users.map((user) => this.userService.add(user, false)),
    );
  }

}
