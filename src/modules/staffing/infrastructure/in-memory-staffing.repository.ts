import { Injectable } from '@nestjs/common';
import { IStaffingRepository } from '../domain/staffing.repository.interface';
import { ManagerApplicationEntity } from '../domain/manager-application.entity';
import { ManagerAppointmentEntity } from '../domain/manager-appointment.entity';

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;

export const SEED_STAFFING = {
  app1: id(4001),
  app2: id(4002),
  app3: id(4003),
  apt1: id(5001),
  apt2: id(5002),
};

@Injectable()
export class InMemoryStaffingRepository implements IStaffingRepository {
  private readonly applications: Map<string, ManagerApplicationEntity> = new Map();
  private readonly appointments: Map<string, ManagerAppointmentEntity> = new Map();

  constructor() {
    this.seedInitialStaffing();
  }

  private seedInitialStaffing() {
    const now = new Date();
    const daysAgo = (d: number) => new Date(Date.now() - d * 24 * 60 * 60 * 1000);

    const initialApps = [
      new ManagerApplicationEntity({
        id: SEED_STAFFING.app1,
        venueId: id(2001),
        applicantId: id(1004), // Minh
        status: 'APPOINTED',
        consentedAt: daysAgo(30),
        createdAt: daysAgo(30),
        updatedAt: daysAgo(28),
      }),
      new ManagerApplicationEntity({
        id: SEED_STAFFING.app2,
        venueId: id(2001),
        applicantId: id(1005), // Lan
        status: 'SUBMITTED',
        consentedAt: daysAgo(2),
        createdAt: daysAgo(2),
        updatedAt: daysAgo(2),
      }),
      new ManagerApplicationEntity({
        id: SEED_STAFFING.app3,
        venueId: id(2002),
        applicantId: id(1006), // Huy
        status: 'REVOKED',
        consentedAt: daysAgo(60),
        createdAt: daysAgo(60),
        updatedAt: daysAgo(20),
      }),
    ];

    for (const app of initialApps) {
      this.applications.set(app.id, app);
    }

    const initialApts = [
      new ManagerAppointmentEntity({
        id: SEED_STAFFING.apt1,
        applicationId: SEED_STAFFING.app1,
        venueId: id(2001),
        userId: id(1004),
        appointedAt: daysAgo(28),
        revokedAt: null,
      }),
      new ManagerAppointmentEntity({
        id: SEED_STAFFING.apt2,
        applicationId: SEED_STAFFING.app3,
        venueId: id(2002),
        userId: id(1006),
        appointedAt: daysAgo(55),
        revokedAt: daysAgo(20),
      }),
    ];

    for (const apt of initialApts) {
      this.appointments.set(apt.id, apt);
    }
  }

  async findApplicationById(id: string): Promise<ManagerApplicationEntity | null> {
    return this.applications.get(id) || null;
  }

  async findApplicationsByVenue(venueId: string): Promise<ManagerApplicationEntity[]> {
    return Array.from(this.applications.values()).filter(
      (a) => a.venueId === venueId,
    );
  }

  async findApplicationByApplicantAndVenue(
    applicantId: string,
    venueId: string,
  ): Promise<ManagerApplicationEntity | null> {
    for (const app of this.applications.values()) {
      if (app.applicantId === applicantId && app.venueId === venueId) {
        return app;
      }
    }
    return null;
  }

  async saveApplication(app: ManagerApplicationEntity): Promise<ManagerApplicationEntity> {
    this.applications.set(app.id, app);
    return app;
  }

  async updateApplication(app: ManagerApplicationEntity): Promise<ManagerApplicationEntity> {
    this.applications.set(app.id, app);
    return app;
  }

  async findActiveAppointment(
    venueId: string,
    userId?: string,
  ): Promise<ManagerAppointmentEntity | null> {
    for (const apt of this.appointments.values()) {
      if (apt.venueId === venueId && apt.isActive()) {
        if (!userId || apt.userId === userId) {
          return apt;
        }
      }
    }
    return null;
  }

  async findAppointmentsByVenue(venueId: string): Promise<ManagerAppointmentEntity[]> {
    return Array.from(this.appointments.values()).filter(
      (apt) => apt.venueId === venueId,
    );
  }

  async findActiveAppointmentsByUser(userId: string): Promise<ManagerAppointmentEntity[]> {
    return Array.from(this.appointments.values()).filter(
      (apt) => apt.userId === userId && apt.isActive(),
    );
  }

  async saveAppointment(
    appointment: ManagerAppointmentEntity,
  ): Promise<ManagerAppointmentEntity> {
    this.appointments.set(appointment.id, appointment);
    return appointment;
  }

  async updateAppointment(
    appointment: ManagerAppointmentEntity,
  ): Promise<ManagerAppointmentEntity> {
    this.appointments.set(appointment.id, appointment);
    return appointment;
  }
}
