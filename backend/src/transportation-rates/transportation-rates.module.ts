import { Module } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module.js";
import { TransportationRatesController } from "./transportation-rates.controller.js";
import { TransportationRatesService } from "./transportation-rates.service.js";

@Module({
  imports: [AuthModule],
  controllers: [TransportationRatesController],
  providers: [TransportationRatesService],
  exports: [TransportationRatesService],
})
export class TransportationRatesModule {}