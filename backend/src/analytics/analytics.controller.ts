import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
} from "@nestjs/common";

import { AnalyticsService } from "./analytics.service.js";

@Controller("analytics")
export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
  ) {}

  @Get(":pharmacyId")
  getAnalytics(
    @Param(
      "pharmacyId",
      ParseIntPipe,
    )
    pharmacyId: number,

    @Query("startDate")
    startDate?: string,

    @Query("endDate")
    endDate?: string,
  ) {
    return this.analyticsService.getAnalytics(
      pharmacyId,
      startDate,
      endDate,
    );
  }
}