import { Injectable } from '@nestjs/common';
import { IStaffingRepository } from '../domain/staffing.repository.interface';
import {
  ManagerApplicationEntity,
  ApplicationStatus,
} from '../domain/manager-application.entity';
import { ManagerAppointmentEntity } from '../domain/manager-appointment.entity';
import { PrismaService } from '../../../common/prisma/prisma.service';
import {
  ManagerApplication as PrismaApplication,
  ManagerAppointment as PrismaAppointment,
} from '../../../generated/prisma/client';

@Injectable()
export class PrismaStaffingRepository implements IStaffingRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toApplicationEntity(raw: PrismaApplication): ManagerApplicationEntity {
    return new ManagerApplicationEntity({
      id: raw.id,
      venueId: raw.venueId,
      applicantId: raw.applicantId,
      status: raw.status as ApplicationStatus,
      consentedAt: raw.consentedAt,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  private toAppointmentEntity(raw: PrismaAppointment): ManagerAppointmentEntity {
    return new ManagerAppointmentEntity({
      id: raw.id,
      applicationId: raw.applicationId,
      venueId: raw.venueId,
      userId: raw.userId,
      appointedAt: raw.appointedAt,
      revokedAt: raw.revokedAt,
    });
  }

  async findApplicationById(id: string): Promise<ManagerApplicationEntity | null> {
    const record = await this.prisma.managerApplication.findUnique({ where: { id } });
    return record ? this.toApplicationEntity(record) : null;
  }

  async findApplicationsByVenue(venueId: string): Promise<ManagerApplicationEntity[]> {
    const records = await this.prisma.managerApplication.findMany({
      where: { venueId },
      orderBy: { createdAt: 'desc' },
    });
    return records.map((r) => this.toApplicationEntity(r));
  }

  async findApplicationByApplicantAndVenue(
    applicantId: string,
    venueId: string,
  ): Promise<ManagerApplicationEntity | null> {
    const record = await this.prisma.managerApplication.findFirst({
      where: {
        applicantId,
        venueId,
        status: { in: ['SUBMITTED', 'APPOINTED'] },
      },
      orderBy: { createdAt: 'desc' },
    });
    return record ? this.toApplicationEntity(record) : null;
  }

  async saveApplication(app: ManagerApplicationEntity): Promise<ManagerApplicationEntity> {
    const created = await this.prisma.managerApplication.create({
      data: {
        id: app.id,
        venueId: app.venueId,
        applicantId: app.applicantId,
        status: app.status as any,
        consentedAt: app.consentedAt,
        createdAt: app.createdAt,
        updatedAt: app.updatedAt,
      },
    });
    return this.toApplicationEntity(created);
  }

  async updateApplication(app: ManagerApplicationEntity): Promise<ManagerApplicationEntity> {
    const updated = await this.prisma.managerApplication.update({
      where: { id: app.id },
      data: {
        status: app.status as any,
        updatedAt: app.updatedAt,
      },
    });
    return this.toApplicationEntity(updated);
  }

  async findActiveAppointment(
    venueId: string,
    userId?: string,
  ): Promise<ManagerAppointmentEntity | null> {
    const where: any = {
      venueId,
      revokedAt: null,
    };
    if (userId) {
      where.userId = userId;
    }

    const record = await this.prisma.managerAppointment.findFirst({ where });
    return record ? this.toAppointmentEntity(record) : null;
  }

  async findAppointmentsByVenue(venueId: string): Promise<ManagerAppointmentEntity[]> {
    const records = await this.prisma.managerAppointment.findMany({
      where: { venueId },
      orderBy: { appointedAt: 'desc' },
    });
    return records.map((r) => this.toAppointmentEntity(r));
  }

  async findActiveAppointmentsByUser(userId: string): Promise<ManagerAppointmentEntity[]> {
    const records = await this.prisma.managerAppointment.findMany({
      where: {
        userId,
        revokedAt: null,
      },
      orderBy: { appointedAt: 'desc' },
    });
    return records.map((r) => this.toAppointmentEntity(r));
  }

  async saveAppointment(
    appointment: ManagerAppointmentEntity,
  ): Promise<ManagerAppointmentEntity> {
    const created = await this.prisma.managerAppointment.create({
      data: {
        id: appointment.id,
        applicationId: appointment.applicationId,
        venueId: appointment.venueId,
        userId: appointment.userId,
        appointedAt: appointment.appointedAt,
        revokedAt: appointment.revokedAt,
      },
    });
    return this.toAppointmentEntity(created);
  }

  async updateAppointment(
    appointment: ManagerAppointmentEntity,
  ): Promise<ManagerAppointmentEntity> {
    const updated = await this.prisma.managerAppointment.update({
      where: { id: appointment.id },
      data: {
        revokedAt: appointment.revokedAt,
      },
    });
    return this.toAppointmentEntity(updated);
  }
}
