import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MeController } from './presentation/me.controller';
import { AdminAccountsController } from './presentation/admin-accounts.controller';
import { UsersService } from './application/users.service';
import { InMemoryAccountRepository } from './infrastructure/in-memory-account.repository';
import { ACCOUNT_REPOSITORY } from '../../common/constants/tokens';
import { StaffingModule } from '../staffing/staffing.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'fbs_jwt_secret_dev_key_2026',
      signOptions: { expiresIn: '7d' },
    }),
    forwardRef(() => StaffingModule),
  ],
  controllers: [MeController, AdminAccountsController],
  providers: [
    UsersService,
    {
      provide: ACCOUNT_REPOSITORY,
      useClass: InMemoryAccountRepository,
    },
  ],
  exports: [UsersService, JwtModule],
})
export class UsersModule {}
