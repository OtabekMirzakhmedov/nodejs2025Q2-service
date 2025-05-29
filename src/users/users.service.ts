import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { User } from './entities/user.entity';

export type UserResponse = Omit<User, 'password'>;

@Injectable()
export class UsersService {
  private users: User[] = [];

  private mapToUserResponse(user: User): UserResponse {
    return {
      id: user.id,
      login: user.login,
      version: user.version,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  findAll(): UserResponse[] {
    return this.users.map((user) => this.mapToUserResponse(user));
  }

  findOne(id: string): UserResponse {
    const user = this.users.find((user) => user.id === id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return this.mapToUserResponse(user);
  }

  create(createUserDto: CreateUserDto): UserResponse {
    const now = Date.now();
    const newUser: User = {
      id: randomUUID(),
      login: createUserDto.login,
      password: createUserDto.password,
      version: 1,
      createdAt: now,
      updatedAt: now,
    };

    this.users.push(newUser);
    return this.mapToUserResponse(newUser);
  }

  updatePassword(
    id: string,
    updatePasswordDto: UpdatePasswordDto,
  ): UserResponse {
    const user = this.users.find((user) => user.id === id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    if (user.password !== updatePasswordDto.oldPassword) {
      throw new ForbiddenException('Old password is incorrect');
    }

    user.password = updatePasswordDto.newPassword;
    user.version += 1;
    user.updatedAt = Date.now();

    return this.mapToUserResponse(user);
  }

  remove(id: string): void {
    const userIndex = this.users.findIndex((user) => user.id === id);
    if (userIndex === -1) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    this.users.splice(userIndex, 1);
  }
}
