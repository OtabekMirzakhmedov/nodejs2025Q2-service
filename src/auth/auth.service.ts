import {
  Injectable,
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { UserMapper } from './user.mapper';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async signup(signupDto: SignupDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { login: signupDto.login },
    });

    if (existingUser) {
      throw new ConflictException('User with this login already exists');
    }

    const saltRounds = parseInt(process.env.CRYPT_SALT) || 10;
    const hashedPassword = await bcrypt.hash(signupDto.password, saltRounds);

    const user = await this.prisma.user.create({
      data: {
        login: signupDto.login,
        password: hashedPassword,
      },
    });

    return UserMapper.toPublicUser(user);
  }

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { login: loginDto.login },
    });

    if (!user) {
      throw new ForbiddenException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new ForbiddenException('Invalid credentials');
    }

    const payload = { userId: user.id, login: user.login };
    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET_REFRESH_KEY,
      expiresIn: process.env.TOKEN_REFRESH_EXPIRE_TIME,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async refresh(refreshDto: RefreshDto) {
    if (!refreshDto.refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    try {
      const payload = await this.jwtService.verifyAsync(
        refreshDto.refreshToken,
        {
          secret: process.env.JWT_SECRET_REFRESH_KEY,
        },
      );

      const newPayload = { userId: payload.userId, login: payload.login };
      const accessToken = await this.jwtService.signAsync(newPayload);
      const refreshToken = await this.jwtService.signAsync(newPayload, {
        secret: process.env.JWT_SECRET_REFRESH_KEY,
        expiresIn: process.env.TOKEN_REFRESH_EXPIRE_TIME,
      });

      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throw new ForbiddenException('Invalid refresh token');
    }
  }
}
