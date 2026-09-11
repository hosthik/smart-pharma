import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";

import type { Request } from "express";

import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard.js";
import { CreateFeedbackDto } from "./dto/create-feedback.dto.js";
import { FeedbackService } from "./feedback.service.js";

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

@Controller("feedback")
export class FeedbackController {
  constructor(
    private readonly feedbackService: FeedbackService,
  ) {}

  // ==========================================
  // Patient feedback
  // ==========================================

  @Post()
  async create(
    @Body() dto: CreateFeedbackDto,
  ) {
    return this.feedbackService.create(dto);
  }

  // ==========================================
  // Admin - view all feedback
  // ==========================================

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Req() request: AuthenticatedRequest,
  ) {
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException(
        "Authenticated user was not found.",
      );
    }

    if (user.role !== "ADMIN") {
      throw new UnauthorizedException(
        "Only administrators can view all feedback.",
      );
    }

    return this.feedbackService.findAll();
  }

  // ==========================================
  // Admin - view one feedback
  // ==========================================

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  async findOne(
    @Param("id", ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest,
  ) {
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException(
        "Authenticated user was not found.",
      );
    }

    if (user.role !== "ADMIN") {
      throw new UnauthorizedException(
        "Only administrators can view feedback details.",
      );
    }

    return this.feedbackService.findOne(id);
  }
}