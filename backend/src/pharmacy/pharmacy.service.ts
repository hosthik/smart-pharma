import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service.js";

@Injectable()
export class PharmacyService {
  constructor(private readonly prisma: PrismaService) {}

  // =========================
  // Public pharmacy list
  // =========================

  async findAll() {
    return this.prisma.pharmacy.findMany({
      where: {
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
        },
      },
      orderBy: {
        name: "asc",
      },
    });
  }

  // =========================
  // Public pharmacy details
  // =========================

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
        },
      },
    });

    if (!pharmacy) {
      throw new NotFoundException("Pharmacy not found.");
    }

    return pharmacy;
  }

  // =========================
  // Pharmacy account
  // =========================

  async getAccount(
    id: number,
    role: "ADMIN" | "PHARMACY_OWNER" | "PHARMACY_STAFF",
    userPharmacyId: number | null,
  ) {
    if (role !== "ADMIN" && userPharmacyId !== id) {
      throw new ForbiddenException(
        "You can only access your own pharmacy account.",
      );
    }

    const pharmacy = await this.prisma.pharmacy.findUnique({
      where: {
        id,
      },
    });

    if (!pharmacy) {
      throw new NotFoundException("Pharmacy account not found.");
    }

    return pharmacy;
  }

  // =========================
  // Update pharmacy account
  // =========================

  async updateAccount(
    id: number,
    data: {
      name?: string;
      address?: string;
      phone?: string;
      email?: string;
      openingHours?: string;
    },
    role: "ADMIN" | "PHARMACY_OWNER" | "PHARMACY_STAFF",
    userPharmacyId: number | null,
  ) {
    if (role !== "ADMIN" && userPharmacyId !== id) {
      throw new ForbiddenException(
        "You can only update your own pharmacy account.",
      );
    }

    const pharmacy = await this.prisma.pharmacy.findUnique({
      where: {
        id,
      },
    });

    if (!pharmacy) {
      throw new NotFoundException("Pharmacy account not found.");
    }

    const name =
      data.name !== undefined
        ? data.name.trim()
        : pharmacy.name;

    const address =
      data.address !== undefined
        ? data.address.trim()
        : pharmacy.address;

    const phone =
      data.phone !== undefined
        ? data.phone.trim()
        : pharmacy.phone;

    const email =
      data.email !== undefined
        ? data.email.trim()
        : pharmacy.email;

    const openingHours =
      data.openingHours !== undefined
        ? data.openingHours.trim()
        : pharmacy.openingHours;

    if (!name) {
      throw new BadRequestException(
        "Pharmacy name is required.",
      );
    }

    if (!address) {
      throw new BadRequestException(
        "Pharmacy address is required.",
      );
    }

    if (email && !email.includes("@")) {
      throw new BadRequestException(
        "Please provide a valid email address.",
      );
    }

    return this.prisma.pharmacy.update({
      where: {
        id,
      },
      data: {
        name,
        address,
        phone: phone || null,
        email: email || null,
        openingHours: openingHours || null,
      },
    });
  }

  // =========================
  // Delete pharmacy account
  // =========================

  async deleteAccount(
    pharmacyId: number,
    role: "ADMIN" | "PHARMACY_OWNER" | "PHARMACY_STAFF",
    userPharmacyId: number | null,
  ) {
    if (!pharmacyId) {
      throw new BadRequestException(
        "A pharmacy account is required.",
      );
    }

    if (role === "ADMIN") {
      throw new ForbiddenException(
        "Administrators cannot delete a pharmacy account through this endpoint.",
      );
    }

    if (!userPharmacyId || userPharmacyId !== pharmacyId) {
      throw new ForbiddenException(
        "You are not authorized to delete this pharmacy account.",
      );
    }

    const pharmacy = await this.prisma.pharmacy.findUnique({
      where: {
        id: pharmacyId,
      },
    });

    if (!pharmacy) {
      throw new NotFoundException(
        "Pharmacy account not found.",
      );
    }

    await this.prisma.$transaction(async (transaction) => {
      // Delete users first because User.pharmacyId
      // does not use cascade deletion.
      await transaction.user.deleteMany({
        where: {
          pharmacyId,
        },
      });

      // Inventory, payments and subscription use
      // cascade deletion in the Prisma schema.
      await transaction.pharmacy.delete({
        where: {
          id: pharmacyId,
        },
      });
    });

    return {
      success: true,
      message: "Pharmacy account deleted successfully.",
    };
  }

  // =========================
  // Pending pharmacies
  // =========================

  async findPending() {
    return this.prisma.pharmacy.findMany({
      where: {
        verificationStatus: "PENDING",
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  }

  // =========================
  // Approve pharmacy
  // =========================

  async approve(id: number) {
    const pharmacy = await this.prisma.pharmacy.findUnique({
      where: {
        id,
      },
    });

    if (!pharmacy) {
      throw new NotFoundException("Pharmacy not found.");
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

  // =========================
  // Reject pharmacy
  // =========================

  async reject(id: number, reason: string) {
    const pharmacy = await this.prisma.pharmacy.findUnique({
      where: {
        id,
      },
    });

    if (!pharmacy) {
      throw new NotFoundException("Pharmacy not found.");
    }

    const cleanReason = reason.trim();

    if (!cleanReason) {
      throw new BadRequestException(
        "A rejection reason is required.",
      );
    }

    return this.prisma.pharmacy.update({
      where: {
        id,
      },
      data: {
        verificationStatus: "REJECTED",
        verificationReason: cleanReason,
        verifiedAt: null,
      },
    });
  }

  // =========================
  // Update pharmacy location
  // =========================

  async updateLocation(
    id: number,
    latitude: number,
    longitude: number,
    role: "ADMIN" | "PHARMACY_OWNER" | "PHARMACY_STAFF",
    userPharmacyId: number | null,
  ) {
    if (role !== "ADMIN" && userPharmacyId !== id) {
      throw new ForbiddenException(
        "You can only update your own pharmacy location.",
      );
    }

    if (!Number.isFinite(latitude)) {
      throw new BadRequestException(
        "A valid latitude is required.",
      );
    }

    if (!Number.isFinite(longitude)) {
      throw new BadRequestException(
        "A valid longitude is required.",
      );
    }

    if (latitude < -90 || latitude > 90) {
      throw new BadRequestException(
        "Latitude must be between -90 and 90.",
      );
    }

    if (longitude < -180 || longitude > 180) {
      throw new BadRequestException(
        "Longitude must be between -180 and 180.",
      );
    }

    const pharmacy = await this.prisma.pharmacy.findUnique({
      where: {
        id,
      },
    });

    if (!pharmacy) {
      throw new NotFoundException("Pharmacy not found.");
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

  // =========================
  // Nearby pharmacies
  // =========================

  async findNearby(
    latitude: number,
    longitude: number,
    radiusKm = 10,
  ) {
    if (!Number.isFinite(latitude)) {
      throw new BadRequestException(
        "A valid latitude is required.",
      );
    }

    if (!Number.isFinite(longitude)) {
      throw new BadRequestException(
        "A valid longitude is required.",
      );
    }

    if (
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      throw new BadRequestException(
        "Invalid latitude or longitude.",
      );
    }

    if (!Number.isFinite(radiusKm) || radiusKm <= 0) {
      throw new BadRequestException(
        "Radius must be greater than zero.",
      );
    }

    const pharmacies = await this.prisma.pharmacy.findMany({
      where: {
        verificationStatus: "APPROVED",
        latitude: {
          not: null,
        },
        longitude: {
          not: null,
        },
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
        },
      },
    });

    const earthRadiusKm = 6371;

    const toRadians = (value: number) =>
      (value * Math.PI) / 180;

    const nearby = pharmacies
      .map((pharmacy) => {
        if (
          pharmacy.latitude === null ||
          pharmacy.longitude === null
        ) {
          return null;
        }

        const latitudeDifference = toRadians(
          pharmacy.latitude - latitude,
        );

        const longitudeDifference = toRadians(
          pharmacy.longitude - longitude,
        );

        const startLatitude = toRadians(latitude);
        const endLatitude = toRadians(
          pharmacy.latitude,
        );

        const a =
          Math.sin(latitudeDifference / 2) ** 2 +
          Math.cos(startLatitude) *
            Math.cos(endLatitude) *
            Math.sin(longitudeDifference / 2) ** 2;

        const distance =
          2 *
          earthRadiusKm *
          Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a),
          );

        return {
          ...pharmacy,
          distanceKm: Number(distance.toFixed(2)),
        };
      })
      .filter(
        (
          pharmacy,
        ): pharmacy is NonNullable<typeof pharmacy> =>
          pharmacy !== null &&
          pharmacy.distanceKm <= radiusKm,
      )
      .sort(
        (first, second) =>
          first.distanceKm - second.distanceKm,
      );

    return nearby;
  }
}