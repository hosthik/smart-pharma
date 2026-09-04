import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { PrismaModule } from "./prisma/prisma.module.js";
import { PaymentModule } from "./payment/payment.module.js";
import { InventoryModule } from "./inventory/inventory.module.js";
import { SalesModule } from "./sales/sales.module.js";
import { DashboardModule } from "./dashboard/dashboard.module.js";
import { AnalyticsModule } from "./analytics/analytics.module.js";
import { MedicinesModule } from "./medicines/medicines.module.js";
import { AuthModule } from "./auth/auth.module.js";
import { PharmacyModule } from "./pharmacy/pharmacy.module.js";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      
    }),

    PrismaModule,
    PaymentModule,
    InventoryModule,
    SalesModule,
    DashboardModule,
    AnalyticsModule,
    MedicinesModule,
    AuthModule,
    PharmacyModule,
  ],
})
export class AppModule {}