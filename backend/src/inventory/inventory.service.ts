import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import type { CreateInventoryDto } from "./dto/create-inventory.dto.js";
import type { UpdateInventoryDto } from "./dto/update-inventory.dto.js";

type UserRole = "ADMIN" | "PHARMACY_OWNER" | "PHARMACY_STAFF";

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  private async requirePharmacyAccess(
    pharmacyId: number,
    role: UserRole,
    userPharmacyId: number | null,
  ) {
    if (role === "ADMIN") {
      return;
    }

    if (
      role !== "PHARMACY_OWNER" &&
      role !== "PHARMACY_STAFF"
    ) {
      throw new ForbiddenException(
        "Only pharmacy users can manage inventory.",
      );
    }

    if (userPharmacyId !== pharmacyId) {
      throw new ForbiddenException(
        "You can only manage inventory for your own pharmacy.",
      );
    }

    const pharmacy = await this.prisma.pharmacy.findUnique({
      where: {
        id: pharmacyId,
      },
      select: {
        id: true,
        verificationStatus: true,
      },
    });

    if (!pharmacy) {
      throw new NotFoundException("Pharmacy not found.");
    }

    if (pharmacy.verificationStatus !== "APPROVED") {
      throw new ForbiddenException(
        "Your pharmacy must be approved before you can manage inventory.",
      );
    }

    const subscription = await this.prisma.subscription.findUnique({
      where: {
        pharmacyId,
      },
    });

    if (!subscription || subscription.status !== "ACTIVE") {
      throw new ForbiddenException(
        "An active subscription is required to manage inventory.",
      );
    }

    // ENTERPRISE represents the Lifetime plan.
    // Lifetime subscriptions do not have a renewalDate.
    if (subscription.plan === "ENTERPRISE") {
      return;
    }

    // All non-lifetime subscriptions must have a valid future renewal date.
    if (
      !subscription.renewalDate ||
      subscription.renewalDate <= new Date()
    ) {
      throw new ForbiddenException(
        "Your subscription has expired. Please renew your subscription.",
      );
    }
  }

  async findAll(
    pharmacyId: number,
    role: UserRole,
    userPharmacyId: number | null,
  ) {
    if (role !== "ADMIN") {
      await this.requirePharmacyAccess(
        pharmacyId,
        role,
        userPharmacyId,
      );
    }

    return this.prisma.inventory.findMany({
      where: {
        pharmacyId,
      },
      include: {
        medicine: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
  }

  async findOne(
    id: number,
    role: UserRole,
    userPharmacyId: number | null,
  ) {
    const inventory = await this.prisma.inventory.findUnique({
      where: {
        id,
      },
      include: {
        medicine: true,
        pharmacy: true,
      },
    });

    if (!inventory) {
      throw new NotFoundException("Inventory item not found.");
    }

    if (role !== "ADMIN") {
      await this.requirePharmacyAccess(
        inventory.pharmacyId,
        role,
        userPharmacyId,
      );
    }

    return inventory;
  }

  async create(
    dto: CreateInventoryDto,
    role: UserRole,
    userPharmacyId: number | null,
  ) {
    const pharmacyId = Number(dto.pharmacyId);
    const medicineId = Number(dto.medicineId);
    const quantity = Number(dto.quantity);
    const price = Number(dto.price);

    if (!Number.isInteger(pharmacyId) || pharmacyId < 1) {
      throw new BadRequestException("Invalid pharmacy ID.");
    }

    if (!Number.isInteger(medicineId) || medicineId < 1) {
      throw new BadRequestException("Invalid medicine ID.");
    }

    if (!Number.isInteger(quantity) || quantity < 0) {
      throw new BadRequestException(
        "Quantity must be a non-negative integer.",
      );
    }

    if (quantity > 10) {
      throw new BadRequestException(
        "Quantity cannot be greater than 10 for this demo inventory.",
      );
    }

    if (!Number.isFinite(price) || price < 0) {
      throw new BadRequestException(
        "Price must be a valid non-negative number.",
      );
    }

    await this.requirePharmacyAccess(
      pharmacyId,
      role,
      userPharmacyId,
    );

    const medicine = await this.prisma.medicine.findUnique({
      where: {
        id: medicineId,
      },
    });

    if (!medicine) {
      throw new NotFoundException("Medicine not found.");
    }

    const existing = await this.prisma.inventory.findUnique({
      where: {
        pharmacyId_medicineId: {
          pharmacyId,
          medicineId,
        },
      },
    });

    if (existing) {
      throw new BadRequestException(
        "This medicine already exists in the pharmacy inventory.",
      );
    }

    const stockStatus =
      quantity === 0
        ? "OUT_OF_STOCK"
        : quantity <= 3
          ? "LOW_STOCK"
          : "AVAILABLE";

    return this.prisma.inventory.create({
      data: {
        pharmacyId,
        medicineId,
        quantity,
        price,
        stockStatus,
        section: dto.section || null,
        shelf: dto.shelf || null,
        row: dto.row || null,
      },
      include: {
        medicine: true,
      },
    });
  }

  async update(
    id: number,
    dto: UpdateInventoryDto,
    role: UserRole,
    userPharmacyId: number | null,
  ) {
    const existing = await this.prisma.inventory.findUnique({
      where: {
        id,
      },
    });

    if (!existing) {
      throw new NotFoundException("Inventory item not found.");
    }

    await this.requirePharmacyAccess(
      existing.pharmacyId,
      role,
      userPharmacyId,
    );

    const quantity =
      dto.quantity !== undefined
        ? Number(dto.quantity)
        : existing.quantity;

    const price =
      dto.price !== undefined
        ? Number(dto.price)
        : existing.price;

    if (!Number.isInteger(quantity) || quantity < 0) {
      throw new BadRequestException(
        "Quantity must be a non-negative integer.",
      );
    }

    if (quantity > 10) {
      throw new BadRequestException(
        "Quantity cannot be greater than 10 for this demo inventory.",
      );
    }

    if (!Number.isFinite(price) || price < 0) {
      throw new BadRequestException(
        "Price must be a valid non-negative number.",
      );
    }

    const stockStatus =
      quantity === 0
        ? "OUT_OF_STOCK"
        : quantity <= 3
          ? "LOW_STOCK"
          : "AVAILABLE";

    return this.prisma.inventory.update({
      where: {
        id,
      },
      data: {
        quantity,
        price,
        stockStatus,
        section:
          dto.section !== undefined
            ? dto.section || null
            : existing.section,
        shelf:
          dto.shelf !== undefined
            ? dto.shelf || null
            : existing.shelf,
        row:
          dto.row !== undefined
            ? dto.row || null
            : existing.row,
      },
      include: {
        medicine: true,
      },
    });
  }

  async remove(
    id: number,
    role: UserRole,
    userPharmacyId: number | null,
  ) {
    const existing = await this.prisma.inventory.findUnique({
      where: {
        id,
      },
    });

    if (!existing) {
      throw new NotFoundException("Inventory item not found.");
    }

    await this.requirePharmacyAccess(
      existing.pharmacyId,
      role,
      userPharmacyId,
    );

    await this.prisma.inventory.delete({
      where: {
        id,
      },
    });

    return {
      message: "Inventory item removed successfully.",
    };
  }
}