import { Module } from "@nestjs/common";

import { PharmacyController } from "./pharmacy.controller.js";
import { PharmacyService } from "./pharmacy.service.js";

import { AuthModule } from "../auth/auth.module.js";

@Module({
  imports: [
    AuthModule,
  ],

  controllers: [
    PharmacyController,
  ],

  providers: [
    PharmacyService,
  ],
})
export class PharmacyModule {}