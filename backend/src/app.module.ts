import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { PrismaModule } from "./prisma/prisma.module.js";
import { PaymentModule } from "./payment/payment.module.js";
import { InventoryModule } from "./inventory/inventory.module.js";
import { DashboardModule } from "./dashboard/dashboard.module.js";
import { AnalyticsModule } from "./analytics/analytics.module.js";
import { MedicinesModule } from "./medicines/medicines.module.js";
import { AuthModule } from "./auth/auth.module.js";
import { PharmacyModule } from "./pharmacy/pharmacy.module.js";
import { PrescriptionModule } from "./prescription/prescription.module.js";
import { TransportationRatesModule } from "./transportation-rates/transportation-rates.module.js";
import { FeedbackModule } from "./feedback/feedback.module.js";
import { AiModule } from "./ai/ai.module.js";
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    PrismaModule,
    PaymentModule,
    InventoryModule,
    DashboardModule,
    AnalyticsModule,
    MedicinesModule,
    AuthModule,
    PharmacyModule,
    PrescriptionModule,
    TransportationRatesModule,
    FeedbackModule,
    AiModule,
  ],
})
export class AppModule {}