import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";

import { PharmacyController } from "./pharmacy.controller.js";
import { PharmacyService } from "./pharmacy.service.js";

@Module({
  imports: [
    JwtModule.register({
      secret:
        process.env.JWT_SECRET ||
        "smartpharma-dev-secret",
      signOptions: {
        expiresIn: "1d",
      },
    }),
  ],
  controllers: [PharmacyController],
  providers: [PharmacyService],
})
export class PharmacyModule {}