import {
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

import { MedicinesService } from "./medicines.service.js";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard.js";
import { PharmacySubscriptionGuard } from "../auth/guards/pharmacy-subscription.guard.js";

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

type CreateMedicineBody = {
  name: string;
  genericName?: string;
  category?: string;
  pharmacyId?: number;
  quantity?: number;
  price?: number;
  stockStatus?:
    | "AVAILABLE"
    | "LOW_STOCK"
    | "OUT_OF_STOCK";
  section?: string;
  shelf?: string;
  row?: string;
};

type UpdateMedicineBody = {
  name?: string;
  genericName?: string;
  category?: string;
  quantity?: number;
  price?: number;
  stockStatus?:
    | "AVAILABLE"
    | "LOW_STOCK"
    | "OUT_OF_STOCK";
  section?: string;
  shelf?: string;
  row?: string;
};

@Controller("medicines")
export class MedicinesController {
  constructor(
    private readonly medicinesService: MedicinesService,
  ) {}

  /*
   * PHARMACY MEDICINE LIST
   *
   * Requires an active paid subscription.
   */
  @Get()
  @UseGuards(
    JwtAuthGuard,
    PharmacySubscriptionGuard,
  )
  async findAll(
    @Query("pharmacyId") pharmacyId?: string,
    @Req() request?: AuthenticatedRequest,
  ) {
    return this.medicinesService.findAll(
      pharmacyId !== undefined
        ? Number(pharmacyId)
        : undefined,
      request?.user,
    );
  }

  /*
   * PUBLIC SEARCH
   *
   * Patients can search medicines without
   * authentication or a pharmacy subscription.
   */
  @Get("search")
  async search(
    @Query("q") query?: string,
    @Query("pharmacyId") pharmacyId?: string,
  ) {
    const parsedPharmacyId =
      pharmacyId !== undefined &&
      pharmacyId.trim() !== ""
        ? Number(pharmacyId)
        : undefined;

    return this.medicinesService.search(
      query || "",
      parsedPharmacyId,
    );
  }

  /*
   * PHARMACY MEDICINE DETAILS
   *
   * Requires an active paid subscription.
   */
  @Get(":id")
  @UseGuards(
    JwtAuthGuard,
    PharmacySubscriptionGuard,
  )
  async findOne(
    @Param("id", ParseIntPipe) id: number,
    @Query("pharmacyId") pharmacyId?: string,
    @Req() request?: AuthenticatedRequest,
  ) {
    return this.medicinesService.findOne(
      id,
      pharmacyId !== undefined
        ? Number(pharmacyId)
        : undefined,
      request?.user,
    );
  }

  /*
   * CREATE MEDICINE
   *
   * Requires an active paid subscription.
   */
  @Post()
  @UseGuards(
    JwtAuthGuard,
    PharmacySubscriptionGuard,
  )
  async create(
    @Body() body: CreateMedicineBody,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.medicinesService.create(
      body,
      request.user,
    );
  }

  /*
   * UPDATE MEDICINE
   *
   * Requires an active paid subscription.
   */
  @Patch(":id")
  @UseGuards(
    JwtAuthGuard,
    PharmacySubscriptionGuard,
  )
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: UpdateMedicineBody,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.medicinesService.update(
      id,
      body,
      request.user,
    );
  }

  /*
   * DELETE MEDICINE
   *
   * Requires an active paid subscription.
   */
  @Delete(":id")
  @UseGuards(
    JwtAuthGuard,
    PharmacySubscriptionGuard,
  )
  async remove(
    @Param("id", ParseIntPipe) id: number,
    @Query("pharmacyId") pharmacyId?: string,
    @Req() request?: AuthenticatedRequest,
  ) {
    return this.medicinesService.remove(
      id,
      pharmacyId !== undefined
        ? Number(pharmacyId)
        : undefined,
      request?.user,
    );
  }
}