import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from "@nestjs/common";

import { DashboardService } from "./dashboard.service.js";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard.js";
import { PharmacySubscriptionGuard } from "../auth/guards/pharmacy-subscription.guard.js";

@Controller("dashboard")
@UseGuards(
  JwtAuthGuard,
  PharmacySubscriptionGuard,
)
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
  ) {}

  @Get(":pharmacyId")
  getDashboard(
    @Param("pharmacyId", ParseIntPipe) pharmacyId: number,
  ) {
    return this.dashboardService.getDashboard(
      pharmacyId,
    );
  }
}