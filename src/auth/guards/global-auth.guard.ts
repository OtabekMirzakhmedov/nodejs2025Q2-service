// src/auth/guards/global-auth.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class GlobalAuthGuard implements CanActivate {
  private readonly logger = new Logger(GlobalAuthGuard.name);

  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const { url, method } = request;

    this.logger.debug(`Checking auth for: ${method} ${url}`);

    // Allow these routes without authentication (exact matches or specific patterns)
    const publicRoutes = [
      '/auth/signup',
      '/auth/login',
      '/auth/refresh',
      '/doc',
    ];

    // Check if current route is public (exact match or starts with specific paths)
    const isPublicRoute =
      publicRoutes.some(
        (route) => url === route || url.startsWith(route + '/'),
      ) || url === '/';

    if (isPublicRoute) {
      this.logger.debug(`Public route allowed: ${url}`);
      return true;
    }

    this.logger.debug(`Protected route, checking token: ${url}`);

    // For all other routes, require JWT authentication
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      this.logger.debug(`No token found for: ${url}`);
      throw new UnauthorizedException('Access token is required');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET_KEY,
      });

      this.logger.debug(`Token valid for: ${url}`);
      request['user'] = payload;
      return true;
    } catch (error) {
      this.logger.debug(`Invalid token for: ${url}`);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
