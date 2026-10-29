import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../../users/application/users.service';
import { RegisterDto } from '../presentation/dto/register.dto';
import { LoginDto } from '../presentation/dto/login.dto';
import { AuthResult, JwtPayload } from '../domain/auth.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResult> {
    const normalizedEmail = dto.email.trim().toLowerCase();
    const normalizedPhone = this.normalizePhone(dto.phone);

    const existingEmail = await this.usersService.findByEmail(normalizedEmail);
    if (existingEmail) {
      throw new ConflictException('Email này đã được sử dụng');
    }

    const existingPhone = await this.usersService.findByPhone(normalizedPhone);
    if (existingPhone) {
      throw new ConflictException('Số điện thoại này đã được sử dụng');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const account = await this.usersService.create({
      fullName: dto.fullName.trim(),
      email: normalizedEmail,
      phone: normalizedPhone,
      passwordHash,
      role: dto.role,
    });

    const payload: JwtPayload = {
      sub: account.id,
      email: account.email,
      role: account.role,
    };

    const accessToken = this.jwtService.sign(payload);
    const profile = await this.usersService.getMe(account.id);

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: 604800,
      account: profile,
    };
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const rawIdentifier = dto.email.trim();
    let account = null;

    if (rawIdentifier.includes('@')) {
      account = await this.usersService.findByEmail(rawIdentifier.toLowerCase());
    } else {
      const normalizedPhone = this.normalizePhone(rawIdentifier);
      account = await this.usersService.findByPhone(normalizedPhone);
      if (!account) {
        account = await this.usersService.findByEmail(rawIdentifier.toLowerCase());
      }
    }

    if (!account) {
      throw new UnauthorizedException('Email, số điện thoại hoặc mật khẩu không chính xác');
    }

    if (account.isLocked() || account.isDeleted()) {
      throw new UnauthorizedException(
        'Tài khoản đã bị khóa hoặc không còn hoạt động trên hệ thống',
      );
    }

    const isPasswordValid = await bcrypt.compare(dto.password, account.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email, số điện thoại hoặc mật khẩu không chính xác');
    }

    const payload: JwtPayload = {
      sub: account.id,
      email: account.email,
      role: account.role,
    };

    const accessToken = this.jwtService.sign(payload);
    const profile = await this.usersService.getMe(account.id);

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: 604800,
      account: profile,
    };
  }

  private normalizePhone(phone: string): string {
    const clean = phone.replace(/[\s.-]/g, '');
    if (clean.startsWith('+')) return clean;
    if (clean.startsWith('0')) return '+84' + clean.slice(1);
    if (clean.startsWith('84')) return '+' + clean;
    return clean;
  }
}
