import { UserRole } from '../enums/user-role.enum';
import { SeedUserPrimary } from '../models/seed-user.model';
import { AddUserDto } from '../../user/dtos/add-user.dto';

const defaultPassword = 'password';

const admins: SeedUserPrimary[] = [
  { email: 'jami.admin', firstName: 'Jami', lastName: 'Brook' },
  { email: 'kelly.admin', firstName: 'Kelly', lastName: 'Gonzales' },
];

export function generateAccounts(
  email: string,
  firstName: string,
  lastName: string,
  role: UserRole,
): AddUserDto {
  return {
    email,
    password: defaultPassword,
    firstName: firstName,
    lastName: lastName,
    role: role,
  };
}

export function generateAdminAccounts(): AddUserDto[] {
  return admins.map((user) =>
    generateAccounts(
      `${user.email}@netbuilder.com`,
      user.firstName,
      user.lastName,
      UserRole.Admin,
    ),
  );
}
