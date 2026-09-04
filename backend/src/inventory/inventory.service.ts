import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service.js";
import { CreateInventoryDto } from "./dto/create-inventory.dto.js";
import { UpdateInventoryDto } from "./dto/update-inventory.dto.js";

@Injectable()
export class InventoryService {
  private readonly MAX_QUANTITY_PER_MEDICINE = 10;

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  private getStockStatus(quantity: number) {
    if (quantity <= 0) {
      return "OUT_OF_STOCK";
    }

    if (quantity <= 3) {
      return "LOW_STOCK";
    }

    return "AVAILABLE";
  }

  private async checkActiveSubscription(
    pharmacyId: number,
  ) {
    const subscription =
      await this.prisma.subscription.findUnique({
        where: {
          pharmacyId,
        },
      });

    if (
      !subscription ||
      subscription.status !== "ACTIVE" ||
      !subscription.renewalDate
    ) {
      throw new BadRequestException(
        "An active subscription is required to manage inventory.",
      );
    }

    const now = new Date();

    if (subscription.renewalDate <= now) {
      await this.prisma.subscription.update({
        where: {
          id: subscription.id,
        },
        data: {
          status: "EXPIRED",
        },
      });

      throw new BadRequestException(
        "Your subscription has expired. Please renew your subscription to manage inventory.",
      );
    }

    return subscription;
  }

  async create(dto: CreateInventoryDto) {
    await this.checkActiveSubscription(
      dto.pharmacyId,
    );

    if (
      dto.quantity >
      this.MAX_QUANTITY_PER_MEDICINE
    ) {
      throw new BadRequestException(
        `A maximum of ${this.MAX_QUANTITY_PER_MEDICINE} pieces is allowed for each medicine.`,
      );
    }

    const pharmacy =
      await this.prisma.pharmacy.findUnique({
        where: {
          id: dto.pharmacyId,
        },
      });

    if (!pharmacy) {
      throw new NotFoundException(
        "Pharmacy not found",
      );
    }

    const medicine =
      await this.prisma.medicine.findUnique({
        where: {
          id: dto.medicineId,
        },
      });

    if (!medicine) {
      throw new NotFoundException(
        "Medicine not found",
      );
    }

    const stockStatus = this.getStockStatus(
      dto.quantity,
    );

    return this.prisma.inventory.upsert({
      where: {
        pharmacyId_medicineId: {
          pharmacyId: dto.pharmacyId,
          medicineId: dto.medicineId,
        },
      },
      update: {
        quantity: dto.quantity,
        price: dto.price,
        stockStatus,
        section: dto.section,
        shelf: dto.shelf,
        row: dto.row,
      },
      create: {
        pharmacyId: dto.pharmacyId,
        medicineId: dto.medicineId,
        quantity: dto.quantity,
        price: dto.price,
        stockStatus,
        section: dto.section,
        shelf: dto.shelf,
        row: dto.row,
      },
      include: {
        medicine: true,
        pharmacy: true,
      },
    });
  }

  async findByPharmacy(
    pharmacyId: number,
  ) {
    return this.prisma.inventory.findMany({
      where: {
        pharmacyId,
      },
      include: {
        medicine: true,
      },
      orderBy: {
        medicine: {
          name: "asc",
        },
      },
    });
  }

  async findOne(id: number) {
    const inventory =
      await this.prisma.inventory.findUnique({
        where: {
          id,
        },
        include: {
          medicine: true,
          pharmacy: true,
        },
      });

    if (!inventory) {
      throw new NotFoundException(
        "Inventory item not found",
      );
    }

    return inventory;
  }

  async update(
    id: number,
    dto: UpdateInventoryDto,
  ) {
    const current = await this.findOne(id);

    await this.checkActiveSubscription(
      current.pharmacyId,
    );

    const quantity =
      dto.quantity ?? current.quantity;

    if (
      quantity >
      this.MAX_QUANTITY_PER_MEDICINE
    ) {
      throw new BadRequestException(
        `A maximum of ${this.MAX_QUANTITY_PER_MEDICINE} pieces is allowed for each medicine.`,
      );
    }

    const stockStatus =
      this.getStockStatus(quantity);

    return this.prisma.inventory.update({
      where: {
        id,
      },
      data: {
        ...dto,
        stockStatus,
      },
      include: {
        medicine: true,
        pharmacy: true,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.inventory.delete({
      where: {
        id,
      },
    });
  }
}