import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

export interface HealthCheckResult {
  status: 'ok' | 'degraded' | 'error';
  service: string;
  version: string;
  timestamp: string;
  uptime: number;
}

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Check service health and operational status' })
  @ApiResponse({
    status: 200,
    description: 'Service is operational',
    schema: {
      example: {
        status: 'ok',
        service: 'sports-court-booking-system',
        version: '0.1.0',
        timestamp: '2026-10-15T10:20:00.000Z',
        uptime: 12.34,
      },
    },
  })
  check(): HealthCheckResult {
    return {
      status: 'ok',
      service: 'sports-court-booking-system',
      version: '0.1.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
