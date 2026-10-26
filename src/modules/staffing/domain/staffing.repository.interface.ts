import { ManagerApplicationEntity } from './manager-application.entity';
import { ManagerAppointmentEntity } from './manager-appointment.entity';

export interface IStaffingRepository {
  findApplicationById(id: string): Promise<ManagerApplicationEntity | null>;
  findApplicationsByVenue(venueId: string): Promise<ManagerApplicationEntity[]>;
  findApplicationByApplicantAndVenue(
    applicantId: string,
    venueId: string,
  ): Promise<ManagerApplicationEntity | null>;
  saveApplication(app: ManagerApplicationEntity): Promise<ManagerApplicationEntity>;
  updateApplication(app: ManagerApplicationEntity): Promise<ManagerApplicationEntity>;

  findActiveAppointment(
    venueId: string,
    userId?: string,
  ): Promise<ManagerAppointmentEntity | null>;
  findAppointmentsByVenue(venueId: string): Promise<ManagerAppointmentEntity[]>;
  findActiveAppointmentsByUser(userId: string): Promise<ManagerAppointmentEntity[]>;
  saveAppointment(appointment: ManagerAppointmentEntity): Promise<ManagerAppointmentEntity>;
  updateAppointment(appointment: ManagerAppointmentEntity): Promise<ManagerAppointmentEntity>;
}
