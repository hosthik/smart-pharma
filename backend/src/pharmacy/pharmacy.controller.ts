import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";

import type { Request } from "express";

import { PharmacyService } from "./pharmacy.service.js";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard.js";
import { AdminGuard } from "../auth/guards/admin.guard.js";

type AuthenticatedRequest = Request & {
  user?: {
    sub: number;
    email: string;
    role:
      | "ADMIN"
      | "PHARMACY_OWNER"
      | "PHARMACY_STAFF";
    pharmacyId: number | null;
  };
};

@Controller("pharmacies")
export class PharmacyController {
  constructor(
    private readonly pharmacyService: PharmacyService,
  ) {}

  @Get()
  async findAll() {
    return this.pharmacyService.findAll();
  }

  @Get("pending")
  @UseGuards(JwtAuthGuard, AdminGuard)
  async findPending() {
    return this.pharmacyService.findPending();
  }

  @Get(":id")
  async findOne(
    @Param("id", ParseIntPipe) id: number,
  ) {
    return this.pharmacyService.findOne(id);
  }

  @Post(":id/approve")
  @UseGuards(JwtAuthGuard, AdminGuard)
  async approve(
    @Param("id", ParseIntPipe) id: number,
  ) {
    return this.pharmacyService.approve(id);
  }

  @Post(":id/reject")
  @UseGuards(JwtAuthGuard, AdminGuard)
  async reject(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: { reason?: string },
  ) {
    return this.pharmacyService.reject(
      id,
      body.reason || "",
    );
  }

  @Patch(":id/location")
  @UseGuards(JwtAuthGuard)
  async updateLocation(
    @Param("id", ParseIntPipe) id: number,

    @Body()
    body: {
      latitude?: number;
      longitude?: number;
    },

    @Req()
    request: AuthenticatedRequest,
  ) {
    const user = request.user;

    if (!user) {
      throw new Error(
        "Authenticated user was not found.",
      );
    }

    return this.pharmacyService.updateLocation(
      id,
      Number(body.latitude),
      Number(body.longitude),
      user.role,
      user.pharmacyId,
    );
  }
}