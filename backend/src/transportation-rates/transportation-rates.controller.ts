import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";

import { TransportationRatesService } from "./transportation-rates.service.js";
import { AdminGuard } from "../auth/guards/admin.guard.js";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard.js";

@Controller("transportation")
export class TransportationRatesController {
  constructor(
    private readonly transportationRatesService: TransportationRatesService,
  ) {}

  @Get("rates")
  async getAllRates() {
    return this.transportationRatesService.getAllRates();
  }

  @Post("rates")
  @UseGuards(JwtAuthGuard, AdminGuard)
  async createRate(
    @Body()
    body: {
      type: string;
      ratePerKm: number;
    },
  ) {
    return this.transportationRatesService.createRate(
      body.type,
      Number(body.ratePerKm),
    );
  }

  @Patch("rates/:id")
  @UseGuards(JwtAuthGuard, AdminGuard)
  async updateRate(
    @Param("id", ParseIntPipe) id: number,
    @Body()
    body: {
      ratePerKm: number;
    },
  ) {
    return this.transportationRatesService.updateRate(
      id,
      Number(body.ratePerKm),
    );
  }
}