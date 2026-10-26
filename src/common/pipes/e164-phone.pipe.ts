import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class E164PhonePipe implements PipeTransform<string, string> {
  transform(value: any): string {
    if (!value || typeof value !== 'string') {
      return value;
    }
    const clean = value.replace(/[\s.-]/g, '');
    if (clean.startsWith('+')) {
      return clean;
    }
    if (clean.startsWith('0')) {
      return '+84' + clean.slice(1);
    }
    if (clean.startsWith('84')) {
      return '+' + clean;
    }
    return clean;
  }
}
