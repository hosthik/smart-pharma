import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';

import { DashboardService } from './dashboard.service.js';

@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
  ) {}

  @Get(':pharmacyId')
  getDashboard(
    @Param('pharmacyId', ParseIntPipe) pharmacyId: number,
  ) {
    return this.dashboardService.getDashboard(pharmacyId);
  }
}