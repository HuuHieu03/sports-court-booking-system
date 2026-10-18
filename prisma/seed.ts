// Dữ liệu mẫu cho môi trường phát triển. Chạy: npm run db:seed
// Dùng ID cố định và upsert nên chạy lại nhiều lần không tạo bản ghi trùng.
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '../src/generated/prisma/client';

const databaseUrl = process.env.DATABASE_URL;
const seedPassword = process.env.SEED_PASSWORD;
if (!databaseUrl || !seedPassword) {
  throw new Error('Thiếu DATABASE_URL hoặc SEED_PASSWORD. Đặt file .env ở thư mục gốc trước khi seed.');
}

// @prisma/adapter-pg gửi thời gian dạng UTC không kèm múi giờ, nên phiên kết nối phải dùng UTC.
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl, options: '-c TimeZone=UTC' }),
});

// UUID cố định theo nhóm: 1xxx account, 2xxx venue, 3xxx court, 4xxx hồ sơ ứng tuyển,
// 5xxx bổ nhiệm, 6xxx booking, 7xxx feedback, 8xxx thông báo.
const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;

// Thời điểm theo giờ Việt Nam (UTC+7), tính từ ngày hiện tại.
function vnTime(dayOffset: number, hour: number, minute = 0): Date {
  const nowInVietnam = new Date(Date.now() + 7 * 60 * 60 * 1000);
  return new Date(
    Date.UTC(
      nowInVietnam.getUTCFullYear(),
      nowInVietnam.getUTCMonth(),
      nowInVietnam.getUTCDate() + dayOffset,
      hour - 7,
      minute,
    ),
  );
}

const ACCOUNT = {
  admin: id(1001),
  ownerAnPhu: id(1002),
  ownerThuDuc: id(1003),
  managerMinh: id(1004),
  userLan: id(1005),
  userHuy: id(1006),
  lockedUser: id(1007),
  deletedUser: id(1008),
};

const VENUE = { anPhu: id(2001), thaoDien: id(2002), thuDuc: id(2003) };

const COURT = {
  anPhu1: id(3001),
  anPhu2: id(3002),
  anPhu3: id(3003),
  thaoDienA: id(3004),
  thaoDienB: id(3005),
  thaoDienDeleted: id(3006),
  thuDuc5: id(3007),
  thuDuc7: id(3008),
};

async function main() {
  const passwordHash = await bcrypt.hash(seedPassword!, 10);
  const deletedAt = vnTime(-10, 9);

  const accounts = [
    { id: ACCOUNT.admin, fullName: 'Quản trị viên', email: 'admin@example.com', phone: '+84900000001', role: 'ADMIN' },
    { id: ACCOUNT.ownerAnPhu, fullName: 'Trần Quốc An', email: 'owner.anphu@example.com', phone: '+84900000002', role: 'OWNER' },
    { id: ACCOUNT.ownerThuDuc, fullName: 'Lê Thu Hà', email: 'owner.thuduc@example.com', phone: '+84900000003', role: 'OWNER' },
    { id: ACCOUNT.managerMinh, fullName: 'Phạm Minh Đức', email: 'manager.minh@example.com', phone: '+84900000004', role: 'USER' },
    { id: ACCOUNT.userLan, fullName: 'Nguyễn Ngọc Lan', email: 'user.lan@example.com', phone: '+84900000005', role: 'USER' },
    { id: ACCOUNT.userHuy, fullName: 'Võ Gia Huy', email: 'user.huy@example.com', phone: '+84900000006', role: 'USER' },
    { id: ACCOUNT.lockedUser, fullName: 'Đỗ Văn Khóa', email: 'user.locked@example.com', phone: '+84900000007', role: 'USER', status: 'LOCKED' },
    {
      id: ACCOUNT.deletedUser,
      fullName: 'Bùi Thị Xóa',
      email: 'user.deleted@example.com',
      phone: '+84900000008',
      role: 'USER',
      status: 'DELETED',
      deletedAt,
    },
  ] as const;

  const venues = [
    {
      id: VENUE.anPhu,
      ownerId: ACCOUNT.ownerAnPhu,
      name: 'Sân bóng An Phú',
      address: '12 Đường số 5, An Phú, TP. Thủ Đức, TP. Hồ Chí Minh',
      description: 'Cụm sân cỏ nhân tạo phục vụ đặt sân theo giờ.',
      recruitmentOpen: true,
      recruitmentMessage: 'Tuyển quản lý sân ca chiều.',
    },
    {
      id: VENUE.thaoDien,
      ownerId: ACCOUNT.ownerAnPhu,
      name: 'Sân bóng Thảo Điền',
      address: '45 Nguyễn Văn Hưởng, Thảo Điền, TP. Thủ Đức, TP. Hồ Chí Minh',
      description: null,
      recruitmentOpen: false,
      recruitmentMessage: null,
    },
    {
      id: VENUE.thuDuc,
      ownerId: ACCOUNT.ownerThuDuc,
      name: 'Sân bóng Thủ Đức',
      address: '210 Võ Văn Ngân, Bình Thọ, TP. Thủ Đức, TP. Hồ Chí Minh',
      description: 'Có sân 5 người và sân 7 người.',
      recruitmentOpen: false,
      recruitmentMessage: null,
    },
  ];

  const courts = [
    { id: COURT.anPhu1, venueId: VENUE.anPhu, name: 'Sân 1', description: 'Sân 5 người.' },
    { id: COURT.anPhu2, venueId: VENUE.anPhu, name: 'Sân 2', description: 'Sân 5 người.' },
    { id: COURT.anPhu3, venueId: VENUE.anPhu, name: 'Sân 3', description: 'Sân 7 người.' },
    { id: COURT.thaoDienA, venueId: VENUE.thaoDien, name: 'Sân A', description: null },
    { id: COURT.thaoDienB, venueId: VENUE.thaoDien, name: 'Sân B', description: null },
    { id: COURT.thaoDienDeleted, venueId: VENUE.thaoDien, name: 'Sân C', description: 'Đã xóa logic.', deletedAt },
    { id: COURT.thuDuc5, venueId: VENUE.thuDuc, name: 'Sân 5 người', description: null },
    { id: COURT.thuDuc7, venueId: VENUE.thuDuc, name: 'Sân 7 người', description: null },
  ];

  const applications = [
    // Minh đang là Manager của An Phú; Lan đã ứng tuyển và chờ Owner liên hệ.
    { id: id(4001), venueId: VENUE.anPhu, applicantId: ACCOUNT.managerMinh, status: 'APPOINTED', consentedAt: vnTime(-30, 10) },
    { id: id(4002), venueId: VENUE.anPhu, applicantId: ACCOUNT.userLan, status: 'SUBMITTED', consentedAt: vnTime(-2, 15) },
    // Lịch sử: Huy từng là Manager của Thảo Điền và đã bị thu hồi.
    { id: id(4003), venueId: VENUE.thaoDien, applicantId: ACCOUNT.userHuy, status: 'REVOKED', consentedAt: vnTime(-60, 9) },
  ] as const;

  const appointments = [
    { id: id(5001), applicationId: id(4001), venueId: VENUE.anPhu, userId: ACCOUNT.managerMinh, appointedAt: vnTime(-28, 9), revokedAt: null },
    {
      id: id(5002),
      applicationId: id(4003),
      venueId: VENUE.thaoDien,
      userId: ACCOUNT.userHuy,
      appointedAt: vnTime(-55, 9),
      revokedAt: vnTime(-20, 17),
    },
  ];

  const confirmed = { status: 'CONFIRMED', cancelledAt: null, cancelledById: null, cancellationReason: null } as const;
  const bookings = [
    { id: id(6001), courtId: COURT.anPhu1, venueId: VENUE.anPhu, userId: ACCOUNT.userLan, startsAt: vnTime(1, 18), endsAt: vnTime(1, 19), ...confirmed },
    // Liền giờ với booking trên, được phép.
    { id: id(6002), courtId: COURT.anPhu1, venueId: VENUE.anPhu, userId: ACCOUNT.userHuy, startsAt: vnTime(1, 19), endsAt: vnTime(1, 20), ...confirmed },
    {
      id: id(6003),
      courtId: COURT.anPhu2,
      venueId: VENUE.anPhu,
      userId: ACCOUNT.userLan,
      startsAt: vnTime(2, 17),
      endsAt: vnTime(2, 18, 30),
      status: 'CANCELLED',
      cancelledAt: vnTime(-1, 20),
      cancelledById: ACCOUNT.userLan,
      cancellationReason: null,
    },
    {
      id: id(6004),
      courtId: COURT.anPhu3,
      venueId: VENUE.anPhu,
      userId: ACCOUNT.userHuy,
      startsAt: vnTime(3, 20),
      endsAt: vnTime(3, 21),
      status: 'CANCELLED',
      cancelledAt: vnTime(0, 8),
      cancelledById: ACCOUNT.managerMinh,
      cancellationReason: 'Sân cần sửa hệ thống chiếu sáng.',
    },
    // Booking đã diễn ra, dùng để thử lịch sử.
    { id: id(6005), courtId: COURT.thuDuc5, venueId: VENUE.thuDuc, userId: ACCOUNT.userLan, startsAt: vnTime(-1, 18), endsAt: vnTime(-1, 19), ...confirmed },
    // Manager vẫn đặt sân như một User.
    { id: id(6006), courtId: COURT.thuDuc7, venueId: VENUE.thuDuc, userId: ACCOUNT.managerMinh, startsAt: vnTime(1, 7), endsAt: vnTime(1, 8), ...confirmed },
  ] as const;

  const feedback = [
    { id: id(7001), venueId: VENUE.anPhu, authorId: ACCOUNT.userLan, content: 'Sân sạch, dễ tìm đường.' },
    { id: id(7002), venueId: VENUE.thuDuc, authorId: ACCOUNT.userHuy, content: 'Mặt cỏ tốt, có chỗ gửi xe rộng.' },
  ];

  const notifications = [
    { id: id(8001), recipientId: ACCOUNT.userHuy, bookingId: id(6004), type: 'BOOKING_CANCELLED_BY_VENUE', status: 'PENDING' },
  ] as const;

  await prisma.$transaction(async (tx) => {
    for (const { id, ...data } of accounts) {
      const values = { status: 'ACTIVE' as const, deletedAt: null, ...data, passwordHash };
      await tx.account.upsert({ where: { id }, create: { id, ...values }, update: values });
    }
    for (const { id, ...data } of venues) {
      await tx.venue.upsert({ where: { id }, create: { id, ...data }, update: data });
    }
    for (const { id, ...data } of courts) {
      const values = { deletedAt: null, ...data };
      await tx.court.upsert({ where: { id }, create: { id, ...values }, update: values });
    }
    for (const { id, ...data } of applications) {
      await tx.managerApplication.upsert({ where: { id }, create: { id, ...data }, update: data });
    }
    for (const { id, ...data } of appointments) {
      await tx.managerAppointment.upsert({ where: { id }, create: { id, ...data }, update: data });
    }
    for (const { id, ...data } of bookings) {
      await tx.booking.upsert({ where: { id }, create: { id, ...data }, update: data });
    }
    for (const { id, ...data } of feedback) {
      await tx.feedback.upsert({ where: { id }, create: { id, ...data }, update: data });
    }
    for (const { id, ...data } of notifications) {
      await tx.notification.upsert({ where: { id }, create: { id, ...data }, update: data });
    }
  });

  console.log(
    `Seed xong: ${accounts.length} tài khoản, ${venues.length} Venue, ${courts.length} Court, ` +
      `${bookings.length} booking, ${applications.length} hồ sơ ứng tuyển.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
