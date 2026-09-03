import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { DashboardModule } from './dashboard/dashboard.module.js';
import { MedicinesModule } from './medicines/medicines.module.js';
import { InventoryModule } from './inventory/inventory.module.js';    

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    DashboardModule,
    MedicinesModule,
    InventoryModule,
  ],
})
export class AppModule {}