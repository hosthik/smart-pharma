import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";

import { PrismaService } from "../../prisma/prisma.service.js";

type AuthenticatedUser = {
  sub: number;
  email: string;
  role:
    | "ADMIN"
    | "PHARMACY_OWNER"
    | "PHARMACY_STAFF";
  pharmacyId: number | null;
};

@Injectable()
export class PharmacySubscriptionGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const user = request.user as AuthenticatedUser | undefined;

    if (!user) {
      throw new ForbiddenException("Authentication is required.");
    }

    // Administrators are not restricted by pharmacy subscriptions.
    if (user.role === "ADMIN") {
      return true;
    }

    if (!user.pharmacyId) {
      throw new ForbiddenException("A pharmacy account is required.");
    }

    const subscription = await this.prisma.subscription.findUnique({
      where: {
        pharmacyId: user.pharmacyId,
      },
    });

    if (!subscription) {
      throw new ForbiddenException(
        "An active subscription is required.",
      );
    }

    // Basic plan only has access to Subscription and Account.
    if (subscription.plan === "BASIC") {
      throw new ForbiddenException(
        "Your Basic plan does not include access to this feature. Please upgrade your subscription.",
      );
    }

    if (subscription.status !== "ACTIVE") {
      throw new ForbiddenException(
        "Your subscription is not active. Please check your subscription.",
      );
    }

    // Automatically mark a dated subscription as expired.
    if (
      subscription.renewalDate &&
      subscription.renewalDate <= new Date()
    ) {
      await this.prisma.subscription.update({
        where: {
          id: subscription.id,
        },
        data: {
          status: "EXPIRED",
        },
      });

      throw new ForbiddenException(
        "Your subscription has expired. Please renew or upgrade your subscription.",
      );
    }

    return true;
  }
}