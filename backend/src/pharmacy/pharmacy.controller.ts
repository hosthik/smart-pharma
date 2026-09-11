import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
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
    role: "ADMIN" | "PHARMACY_OWNER" | "PHARMACY_STAFF";
    pharmacyId: number | null;
  };
};

@Controller("pharmacies")
export class PharmacyController {
  constructor(private readonly pharmacyService: PharmacyService) {}

  // =========================
  // Public pharmacy endpoints
  // =========================

  @Get()
  async findAll() {
    return this.pharmacyService.findAll();
  }

  @Get("nearby")
  async findNearby(
    @Query("latitude") latitude: string,
    @Query("longitude") longitude: string,
    @Query("radius") radius?: string,
  ) {
    return this.pharmacyService.findNearby(
      Number(latitude),
      Number(longitude),
      radius ? Number(radius) : 10,
    );
  }

  // =========================
  // Admin verification
  // =========================

  @Get("pending")
  @UseGuards(JwtAuthGuard, AdminGuard)
  async findPending() {
    return this.pharmacyService.findPending();
  }

  // =========================
  // Pharmacy account
  // =========================

  @Get(":id/account")
  @UseGuards(JwtAuthGuard)
  async getAccount(
    @Param("id", ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest,
  ) {
    const user = request.user;

    if (!user) {
      throw new BadRequestException(
        "Authenticated user was not found.",
      );
    }

    return this.pharmacyService.getAccount(
      id,
      user.role,
      user.pharmacyId,
    );
  }

  @Patch(":id/account")
  @UseGuards(JwtAuthGuard)
  async updateAccount(
    @Param("id", ParseIntPipe) id: number,
    @Body()
    body: {
      name?: string;
      address?: string;
      phone?: string;
      email?: string;
      openingHours?: string;
    },
    @Req() request: AuthenticatedRequest,
  ) {
    const user = request.user;

    if (!user) {
      throw new BadRequestException(
        "Authenticated user was not found.",
      );
    }

    return this.pharmacyService.updateAccount(
      id,
      body,
      user.role,
      user.pharmacyId,
    );
  }

  @Delete("account")
  @UseGuards(JwtAuthGuard)
  async deleteAccount(@Req() request: AuthenticatedRequest) {
    const user = request.user;

    if (!user) {
      throw new BadRequestException(
        "Authenticated user was not found.",
      );
    }

    if (!user.pharmacyId) {
      throw new BadRequestException(
        "A pharmacy account is required.",
      );
    }

    return this.pharmacyService.deleteAccount(
      user.pharmacyId,
      user.role,
      user.pharmacyId,
    );
  }

  // =========================
  // Public pharmacy details
  // =========================

  @Get(":id")
  async findOne(@Param("id", ParseIntPipe) id: number) {
    return this.pharmacyService.findOne(id);
  }

  // =========================
  // Admin approve / reject
  // =========================

  @Post(":id/approve")
  @UseGuards(JwtAuthGuard, AdminGuard)
  async approve(@Param("id", ParseIntPipe) id: number) {
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

  // =========================
  // Pharmacy location
  // =========================

  @Patch(":id/location")
  @UseGuards(JwtAuthGuard)
  async updateLocation(
    @Param("id", ParseIntPipe) id: number,
    @Body()
    body: {
      latitude?: number;
      longitude?: number;
    },
    @Req() request: AuthenticatedRequest,
  ) {
    const user = request.user;

    if (!user) {
      throw new BadRequestException(
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
