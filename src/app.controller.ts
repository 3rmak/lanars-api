import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

class HealthCheckResponse {
  message: string;
}

@ApiTags('Health check')
@Controller()
export class AppController {
  @Get('/healthcheck')
  @ApiOperation({ description: 'healthcheck endpoint' })
  @ApiResponse({ status: 200, type: HealthCheckResponse })
  getHello(): HealthCheckResponse {
    return { message: 'alive' };
  }
}
