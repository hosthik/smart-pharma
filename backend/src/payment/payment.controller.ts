import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";

import { FileInterceptor } from "@nestjs/platform-express";

import { PaymentsService } from "./payments.service.js";
import { CreatePaymentDto } from "./dto/create-payment.dto.js";

@Controller("payments")
export class PaymentController {
  constructor(
    private readonly paymentsService: PaymentsService,
  ) {}

  // =========================================================
  // CREATE PAYMENT
  // =========================================================

  @Post()
  @UseInterceptors(
    FileInterceptor("screenshot"),
  )
  async createPayment(
    @Body() createPaymentDto: CreatePaymentDto,
    @UploadedFile()
    screenshot: Express.Multer.File,
  ) {
    return this.paymentsService.createPayment(
      createPaymentDto,
      screenshot,
    );
  }

  // =========================================================
  // GET PENDING PAYMENTS
  // =========================================================

  @Get("pending")
  async getPendingPayments() {
    return this.paymentsService.getPendingPayments();
  }

  // =========================================================
  // GET ACTIVE SUBSCRIPTIONS
  // =========================================================

  @Get("subscriptions/active")
  async getActiveSubscriptions() {
    return this.paymentsService.getActiveSubscriptions();
  }

  // =========================================================
  // GET PHARMACY SUBSCRIPTION
  // =========================================================

  @Get("subscription/:pharmacyId")
  async getPharmacySubscription(
    @Param(
      "pharmacyId",
      ParseIntPipe,
    )
    pharmacyId: number,
  ) {
    return this.paymentsService.getPharmacySubscription(
      pharmacyId,
    );
  }

  // =========================================================
  // VERIFY PAYMENT
  // =========================================================

  @Post(":id/verify")
  async verifyPayment(
    @Param(
      "id",
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.paymentsService.verifyPayment(id);
  }

  // =========================================================
  // REJECT PAYMENT
  // =========================================================

  @Post(":id/reject")
  async rejectPayment(
    @Param(
      "id",
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.paymentsService.rejectPayment(id);
  }
}