import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { UsersService } from '../../modules/users/application/users.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      if (isPublic) {
        return true;
      }
      throw new UnauthorizedException('Thiếu access token hoặc token không hợp lệ');
    }

    const token = authHeader.split(' ')[1];
    try {
      const payload = this.jwtService.verify(token);
      
      // Dynamic verification: Validate status from service, not just trusting old token
      const account = await this.usersService.findById(payload.sub);
      if (!account || account.status !== 'ACTIVE' || account.deletedAt) {
        throw new UnauthorizedException('Tài khoản đã bị khóa hoặc không còn hiệu lực');
      }

      request.user = {
        userId: account.id,
        email: account.email,
        role: account.role,
        status: account.status,
      };

      return true;
    } catch (err) {
      if (isPublic) {
        return true;
      }
      if (err instanceof UnauthorizedException) {
        throw err;
      }
      throw new UnauthorizedException('Token đã hết hạn hoặc không hợp lệ');
    }
  }
}
