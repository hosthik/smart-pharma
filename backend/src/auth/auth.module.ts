import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";

import { AuthController } from "./auth.controller.js";
import { AuthService } from "./auth.service.js";
import { PharmacySubscriptionGuard } from "./guards/pharmacy-subscription.guard.js";

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret:
          configService.get<string>("JWT_SECRET") ||
          "smartpharma-secret",
        signOptions: {
          expiresIn: "7d",
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    PharmacySubscriptionGuard,
  ],
  exports: [
    AuthService,
    JwtModule,
    PharmacySubscriptionGuard,
  ],
})
export class AuthModule {}