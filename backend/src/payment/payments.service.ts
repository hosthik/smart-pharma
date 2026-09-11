import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { randomUUID } from "node:crypto";

import {
  mkdir,
  readFile,
  unlink,
  writeFile,
} from "node:fs/promises";

import {
  extname,
  join,
} from "node:path";

import { PrismaService } from "../prisma/prisma.service.js";

import { CreatePaymentDto } from "./dto/create-payment.dto.js";
import { CreateBankAccountDto } from "./dto/create-bank-account.dto.js";
import { UpdateBankAccountDto } from "./dto/update-bank-account.dto.js";

type AuthenticatedUser = {
  sub: number;
  email: string;
  role:
    | "ADMIN"
    | "PHARMACY_OWNER"
    | "PHARMACY_STAFF";
  pharmacyId: number | null;
};

type PaymentPlan =
  | "ONE_WEEK"
  | "ONE_MONTH"
  | "STANDARD"
  | "PROFESSIONAL"
  | "ENTERPRISE";

@Injectable()
export class PaymentsService {
  /*
   * =========================================================
   * SUBSCRIPTION PRICES
   * =========================================================
   *
   * Frontend plans:
   *
   * Basic      -> FREE
   * 1 Week     -> 1,000 ETB
   * 1 Month    -> 3,000 ETB
   * 6 Months   -> 15,000 ETB
   * 1 Year     -> 25,000 ETB
   * Lifetime   -> 120,000 ETB
   *
   * Database plans:
   *
   * Basic      -> BASIC
   * 1 Week     -> ONE_WEEK
   * 1 Month    -> ONE_MONTH
   * 6 Months   -> STANDARD
   * 1 Year     -> PROFESSIONAL
   * Lifetime   -> ENTERPRISE
   */
  private readonly PLAN_PRICES = {
    ONE_WEEK: 1000,
    ONE_MONTH: 3000,
    "6_MONTHS": 15000,
    "1_YEAR": 25000,
    LIFETIME: 120000,
  } as const;

  /*
   * Payment screenshot storage.
   */
  private readonly uploadDirectory = join(
    process.cwd(),
    "uploads",
    "payment-screenshots",
  );

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /*
   * =========================================================
   * PLAN DETAILS
   * =========================================================
   */
  private getPlanDetails(
    plan: string,
  ): {
    prismaPlan: PaymentPlan;
    amount: number;
    days: number | null;
    months: number | null;
  } {
    switch (plan) {
      case "ONE_WEEK":
        return {
          prismaPlan: "ONE_WEEK",
          amount: this.PLAN_PRICES.ONE_WEEK,
          days: 7,
          months: null,
        };

      case "ONE_MONTH":
        return {
          prismaPlan: "ONE_MONTH",
          amount: this.PLAN_PRICES.ONE_MONTH,
          days: 30,
          months: null,
        };

      case "6_MONTHS":
        return {
          prismaPlan: "STANDARD",
          amount: this.PLAN_PRICES["6_MONTHS"],
          days: null,
          months: 6,
        };

      case "1_YEAR":
        return {
          prismaPlan: "PROFESSIONAL",
          amount: this.PLAN_PRICES["1_YEAR"],
          days: null,
          months: 12,
        };

      case "LIFETIME":
        return {
          prismaPlan: "ENTERPRISE",
          amount: this.PLAN_PRICES.LIFETIME,
          days: null,
          months: null,
        };

      default:
        throw new BadRequestException(
          "Invalid subscription plan.",
        );
    }
  }

  /*
   * =========================================================
   * RENEWAL DATE
   * =========================================================
   *
   * ONE_WEEK  -> +7 days
   * ONE_MONTH -> +30 days
   * STANDARD  -> +6 months
   * PROFESSIONAL -> +12 months
   * ENTERPRISE -> no expiry
   */
  private getRenewalDate(
    startDate: Date,
    days: number | null,
    months: number | null,
  ): Date | null {
    if (days !== null) {
      const renewalDate = new Date(startDate);

      renewalDate.setDate(
        renewalDate.getDate() + days,
      );

      return renewalDate;
    }

    if (months !== null) {
      const renewalDate = new Date(startDate);

      renewalDate.setMonth(
        renewalDate.getMonth() + months,
      );

      return renewalDate;
    }

    return null;
  }

  /*
   * =========================================================
   * PHARMACY ACCESS CHECK
   * =========================================================
   */
  private checkPharmacyAccess(
    pharmacyId: number,
    user?: AuthenticatedUser,
  ): void {
    if (!user) {
      throw new ForbiddenException(
        "Authentication is required.",
      );
    }

    /*
     * Admin can access any pharmacy.
     */
    if (user.role === "ADMIN") {
      return;
    }

    /*
     * Pharmacy users can only access
     * their own pharmacy.
     */
    if (
      user.pharmacyId === null ||
      user.pharmacyId !== pharmacyId
    ) {
      throw new ForbiddenException(
        "You can only access payment information for your own pharmacy.",
      );
    }
  }

  /*
   * =========================================================
   * BANK ACCOUNT MANAGEMENT
   * =========================================================
   */

  /*
   * Get active bank accounts.
   */
  async getActiveBankAccounts() {
    return this.prisma.bankAccount.findMany({
      where: {
        isActive: true,
      },

      select: {
        id: true,
        bankName: true,
        accountName: true,
        accountNumber: true,
        branch: true,
        instructions: true,
      },

      orderBy: {
        bankName: "asc",
      },
    });
  }

  /*
   * Admin:
   * Get all bank accounts.
   */
  async getAllBankAccounts() {
    return this.prisma.bankAccount.findMany({
      orderBy: [
        {
          isActive: "desc",
        },
        {
          bankName: "asc",
        },
      ],
    });
  }

  /*
   * Admin:
   * Create bank account.
   */
  async createBankAccount(
    dto: CreateBankAccountDto,
  ) {
    const bankName = dto.bankName.trim();
    const accountName = dto.accountName.trim();
    const accountNumber =
      dto.accountNumber.trim();

    if (!bankName) {
      throw new BadRequestException(
        "Bank name is required.",
      );
    }

    if (!accountName) {
      throw new BadRequestException(
        "Account name is required.",
      );
    }

    if (!accountNumber) {
      throw new BadRequestException(
        "Account number is required.",
      );
    }

    return this.prisma.bankAccount.create({
      data: {
        bankName,
        accountName,
        accountNumber,
        branch:
          dto.branch?.trim() || null,
        instructions:
          dto.instructions?.trim() || null,
        isActive:
          dto.isActive ?? true,
      },
    });
  }

  /*
   * Admin:
   * Update bank account.
   */
  async updateBankAccount(
    id: number,
    dto: UpdateBankAccountDto,
  ) {
    const existing =
      await this.prisma.bankAccount.findUnique({
        where: {
          id,
        },
      });

    if (!existing) {
      throw new NotFoundException(
        "Bank account not found.",
      );
    }

    return this.prisma.bankAccount.update({
      where: {
        id,
      },

      data: {
        ...(dto.bankName !== undefined && {
          bankName:
            dto.bankName.trim(),
        }),

        ...(dto.accountName !== undefined && {
          accountName:
            dto.accountName.trim(),
        }),

        ...(dto.accountNumber !== undefined && {
          accountNumber:
            dto.accountNumber.trim(),
        }),

        ...(dto.branch !== undefined && {
          branch:
            dto.branch.trim() || null,
        }),

        ...(dto.instructions !== undefined && {
          instructions:
            dto.instructions.trim() || null,
        }),

        ...(dto.isActive !== undefined && {
          isActive: dto.isActive,
        }),
      },
    });
  }

  /*
   * Admin:
   * Delete bank account.
   */
  async deleteBankAccount(
    id: number,
  ) {
    const existing =
      await this.prisma.bankAccount.findUnique({
        where: {
          id,
        },
      });

    if (!existing) {
      throw new NotFoundException(
        "Bank account not found.",
      );
    }

    await this.prisma.bankAccount.delete({
      where: {
        id,
      },
    });

    return {
      success: true,
      message:
        "Bank account deleted successfully.",
    };
  }

  /*
   * =========================================================
   * BASIC PLAN
   * =========================================================
   *
   * BASIC:
   * - Free
   * - No payment
   * - No screenshot
   * - No expiry
   */
  async activateBasic(
    pharmacyId: number,
    user?: AuthenticatedUser,
  ) {
    this.checkPharmacyAccess(
      pharmacyId,
      user,
    );

    const pharmacy =
      await this.prisma.pharmacy.findUnique({
        where: {
          id: pharmacyId,
        },
      });

    if (!pharmacy) {
      throw new NotFoundException(
        "Pharmacy not found.",
      );
    }

    /*
     * Pharmacy must be approved.
     */
    if (
      pharmacy.verificationStatus !==
      "APPROVED"
    ) {
      throw new BadRequestException(
        "Your pharmacy must be approved before activating a subscription.",
      );
    }

    const existingSubscription =
      await this.prisma.subscription.findUnique({
        where: {
          pharmacyId,
        },
      });

    const now = new Date();

    /*
     * Never downgrade an active paid
     * subscription to Basic.
     */
    if (
      existingSubscription?.status ===
        "ACTIVE" &&
      existingSubscription.plan !==
        "BASIC" &&
      (
        existingSubscription.renewalDate ===
          null ||
        existingSubscription.renewalDate >
          now
      )
    ) {
      throw new BadRequestException(
        "Your pharmacy already has an active paid subscription.",
      );
    }

    /*
     * Basic already active.
     */
    if (
      existingSubscription?.status ===
        "ACTIVE" &&
      existingSubscription.plan ===
        "BASIC"
    ) {
      return {
        success: true,
        message:
          "Your Basic plan is already active.",
        subscription:
          existingSubscription,
      };
    }

    /*
     * Activate Basic.
     */
    const subscription =
      await this.prisma.subscription.upsert({
        where: {
          pharmacyId,
        },

        update: {
          plan: "BASIC",
          status: "ACTIVE",
          startDate: now,
          renewalDate: null,
        },

        create: {
          pharmacyId,
          plan: "BASIC",
          status: "ACTIVE",
          startDate: now,
          renewalDate: null,
        },
      });

    return {
      success: true,
      message:
        "Basic plan activated successfully.",
      subscription,
    };
  }

  /*
   * =========================================================
   * CREATE PAYMENT
   * =========================================================
   */
  async createPayment(
    dto: CreatePaymentDto,
    screenshot:
      | Express.Multer.File
      | undefined,
    user?: AuthenticatedUser,
  ) {
    /*
     * Authentication.
     */
    if (!user) {
      throw new ForbiddenException(
        "Authentication is required.",
      );
    }

    /*
     * Admin cannot submit pharmacy payments.
     */
    if (user.role === "ADMIN") {
      throw new ForbiddenException(
        "Administrators cannot submit pharmacy payments.",
      );
    }

    /*
     * Convert pharmacy ID.
     */
    const pharmacyId = Number(
      dto.pharmacyId,
    );

    if (
      !Number.isInteger(pharmacyId) ||
      pharmacyId < 1
    ) {
      throw new BadRequestException(
        "Invalid pharmacy ID.",
      );
    }

    /*
     * Verify pharmacy access.
     */
    this.checkPharmacyAccess(
      pharmacyId,
      user,
    );

    /*
     * Find pharmacy.
     */
    const pharmacy =
      await this.prisma.pharmacy.findUnique({
        where: {
          id: pharmacyId,
        },
      });

    if (!pharmacy) {
      throw new NotFoundException(
        "Pharmacy not found.",
      );
    }

    /*
     * Pharmacy must be approved.
     */
    if (
      pharmacy.verificationStatus !==
      "APPROVED"
    ) {
      throw new BadRequestException(
        "Your pharmacy must be approved before subscribing.",
      );
    }

    /*
     * BASIC cannot be submitted as a payment.
     */
    if (dto.plan === "BASIC") {
      throw new BadRequestException(
        "The Basic plan is free. Activate it without submitting a payment.",
      );
    }

    /*
     * Validate plan.
     */
    const planDetails =
      this.getPlanDetails(
        dto.plan,
      );

    /*
     * Never trust the amount sent
     * from the frontend.
     */
    if (
      Number(dto.amount) !==
      planDetails.amount
    ) {
      throw new BadRequestException(
        `The selected plan costs ${planDetails.amount.toLocaleString()} ETB.`,
      );
    }

    /*
     * =====================================================
     * SCREENSHOT VALIDATION
     * =====================================================
     */
    if (!screenshot) {
      throw new BadRequestException(
        "Payment screenshot is required.",
      );
    }

    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (
      !allowedMimeTypes.includes(
        screenshot.mimetype,
      )
    ) {
      throw new BadRequestException(
        "Only JPEG, PNG, or WebP payment screenshots are allowed.",
      );
    }

    const maxFileSize =
      5 * 1024 * 1024;

    if (
      screenshot.size > maxFileSize
    ) {
      throw new BadRequestException(
        "Screenshot must be smaller than 5MB.",
      );
    }

    /*
     * =====================================================
     * BANK VALIDATION
     * =====================================================
     */
    const bankAccountId = Number(
      dto.bankAccountId,
    );

    if (
      !Number.isInteger(
        bankAccountId,
      ) ||
      bankAccountId < 1
    ) {
      throw new BadRequestException(
        "Please select a valid bank account.",
      );
    }

    /*
     * Only active bank accounts can
     * receive new payments.
     */
    const bankAccount =
      await this.prisma.bankAccount.findFirst({
        where: {
          id: bankAccountId,
          isActive: true,
        },
      });

    if (!bankAccount) {
      throw new BadRequestException(
        "The selected bank account is no longer available.",
      );
    }

    /*
     * =====================================================
     * TRANSACTION ID
     * =====================================================
     */
    const transactionId =
      dto.transactionId.trim();

    if (!transactionId) {
      throw new BadRequestException(
        "Transaction ID is required.",
      );
    }

    const existingPayment =
      await this.prisma.payment.findUnique({
        where: {
          transactionId,
        },
      });

    if (existingPayment) {
      throw new BadRequestException(
        "This transaction ID has already been submitted.",
      );
    }

    /*
     * =====================================================
     * ONE PENDING PAYMENT PER PHARMACY
     * =====================================================
     */
    const pendingPayment =
      await this.prisma.payment.findFirst({
        where: {
          pharmacyId,
          status: "PENDING",
        },
      });

    if (pendingPayment) {
      throw new BadRequestException(
        "Your pharmacy already has a payment waiting for verification.",
      );
    }

    /*
     * =====================================================
     * SAVE SCREENSHOT
     * =====================================================
     */
    await mkdir(
      this.uploadDirectory,
      {
        recursive: true,
      },
    );

    const extension =
      extname(
        screenshot.originalname,
      ).toLowerCase();

    const safeExtension =
      [
        ".jpg",
        ".jpeg",
        ".png",
        ".webp",
      ].includes(extension)
        ? extension
        : ".jpg";

    const savedFileName =
      `${randomUUID()}${safeExtension}`;

    const savedFilePath =
      join(
        this.uploadDirectory,
        savedFileName,
      );

    await writeFile(
      savedFilePath,
      screenshot.buffer,
    );

    try {
      /*
       * ===================================================
       * CREATE PAYMENT
       * ===================================================
       */
      const payment =
        await this.prisma.payment.create({
          data: {
            pharmacyId,

            plan:
              planDetails.prismaPlan,

            amount:
              planDetails.amount,

            transactionId,

            status: "PENDING",

            bankAccountId:
              bankAccount.id,

            screenshotName:
              savedFileName,

            screenshotMimeType:
              screenshot.mimetype,

            screenshotSize:
              screenshot.size,
          },

          include: {
            bankAccount: {
              select: {
                id: true,
                bankName: true,
                accountName: true,
                accountNumber: true,
                branch: true,
              },
            },
          },
        });

      return {
        success: true,

        message:
          "Payment submitted for admin verification.",

        payment: {
          id: payment.id,

          pharmacyId:
            payment.pharmacyId,

          plan:
            payment.plan,

          amount:
            payment.amount,

          transactionId:
            payment.transactionId,

          status:
            payment.status,

          bankAccount:
            payment.bankAccount,

          screenshot: {
            fileName:
              payment.screenshotName,

            mimeType:
              payment.screenshotMimeType,

            size:
              payment.screenshotSize,
          },

          createdAt:
            payment.createdAt,
        },
      };
    } catch (error) {
      /*
       * Remove screenshot if database
       * creation fails.
       */
      try {
        await unlink(
          savedFilePath,
        );
      } catch {
        // Ignore cleanup failure.
      }

      throw error;
    }
  }

  /*
   * =========================================================
   * ADMIN - PENDING PAYMENTS
   * =========================================================
   */
  async getPendingPayments() {
    return this.prisma.payment.findMany({
      where: {
        status: "PENDING",
      },

      include: {
        pharmacy: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
            email: true,
            verificationStatus: true,
          },
        },

        bankAccount: {
          select: {
            id: true,
            bankName: true,
            accountName: true,
            accountNumber: true,
            branch: true,
            instructions: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });
  }

  /*
   * =========================================================
   * ADMIN - PAYMENT SCREENSHOT
   * =========================================================
   */
  async getPaymentScreenshot(
    paymentId: number,
  ) {
    const payment =
      await this.prisma.payment.findUnique({
        where: {
          id: paymentId,
        },
      });

    if (!payment) {
      throw new NotFoundException(
        "Payment not found.",
      );
    }

    if (!payment.screenshotName) {
      throw new NotFoundException(
        "Payment screenshot not found.",
      );
    }

    const filePath =
      join(
        this.uploadDirectory,
        payment.screenshotName,
      );

    try {
      const buffer =
        await readFile(filePath);

      return {
        buffer,

        mimeType:
          payment.screenshotMimeType ||
          "application/octet-stream",
      };
    } catch {
      throw new NotFoundException(
        "Payment screenshot file not found.",
      );
    }
  }

  /*
   * =========================================================
   * ADMIN - ACTIVE SUBSCRIPTIONS
   * =========================================================
   */
  async getActiveSubscriptions() {
    const now = new Date();

    /*
     * Expire subscriptions whose
     * renewal date has passed.
     *
     * Basic and Lifetime have null
     * renewalDate and do not expire.
     */
    await this.prisma.subscription.updateMany({
      where: {
        status: "ACTIVE",

        renewalDate: {
          not: null,
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

        OR: [
          {
            renewalDate: {
              gt: now,
            },
          },

          {
            renewalDate: null,
          },
        ],
      },

      include: {
        pharmacy: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
            email: true,
          },
        },
      },

      orderBy: {
        createdAt: "asc",
      },
    });
  }

  /*
   * =========================================================
   * PHARMACY/ADMIN - GET SUBSCRIPTION
   * =========================================================
   */
  async getPharmacySubscription(
    pharmacyId: number,
    user?: AuthenticatedUser,
  ) {
    this.checkPharmacyAccess(
      pharmacyId,
      user,
    );

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

    /*
     * Expire subscriptions with
     * a passed renewal date.
     */
    if (
      subscription.status ===
        "ACTIVE" &&
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

  /*
   * =========================================================
   * ADMIN - VERIFY PAYMENT
   * =========================================================
   *
   * Payment:
   * PENDING -> VERIFIED
   *
   * Subscription:
   * -> ACTIVE
   */
  async verifyPayment(
    paymentId: number,
  ) {
    const payment =
      await this.prisma.payment.findUnique({
        where: {
          id: paymentId,
        },
      });

    if (!payment) {
      throw new NotFoundException(
        "Payment not found.",
      );
    }

    /*
     * Payment must still be pending.
     */
    if (
      payment.status !== "PENDING"
    ) {
      throw new BadRequestException(
        "This payment has already been processed.",
      );
    }

    const startDate = new Date();

    let days: number | null = null;
    let months: number | null = null;

    /*
     * Determine subscription duration
     * from the database plan.
     */
    switch (payment.plan) {
      case "ONE_WEEK":
        days = 7;
        break;

      case "ONE_MONTH":
        days = 30;
        break;

      case "STANDARD":
        months = 6;
        break;

      case "PROFESSIONAL":
        months = 12;
        break;

      case "ENTERPRISE":
        days = null;
        months = null;
        break;

      default:
        throw new BadRequestException(
          "Invalid payment subscription plan.",
        );
    }

    const renewalDate =
      this.getRenewalDate(
        startDate,
        days,
        months,
      );

    /*
     * Payment verification and
     * subscription activation happen
     * inside one transaction.
     */
    const result =
      await this.prisma.$transaction(
        async (tx) => {
          /*
           * Mark payment verified.
           */
          const verifiedPayment =
            await tx.payment.update({
              where: {
                id: payment.id,
              },

              data: {
                status: "VERIFIED",
                verifiedAt: startDate,
              },

              include: {
                bankAccount: {
                  select: {
                    id: true,
                    bankName: true,
                    accountName: true,
                    accountNumber: true,
                    branch: true,
                  },
                },
              },
            });

          /*
           * Activate subscription.
           */
          const subscription =
            await tx.subscription.upsert({
              where: {
                pharmacyId:
                  payment.pharmacyId,
              },

              update: {
                plan:
                  payment.plan,

                status:
                  "ACTIVE",

                startDate,

                renewalDate,
              },

              create: {
                pharmacyId:
                  payment.pharmacyId,

                plan:
                  payment.plan,

                status:
                  "ACTIVE",

                startDate,

                renewalDate,
              },
            });

          return {
            payment:
              verifiedPayment,

            subscription,
          };
        },
      );

    return {
      success: true,

      message:
        result.subscription.renewalDate
          ? "Payment verified. Subscription is now active."
          : "Payment verified. Lifetime subscription is now active.",

      payment:
        result.payment,

      subscription:
        result.subscription,
    };
  }

  /*
   * =========================================================
   * ADMIN - REJECT PAYMENT
   * =========================================================
   */
  async rejectPayment(
    paymentId: number,
  ) {
    const payment =
      await this.prisma.payment.findUnique({
        where: {
          id: paymentId,
        },
      });

    if (!payment) {
      throw new NotFoundException(
        "Payment not found.",
      );
    }

    /*
     * Payment must still be pending.
     */
    if (
      payment.status !== "PENDING"
    ) {
      throw new BadRequestException(
        "This payment has already been processed.",
      );
    }

    const rejectedPayment =
      await this.prisma.payment.update({
        where: {
          id: paymentId,
        },

        data: {
          status: "REJECTED",
          rejectedAt: new Date(),
        },

        include: {
          bankAccount: {
            select: {
              id: true,
              bankName: true,
              accountName: true,
              accountNumber: true,
              branch: true,
            },
          },
        },
      });

    return {
      success: true,

      message:
        "Payment rejected.",

      payment:
        rejectedPayment,
    };
  }
}