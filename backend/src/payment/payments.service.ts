import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";

import { PrismaService } from "../prisma/prisma.service.js";
import { CreatePaymentDto } from "./dto/create-payment.dto.js";

@Injectable()
export class PaymentsService {
  private readonly SUBSCRIPTION_PRICE = 100;
  private readonly SUBSCRIPTION_DURATION_HOURS = 24;

  private readonly uploadDirectory = join(
    process.cwd(),
    "uploads",
    "payment-screenshots",
  );

  constructor(private readonly prisma: PrismaService) {}

  async createPayment(
    dto: CreatePaymentDto,
    screenshot?: Express.Multer.File,
  ) {
    if (!screenshot) {
      throw new BadRequestException(
        "Payment screenshot is required.",
      );
    }

    if (!screenshot.mimetype.startsWith("image/")) {
      throw new BadRequestException(
        "Only image screenshots are allowed.",
      );
    }

    const maxFileSize = 5 * 1024 * 1024;

    if (screenshot.size > maxFileSize) {
      throw new BadRequestException(
        "Screenshot must be smaller than 5MB.",
      );
    }

    const pharmacyId = Number(dto.pharmacyId);

    if (!Number.isInteger(pharmacyId)) {
      throw new BadRequestException(
        "Invalid pharmacy ID.",
      );
    }

    const pharmacy =
      await this.prisma.pharmacy.findUnique({
        where: { id: pharmacyId },
      });

    if (!pharmacy) {
      throw new NotFoundException(
        "Pharmacy not found.",
      );
    }

    const existingPayment =
      await this.prisma.payment.findUnique({
        where: {
          transactionId: dto.transactionId,
        },
      });

    if (existingPayment) {
      throw new BadRequestException(
        "This transaction ID has already been submitted.",
      );
    }

    if (
      Number(dto.amount) !==
      this.SUBSCRIPTION_PRICE
    ) {
      throw new BadRequestException(
        "The subscription price is 100 ETB.",
      );
    }

    let plan:
      | "PROFESSIONAL"
      | "ENTERPRISE";

    if (dto.plan === "Professional") {
      plan = "PROFESSIONAL";
    } else if (dto.plan === "Enterprise") {
      plan = "ENTERPRISE";
    } else {
      throw new BadRequestException(
        "Invalid subscription plan.",
      );
    }

    /*
     * Save the actual screenshot file.
     */
    await mkdir(this.uploadDirectory, {
      recursive: true,
    });

    const extension =
      screenshot.originalname.includes(".")
        ? screenshot.originalname
            .split(".")
            .pop()
            ?.toLowerCase()
        : "jpg";

    const savedFileName =
      `${randomUUID()}.${extension}`;

    const savedFilePath = join(
      this.uploadDirectory,
      savedFileName,
    );

    await writeFile(
      savedFilePath,
      screenshot.buffer,
    );

    const payment =
      await this.prisma.payment.create({
        data: {
          pharmacyId,
          plan,
          amount: this.SUBSCRIPTION_PRICE,
          transactionId:
            dto.transactionId,
          status: "PENDING",

          /*
           * Store the generated filename,
           * not the original filename.
           */
          screenshotName:
            savedFileName,

          screenshotMimeType:
            screenshot.mimetype,

          screenshotSize:
            screenshot.size,
        },
      });

    return {
      success: true,
      message:
        "Payment submitted for verification.",
      payment: {
        id: payment.id,
        pharmacyId:
          payment.pharmacyId,
        plan: payment.plan,
        amount: payment.amount,
        transactionId:
          payment.transactionId,
        status: payment.status,

        screenshot: {
          originalName:
            screenshot.originalname,
          fileName:
            savedFileName,
          mimeType:
            payment.screenshotMimeType,
          size:
            payment.screenshotSize,

          /*
           * Admin/frontend can use this URL
           * to display the image.
           */
          url:
            `/uploads/payment-screenshots/${savedFileName}`,
        },

        createdAt:
          payment.createdAt,
      },
    };
  }

  async getPendingPayments() {
    const payments =
      await this.prisma.payment.findMany({
        where: {
          status: "PENDING",
        },
        include: {
          pharmacy: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    return payments.map((payment) => ({
      ...payment,
      screenshotUrl:
        payment.screenshotName
          ? `/uploads/payment-screenshots/${payment.screenshotName}`
          : null,
    }));
  }

  async getActiveSubscriptions() {
    const now = new Date();

    await this.prisma.subscription.updateMany({
      where: {
        status: "ACTIVE",
        renewalDate: {
          lte: now,
        },
      },
      data: {
        status: "EXPIRED",
      },
    });

    return this.prisma.subscription.findMany({
      where: {
        status: "ACTIVE",
        renewalDate: {
          gt: now,
        },
      },
      include: {
        pharmacy: true,
      },
      orderBy: {
        renewalDate: "asc",
      },
    });
  }

  async getPharmacySubscription(
    pharmacyId: number,
  ) {
    const subscription =
      await this.prisma.subscription.findUnique({
        where: {
          pharmacyId,
        },
      });

    if (!subscription) {
      return null;
    }

    const now = new Date();

    if (
      subscription.status === "ACTIVE" &&
      subscription.renewalDate &&
      subscription.renewalDate <= now
    ) {
      return this.prisma.subscription.update({
        where: {
          id: subscription.id,
        },
        data: {
          status: "EXPIRED",
        },
      });
    }

    return subscription;
  }

  async verifyPayment(id: number) {
    const payment =
      await this.prisma.payment.findUnique({
        where: { id },
      });

    if (!payment) {
      throw new NotFoundException(
        "Payment not found.",
      );
    }

    if (payment.status !== "PENDING") {
      throw new BadRequestException(
        "This payment has already been processed.",
      );
    }

    const startDate = new Date();

    const renewalDate = new Date(
      startDate.getTime() +
        this.SUBSCRIPTION_DURATION_HOURS *
          60 *
          60 *
          1000,
    );

    const result =
      await this.prisma.$transaction(
        async (tx) => {
          await tx.payment.update({
            where: {
              id: payment.id,
            },
            data: {
              status: "VERIFIED",
              verifiedAt: startDate,
            },
          });

          const subscription =
            await tx.subscription.upsert({
              where: {
                pharmacyId:
                  payment.pharmacyId,
              },
              update: {
                plan: payment.plan,
                status: "ACTIVE",
                startDate,
                renewalDate,
              },
              create: {
                pharmacyId:
                  payment.pharmacyId,
                plan: payment.plan,
                status: "ACTIVE",
                startDate,
                renewalDate,
              },
            });

          return subscription;
        },
      );

    return {
      success: true,
      message:
        "Payment verified. Subscription is active for 24 hours.",
      subscription: result,
    };
  }

  async rejectPayment(id: number) {
    const payment =
      await this.prisma.payment.findUnique({
        where: { id },
      });

    if (!payment) {
      throw new NotFoundException(
        "Payment not found.",
      );
    }

    if (payment.status !== "PENDING") {
      throw new BadRequestException(
        "This payment has already been processed.",
      );
    }

    const rejectedPayment =
      await this.prisma.payment.update({
        where: {
          id,
        },
        data: {
          status: "REJECTED",
          rejectedAt: new Date(),
        },
      });

    return {
      success: true,
      message: "Payment rejected.",
      payment: rejectedPayment,
    };
  }
}