import { PipeTransform, Injectable } from '@nestjs/common';

@Injectable()
export class TrimLowerEmailPipe implements PipeTransform<string, string> {
  transform(value: any): string {
    if (!value || typeof value !== 'string') {
      return value;
    }
    return value.trim().toLowerCase();
  }
}
