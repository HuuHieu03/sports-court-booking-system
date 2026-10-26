export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateVN(dateStr: string): string {
  if (!dateStr) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  }
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export function getTomorrowDateString(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const y = tomorrow.getFullYear();
  const m = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const d = String(tomorrow.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function calculateDurationMinutes(startTime: string, endTime: string): number {
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  return (endH * 60 + endM) - (startH * 60 + startM);
}

export function validateBookingTime(
  dateStr: string,
  startTime: string,
  endTime: string
): { isValid: boolean; error?: string; durationMinutes: number } {
  const duration = calculateDurationMinutes(startTime, endTime);

  if (duration <= 0) {
    return {
      isValid: false,
      error: 'Giờ kết thúc phải diễn ra sau giờ bắt đầu.',
      durationMinutes: duration,
    };
  }

  if (duration < 30) {
    return {
      isValid: false,
      error: 'Thời lượng đặt sân tối thiểu là 30 phút theo quy định hệ thống.',
      durationMinutes: duration,
    };
  }

  if (duration > 240) {
    return {
      isValid: false,
      error: 'Thời lượng đặt sân tối đa là 4 giờ (240 phút) cho mỗi lượt đặt.',
      durationMinutes: duration,
    };
  }

  // Check if booking is in the future (parse in local timezone)
  const now = new Date();
  const [year, month, day] = (dateStr || '').split('-').map(Number);
  const [startH, startM] = (startTime || '').split(':').map(Number);
  const bookingDate = new Date(year, month - 1, day, startH, startM, 0, 0);

  if (isNaN(bookingDate.getTime())) {
    return {
      isValid: false,
      error: 'Ngày hoặc giờ đặt sân không hợp lệ.',
      durationMinutes: duration,
    };
  }

  if (bookingDate <= now) {
    // If it's today and past the start time
    return {
      isValid: false,
      error: 'Thời gian bắt đầu đặt sân phải diễn ra trong tương lai.',
      durationMinutes: duration,
    };
  }

  return { isValid: true, durationMinutes: duration };
}

export function isTimeOverlapping(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  return start1 < end2 && end1 > start2;
}
