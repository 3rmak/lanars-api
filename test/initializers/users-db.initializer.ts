import { randomUUID } from 'crypto';

import { AuthService } from '../../src/modules/auth/auth.service';
import { UserService } from '../../src/modules/user/user.service';

import { User } from '../../src/modules/user/user.model';

import { CreateUserDto } from '../../src/modules/user/dto/create-user.dto';

export class UsersDbInitializer {
  constructor(private usersService: UserService, private authService: AuthService) {}

  private static performDto(): CreateUserDto {
    const uuid = randomUUID();
    return {
      email: `user${uuid}@email.com`,
      password: 'password',
    };
  }

  public async initUsers(userCount: number): Promise<User[]> {
    const users: User[] = [];

    for (let i = 0; i < userCount; i++) {
      const user = await this.usersService.createUser(UsersDbInitializer.performDto());
      user.password = await this.authService.generateToken(user);
      users.push(user);
    }

    return users;
  }
}
