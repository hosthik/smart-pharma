
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service.js";
import { CreateFeedbackDto } from "./dto/create-feedback.dto.js";
import { CreatePharmacyFeedbackDto } from "./dto/create-pharmacy-feedback.dto.js";

type FeedbackStatus =
  | "NEW"
  | "REVIEWING"
  | "RESPONDED"
  | "RESOLVED";

@Injectable()
export class FeedbackService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  // ==========================================
  // Patient - create feedback
  // ==========================================

  async create(
    createFeedbackDto: CreateFeedbackDto,
  ) {
    const {
      senderType,
      name,
      email,
      pharmacyId,
      category,
      message,
    } = createFeedbackDto;

    // Patient endpoint is only for patient feedback
    if (senderType === "PHARMACY") {
      throw new BadRequestException(
        "Pharmacy feedback must use the pharmacy feedback endpoint.",
      );
    }

    // Validate pharmacy if supplied
    if (pharmacyId) {
      const pharmacy =
        await this.prisma.pharmacy.findUnique({
          where: {
            id: pharmacyId,
          },
        });

      if (!pharmacy) {
        throw new BadRequestException(
          "Pharmacy not found.",
        );
      }
    }

    return this.prisma.feedback.create({
      data: {
        senderType: "PATIENT",

        name:
          name?.trim() || null,

        email:
          email?.trim() || null,

        pharmacyId:
          pharmacyId || null,

        category:
          category.trim(),

        message:
          message.trim(),

        status: "NEW",
      },

      include: {
        pharmacy: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });
  }

  // ==========================================
  // Pharmacy - create feedback
  // ==========================================

  async createPharmacyFeedback(
    pharmacyId: number,
    dto: CreatePharmacyFeedbackDto,
  ) {
    const pharmacy =
      await this.prisma.pharmacy.findUnique({
        where: {
          id: pharmacyId,
        },
      });

    if (!pharmacy) {
      throw new BadRequestException(
        "Pharmacy not found.",
      );
    }

    return this.prisma.feedback.create({
      data: {
        senderType: "PHARMACY",

        // Use the real pharmacy information
        name:
          pharmacy.name?.trim() || null,

        email:
          pharmacy.email?.trim() || null,

        // Pharmacy ID comes from JWT
        pharmacyId,

        category:
          dto.category.trim(),

        message:
          dto.message.trim(),

        status: "NEW",
      },

      include: {
        pharmacy: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });
  }

  // ==========================================
  // Admin - get all feedback
  // ==========================================

  async findAll() {
    return this.prisma.feedback.findMany({
      orderBy: {
        createdAt: "desc",
      },

      include: {
        pharmacy: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });
  }

  // ==========================================
  // Admin - get one feedback
  // ==========================================

  async findOne(id: number) {
    const feedback =
      await this.prisma.feedback.findUnique({
        where: {
          id,
        },

        include: {
          pharmacy: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      });

    if (!feedback) {
      throw new NotFoundException(
        "Feedback not found.",
      );
    }

    return feedback;
  }

  // ==========================================
  // Admin - update status
  // ==========================================

  async updateStatus(
    id: number,
    status: FeedbackStatus,
  ) {
    const existing =
      await this.prisma.feedback.findUnique({
        where: {
          id,
        },
      });

    if (!existing) {
      throw new NotFoundException(
        "Feedback not found.",
      );
    }

    return this.prisma.feedback.update({
      where: {
        id,
      },

      data: {
        status,
      },

      include: {
        pharmacy: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });
  }

  // ==========================================
  // Admin - reply
  // ==========================================

  async reply(
    id: number,
    adminReply: string,
  ) {
    const existing =
      await this.prisma.feedback.findUnique({
        where: {
          id,
        },
      });

    if (!existing) {
      throw new NotFoundException(
        "Feedback not found.",
      );
    }

    return this.prisma.feedback.update({
      where: {
        id,
      },

      data: {
        adminReply:
          adminReply.trim(),

        repliedAt:
          new Date(),

        status: "RESPONDED",
      },

      include: {
        pharmacy: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });
  }
}
