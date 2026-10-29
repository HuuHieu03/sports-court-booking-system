import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
  forwardRef,
} from '@nestjs/common';
import { STAFFING_REPOSITORY } from '../../../common/constants/tokens';
import { IStaffingRepository } from '../domain/staffing.repository.interface';
import { VenuesService } from '../../venues/application/venues.service';
import { ManagerApplicationEntity } from '../domain/manager-application.entity';
import { ManagerAppointmentEntity } from '../domain/manager-appointment.entity';
import { UsersService } from '../../users/application/users.service';
import { NotificationsService } from '../../notifications/application/notifications.service';

@Injectable()
export class StaffingService {
  constructor(
    @Inject(STAFFING_REPOSITORY)
    private readonly staffingRepository: IStaffingRepository,
    @Inject(forwardRef(() => VenuesService))
    private readonly venuesService: VenuesService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async setRecruitment(
    ownerId: string,
    venueId: string,
    recruitmentOpen?: boolean,
    recruitmentMessage?: string | null,
  ) {
    const venue = await this.venuesService.findById(venueId);
    if (!venue || venue.deletedAt) {
      throw new NotFoundException('Cụm sân không tồn tại');
    }
    if (venue.ownerId !== ownerId) {
      throw new ForbiddenException('Bạn không phải chủ sở hữu của cụm sân này');
    }

    const updated = await this.venuesService.setRecruitment(
      ownerId,
      venueId,
      recruitmentOpen,
      recruitmentMessage,
    );
    return {
      isOpen: updated.recruitmentOpen,
      message: updated.recruitmentMessage,
      venueId: updated.id,
      recruitmentOpen: updated.recruitmentOpen,
      recruitmentMessage: updated.recruitmentMessage,
      updatedAt: updated.updatedAt.toISOString(),
    };
  }

  async applyForManager(applicantId: string, venueId: string, consented: boolean) {
    if (!consented) {
      throw new BadRequestException('Bạn phải đồng ý chia sẻ thông tin liên hệ để ứng tuyển');
    }

    const venue = await this.venuesService.findById(venueId);
    if (!venue || venue.deletedAt) {
      throw new NotFoundException('Cụm sân không tồn tại');
    }
    if (!venue.recruitmentOpen) {
      throw new BadRequestException('Cụm sân này hiện đang không mở tuyển dụng quản lý');
    }
    if (venue.ownerId === applicantId) {
      throw new BadRequestException('Chủ sân không thể ứng tuyển làm quản lý sân của chính mình');
    }

    const existingApp = await this.staffingRepository.findApplicationByApplicantAndVenue(
      applicantId,
      venueId,
    );
    if (existingApp && existingApp.status === 'SUBMITTED') {
      throw new ConflictException('Bạn đã nộp hồ sơ ứng tuyển và đang chờ xét duyệt');
    }

    const isCurrentManager = await this.isUserActiveManager(applicantId, venueId);
    if (isCurrentManager) {
      throw new ConflictException('Bạn đang là quản lý đương nhiệm của cụm sân này');
    }

    const newApp = new ManagerApplicationEntity({
      id: crypto.randomUUID ? crypto.randomUUID() : `00000000-0000-4000-8000-${Date.now().toString(16).padStart(12, '0')}`,
      venueId,
      applicantId,
      status: 'SUBMITTED',
      consentedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const saved = await this.staffingRepository.saveApplication(newApp);
    return {
      id: saved.id,
      venueId: saved.venueId,
      applicantId: saved.applicantId,
      status: saved.status,
      consentToShareContact: true,
      consentedAt: saved.consentedAt.toISOString(),
      createdAt: saved.createdAt.toISOString(),
    };
  }

  async getApplications(ownerId: string, venueId: string) {
    const venue = await this.venuesService.findById(venueId);
    if (!venue || venue.deletedAt) {
      throw new NotFoundException('Cụm sân không tồn tại');
    }
    if (venue.ownerId !== ownerId) {
      throw new ForbiddenException('Chỉ chủ sân mới có quyền xem danh sách ứng viên');
    }

    const apps = await this.staffingRepository.findApplicationsByVenue(venueId);
    const result = [];
    for (const app of apps) {
      const applicant = await this.usersService.findById(app.applicantId);
      result.push({
        application: {
          id: app.id,
          venueId: app.venueId,
          applicantId: app.applicantId,
          status: app.status,
          consentToShareContact: true,
          consentedAt: app.consentedAt.toISOString(),
          createdAt: app.createdAt.toISOString(),
        },
        contact: applicant
          ? {
              id: applicant.id,
              fullName: applicant.fullName,
              email: applicant.email,
              phone: applicant.phone,
            }
          : {
              id: app.applicantId,
              fullName: 'Chưa cập nhật',
              email: 'unknown@example.com',
              phone: '+84000000000',
            },
      });
    }
    return result;
  }

  async appointManager(ownerId: string, venueId: string, applicationId: string) {
    const venue = await this.venuesService.findById(venueId);
    if (!venue || venue.deletedAt) {
      throw new NotFoundException('Cụm sân không tồn tại');
    }
    if (venue.ownerId !== ownerId) {
      throw new ForbiddenException('Chỉ chủ sân mới có quyền bổ nhiệm quản lý');
    }

    const application = await this.staffingRepository.findApplicationById(applicationId);
    if (!application || application.venueId !== venueId) {
      throw new NotFoundException('Hồ sơ ứng tuyển không tồn tại');
    }
    if (application.status !== 'SUBMITTED') {
      throw new BadRequestException('Chỉ có thể bổ nhiệm hồ sơ ở trạng thái SUBMITTED');
    }

    // Business Constraint: At most 1 active Manager per venue at any time
    const existingActiveAppointment = await this.staffingRepository.findActiveAppointment(venueId);
    if (existingActiveAppointment) {
      throw new ConflictException(
        'Cụm sân hiện đã có quản lý đang đương nhiệm. Vui lòng thu hồi quyền của quản lý cũ trước khi bổ nhiệm người mới',
      );
    }

    // Update application
    application.appoint();
    await this.staffingRepository.updateApplication(application);

    // Create appointment
    const appointment = new ManagerAppointmentEntity({
      id: crypto.randomUUID ? crypto.randomUUID() : `00000000-0000-4000-8000-${Date.now().toString(16).padStart(12, '0')}`,
      applicationId: application.id,
      venueId,
      userId: application.applicantId,
      appointedAt: new Date(),
      revokedAt: null,
    });
    const savedApt = await this.staffingRepository.saveAppointment(appointment);

    // HOOK-03: Synchronous outbox dispatch
    await this.notificationsService.dispatchSync({
      recipientId: application.applicantId,
      type: 'MANAGER_APPOINTED',
      message: `Chúc mừng! Bạn đã được bổ nhiệm làm quản lý tại cụm sân ${venue.name}.`,
    });

    return {
      id: savedApt.id,
      venueId: savedApt.venueId,
      userId: savedApt.userId,
      appointedAt: savedApt.appointedAt.toISOString(),
    };
  }

  async getManagers(requesterId: string, venueId: string) {
    const venue = await this.venuesService.findById(venueId);
    if (!venue || venue.deletedAt) {
      throw new NotFoundException('Cụm sân không tồn tại');
    }

    const isOwner = venue.ownerId === requesterId;
    const isManager = await this.isUserActiveManager(requesterId, venueId);
    if (!isOwner && !isManager) {
      throw new ForbiddenException('Bạn không có quyền xem thông tin quản lý cụm sân này');
    }

    const appointments = await this.staffingRepository.findAppointmentsByVenue(venueId);
    const result = [];
    for (const apt of appointments) {
      const profile = await this.usersService.getMe(apt.userId);
      result.push({
        appointment: {
          id: apt.id,
          venueId: apt.venueId,
          userId: apt.userId,
          appointedAt: apt.appointedAt.toISOString(),
          revokedAt: apt.revokedAt ? apt.revokedAt.toISOString() : null,
        },
        profile,
      });
    }
    return result;
  }

  async revokeManager(ownerId: string, venueId: string, targetUserId: string) {
    const venue = await this.venuesService.findById(venueId);
    if (!venue || venue.deletedAt) {
      throw new NotFoundException('Cụm sân không tồn tại');
    }
    if (venue.ownerId !== ownerId) {
      throw new ForbiddenException('Chỉ chủ sân mới có quyền thu hồi quyền quản lý');
    }

    const appointment = await this.staffingRepository.findActiveAppointment(venueId, targetUserId);
    if (!appointment) {
      throw new NotFoundException('Người dùng này không phải là quản lý đang đương nhiệm của cụm sân');
    }

    // Revoke appointment immediately
    appointment.revoke();
    await this.staffingRepository.updateAppointment(appointment);

    // Update corresponding application
    const app = await this.staffingRepository.findApplicationById(appointment.applicationId);
    if (app) {
      app.revoke();
      await this.staffingRepository.updateApplication(app);
    }
  }

  async isUserActiveManager(userId: string, venueId: string): Promise<boolean> {
    const apt = await this.staffingRepository.findActiveAppointment(venueId, userId);
    return apt !== null && apt.isActive();
  }

  async getActiveManagedVenueIds(userId: string): Promise<string[]> {
    const apts = await this.staffingRepository.findActiveAppointmentsByUser(userId);
    return apts.map((a) => a.venueId);
  }

  async getActiveManagerForVenue(venueId: string) {
    const apt = await this.staffingRepository.findActiveAppointment(venueId);
    if (!apt) return null;
    const user = await this.usersService.findById(apt.userId);
    if (!user) return null;
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      appointedAt: apt.appointedAt.toISOString(),
    };
  }

  async revokeManagerOnVenueDeletion(venueId: string): Promise<void> {
    const appointment = await this.staffingRepository.findActiveAppointment(venueId);
    if (appointment) {
      appointment.revoke();
      await this.staffingRepository.updateAppointment(appointment);

      const app = await this.staffingRepository.findApplicationById(appointment.applicationId);
      if (app) {
        app.revoke();
        await this.staffingRepository.updateApplication(app);
      }
    }
  }
}
