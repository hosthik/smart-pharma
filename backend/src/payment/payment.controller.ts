import {
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";

import { FileInterceptor } from "@nestjs/platform-express";

import type { Request, Response } from "express";

import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard.js";
import { AdminGuard } from "../auth/guards/admin.guard.js";

import { CreatePaymentDto } from "./dto/create-payment.dto.js";
import { CreateBankAccountDto } from "./dto/create-bank-account.dto.js";
import { UpdateBankAccountDto } from "./dto/update-bank-account.dto.js";

import { PaymentsService } from "./payments.service.js";

type AuthenticatedUser = {
  sub: number;
  email: string;
  role:
    | "ADMIN"
    | "PHARMACY_OWNER"
    | "PHARMACY_STAFF";
  pharmacyId: number | null;
};

type AuthenticatedRequest = Request & {
  user?: AuthenticatedUser;
};

@Controller("payments")
export class PaymentController {
  constructor(
    private readonly paymentsService: PaymentsService,
  ) {}

  // =========================================================
  // BANK ACCOUNTS
  // =========================================================

  /*
   * PHARMACY — GET ACTIVE BANK ACCOUNTS
   *
   * Returns only active bank accounts.
   * Used by the pharmacy subscription page.
   */
  @Get("banks")
  @UseGuards(JwtAuthGuard)
  async getActiveBankAccounts() {
    return this.paymentsService.getActiveBankAccounts();
  }

  /*
   * ADMIN — GET ALL BANK ACCOUNTS
   *
   * Returns active and inactive bank accounts.
   * Used by the admin bank-management page.
   */
  @Get("admin/banks")
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getAllBankAccounts() {
    return this.paymentsService.getAllBankAccounts();
  }

  /*
   * ADMIN — CREATE BANK ACCOUNT
   */
  @Post("admin/banks")
  @UseGuards(JwtAuthGuard, AdminGuard)
  async createBankAccount(
    @Req() request: AuthenticatedRequest,
  ) {
    const body =
      request.body as CreateBankAccountDto;

    return this.paymentsService.createBankAccount(
      body,
    );
  }

  /*
   * ADMIN — UPDATE BANK ACCOUNT
   */
  @Patch("admin/banks/:id")
  @UseGuards(JwtAuthGuard, AdminGuard)
  async updateBankAccount(
    @Param("id", ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest,
  ) {
    const body =
      request.body as UpdateBankAccountDto;

    return this.paymentsService.updateBankAccount(
      id,
      body,
    );
  }

  /*
   * ADMIN — DELETE BANK ACCOUNT
   */
  @Delete("admin/banks/:id")
  @UseGuards(JwtAuthGuard, AdminGuard)
  async deleteBankAccount(
    @Param("id", ParseIntPipe) id: number,
  ) {
    return this.paymentsService.deleteBankAccount(id);
  }

  // =========================================================
  // CREATE PAYMENT
  // =========================================================

  /*
   * PHARMACY — CREATE PAYMENT
   *
   * Requires:
   * - pharmacyId
   * - plan
   * - amount
   * - bankAccountId
   * - transactionId
   * - screenshot
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor("screenshot"),
  )
  async createPayment(
    @Req() request: AuthenticatedRequest,
    @UploadedFile()
    screenshot: Express.Multer.File,
  ) {
    const body =
      request.body as CreatePaymentDto;

    return this.paymentsService.createPayment(
      body,
      screenshot,
      request.user,
    );
  }

  // =========================================================
  // BASIC SUBSCRIPTION
  // =========================================================

  /*
   * PHARMACY — ACTIVATE BASIC PLAN
   *
   * Basic is free.
   * No payment or screenshot is required.
   */
  @Post("subscription/basic")
  @UseGuards(JwtAuthGuard)
  async activateBasic(
    @Req() request: AuthenticatedRequest,
  ) {
    const user = request.user;

    if (!user?.pharmacyId) {
      throw new ForbiddenException(
        "A pharmacy account is required.",
      );
    }

    return this.paymentsService.activateBasic(
      user.pharmacyId,
      user,
    );
  }

  // =========================================================
  // PHARMACY SUBSCRIPTION
  // =========================================================

  /*
   * PHARMACY / ADMIN — GET SUBSCRIPTION
   *
   * Returns the subscription belonging to
   * the requested pharmacy.
   */
  @Get("subscription/:pharmacyId")
  @UseGuards(JwtAuthGuard)
  async getPharmacySubscription(
    @Param(
      "pharmacyId",
      ParseIntPipe,
    )
    pharmacyId: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.paymentsService.getPharmacySubscription(
      pharmacyId,
      request.user,
    );
  }

  // =========================================================
  // ADMIN — PAYMENTS
  // =========================================================

  /*
   * ADMIN — GET PENDING PAYMENTS
   */
  @Get("pending")
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getPendingPayments() {
    return this.paymentsService.getPendingPayments();
  }

  /*
   * ADMIN — GET ACTIVE SUBSCRIPTIONS
   */
  @Get("subscriptions/active")
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getActiveSubscriptions() {
    return this.paymentsService.getActiveSubscriptions();
  }

  // =========================================================
  // ADMIN — PAYMENT SCREENSHOT
  // =========================================================

  /*
   * ADMIN — GET PAYMENT SCREENSHOT
   *
   * Returns the stored screenshot as an image.
   */
  @Get(":id/screenshot")
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getPaymentScreenshot(
    @Param("id", ParseIntPipe)
    id: number,
    @Res() response: Response,
  ) {
    const screenshot =
      await this.paymentsService.getPaymentScreenshot(
        id,
      );

    response.setHeader(
      "Content-Type",
      screenshot.mimeType,
    );

    response.setHeader(
      "Content-Disposition",
      "inline",
    );

    response.setHeader(
      "Cache-Control",
      "private, no-store, max-age=0",
    );

    response.setHeader(
      "X-Content-Type-Options",
      "nosniff",
    );

    response.send(
      screenshot.buffer,
    );
  }

  // =========================================================
  // ADMIN — VERIFY PAYMENT
  // =========================================================

  /*
   * ADMIN — VERIFY PAYMENT
   *
   * Changes:
   *
   * Payment:
   * PENDING -> VERIFIED
   *
   * Subscription:
   * -> ACTIVE
   */
  @Post(":id/verify")
  @UseGuards(JwtAuthGuard, AdminGuard)
  async verifyPayment(
    @Param("id", ParseIntPipe)
    id: number,
  ) {
    return this.paymentsService.verifyPayment(
      id,
    );
  }

  // =========================================================
  // ADMIN — REJECT PAYMENT
  // =========================================================

  /*
   * ADMIN — REJECT PAYMENT
   */
  @Post(":id/reject")
  @UseGuards(JwtAuthGuard, AdminGuard)
  async rejectPayment(
    @Param("id", ParseIntPipe)
    id: number,
  ) {
    return this.paymentsService.rejectPayment(
      id,
    );
  }
}