import { Module } from "@nestjs/common";

import { PaymentController } from "./payment.controller.js";
import { PaymentsService } from "./payments.service.js";

@Module({
  controllers: [
    PaymentController,
  ],

  providers: [
    PaymentsService,
  ],

  exports: [
    PaymentsService,
  ],
})
export class PaymentModule {}