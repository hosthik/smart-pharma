import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service.js";

@Injectable()
export class PharmacyService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findAll() {
    return this.prisma.pharmacy.findMany({
      where: {
        verificationStatus: "APPROVED",
      },
      orderBy: {
        name: "asc",
      },
      include: {
        inventory: {
          where: {
            quantity: {
              gt: 0,
            },
          },
          include: {
            medicine: true,
          },
          orderBy: {
            updatedAt: "desc",
          },
        },
      },
    });
  }

  async findOne(id: number) {
    const pharmacy = await this.prisma.pharmacy.findFirst({
      where: {
        id,
        verificationStatus: "APPROVED",
      },
      include: {
        inventory: {
          where: {
            quantity: {
              gt: 0,
            },
          },
          include: {
            medicine: true,
          },
          orderBy: {
            updatedAt: "desc",
          },
        },
      },
    });

    if (!pharmacy) {
      throw new NotFoundException(
        "Pharmacy not found or not verified.",
      );
    }

    return pharmacy;
  }

  async findPending() {
    return this.prisma.pharmacy.findMany({
      where: {
        verificationStatus: "PENDING",
      },
      orderBy: {
        createdAt: "asc",
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async approve(id: number) {
    const pharmacy =
      await this.prisma.pharmacy.findUnique({
        where: {
          id,
        },
      });

    if (!pharmacy) {
      throw new NotFoundException(
        "Pharmacy not found.",
      );
    }

    return this.prisma.pharmacy.update({
      where: {
        id,
      },
      data: {
        verificationStatus: "APPROVED",
        verificationReason: null,
        verifiedAt: new Date(),
      },
    });
  }

  async reject(id: number, reason: string) {
    if (!reason?.trim()) {
      throw new BadRequestException(
        "A rejection reason is required.",
      );
    }

    const pharmacy =
      await this.prisma.pharmacy.findUnique({
        where: {
          id,
        },
      });

    if (!pharmacy) {
      throw new NotFoundException(
        "Pharmacy not found.",
      );
    }

    return this.prisma.pharmacy.update({
      where: {
        id,
      },
      data: {
        verificationStatus: "REJECTED",
        verificationReason: reason.trim(),
        verifiedAt: null,
      },
    });
  }

  async updateLocation(
  id: number,
  latitude: number,
  longitude: number,
  role:
    | "ADMIN"
    | "PHARMACY_OWNER"
    | "PHARMACY_STAFF",
  userPharmacyId: number | null,
) {
  if (
    !Number.isFinite(latitude) ||
    latitude < -90 ||
    latitude > 90
  ) {
    throw new BadRequestException(
      "Latitude must be between -90 and 90.",
    );
  }

  if (
    !Number.isFinite(longitude) ||
    longitude < -180 ||
    longitude > 180
  ) {
    throw new BadRequestException(
      "Longitude must be between -180 and 180.",
    );
  }

  const pharmacy =
    await this.prisma.pharmacy.findUnique({
      where: {
        id,
      },
    });

  if (!pharmacy) {
    throw new NotFoundException(
      "Pharmacy not found.",
    );
  }

  if (role !== "ADMIN") {
    if (
      userPharmacyId !== id
    ) {
      throw new BadRequestException(
        "You can only update your own pharmacy location.",
      );
    }
  }

  return this.prisma.pharmacy.update({
    where: {
      id,
    },
    data: {
      latitude,
      longitude,
    },
  });
}
}