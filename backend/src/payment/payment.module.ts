import { Module } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module.js";
import { PaymentController } from "./payment.controller.js";
import { PaymentsService } from "./payments.service.js";

@Module({
  imports: [AuthModule],
  controllers: [PaymentController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentModule {}