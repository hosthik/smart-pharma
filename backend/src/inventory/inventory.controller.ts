import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";

import type { Request } from "express";

import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard.js";
import { InventoryService } from "./inventory.service.js";
import { CreateInventoryDto } from "./dto/create-inventory.dto.js";
import { UpdateInventoryDto } from "./dto/update-inventory.dto.js";

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

@Controller("inventory")
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(
    private readonly inventoryService: InventoryService,
  ) {}

  @Get("pharmacy/:pharmacyId")
  async findByPharmacy(
    @Param("pharmacyId", ParseIntPipe) pharmacyId: number,
    @Req() request: AuthenticatedRequest,
  ) {
    const user = request.user;

    if (!user) {
      throw new Error("Authenticated user was not found.");
    }

    return this.inventoryService.findAll(
      pharmacyId,
      user.role,
      user.pharmacyId,
    );
  }

  @Get(":id")
  async findOne(
    @Param("id", ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest,
  ) {
    const user = request.user;

    if (!user) {
      throw new Error("Authenticated user was not found.");
    }

    return this.inventoryService.findOne(
      id,
      user.role,
      user.pharmacyId,
    );
  }

  @Post()
  async create(
    @Body() dto: CreateInventoryDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const user = request.user;

    if (!user) {
      throw new Error("Authenticated user was not found.");
    }

    return this.inventoryService.create(
      dto,
      user.role,
      user.pharmacyId,
    );
  }

  @Patch(":id")
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateInventoryDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const user = request.user;

    if (!user) {
      throw new Error("Authenticated user was not found.");
    }

    return this.inventoryService.update(
      id,
      dto,
      user.role,
      user.pharmacyId,
    );
  }

  @Delete(":id")
  async remove(
    @Param("id", ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest,
  ) {
    const user = request.user;

    if (!user) {
      throw new Error("Authenticated user was not found.");
    }

    return this.inventoryService.remove(
      id,
      user.role,
      user.pharmacyId,
    );
  }
}