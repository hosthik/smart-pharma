import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service.js";
import { CreateSaleDto } from "./dto/create-sale.dto.js";

@Injectable()
export class SalesService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async createSale(dto: CreateSaleDto) {
    if (dto.items.length === 0) {
      throw new BadRequestException(
        "A sale must contain at least one medicine.",
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
        "Pharmacy not found.",
      );
    }

    /*
     * Check subscription.
     */
    const subscription =
      await this.prisma.subscription.findUnique({
        where: {
          pharmacyId: dto.pharmacyId,
        },
      });

    const now = new Date();

    if (
      !subscription ||
      subscription.status !== "ACTIVE" ||
      !subscription.renewalDate ||
      subscription.renewalDate <= now
    ) {
      if (
        subscription &&
        subscription.status === "ACTIVE" &&
        subscription.renewalDate &&
        subscription.renewalDate <= now
      ) {
        await this.prisma.subscription.update({
          where: {
            id: subscription.id,
          },
          data: {
            status: "EXPIRED",
          },
        });
      }

      throw new BadRequestException(
        "An active subscription is required to make sales.",
      );
    }

    /*
     * Prevent duplicate medicines in one sale.
     */
    const medicineIds =
      dto.items.map(
        (item) => item.medicineId,
      );

    if (
      new Set(medicineIds).size !==
      medicineIds.length
    ) {
      throw new BadRequestException(
        "A medicine cannot appear more than once in the same sale.",
      );
    }

    return this.prisma.$transaction(
      async (tx) => {
        const saleItems: Array<{
          medicineId: number;
          quantity: number;
          unitPrice: number;
          totalPrice: number;
        }> = [];

        let totalAmount = 0;

        /*
         * Validate every medicine and calculate
         * the price using the database inventory.
         */
        for (const item of dto.items) {
          const inventory =
            await tx.inventory.findUnique({
              where: {
                pharmacyId_medicineId: {
                  pharmacyId: dto.pharmacyId,
                  medicineId: item.medicineId,
                },
              },
              include: {
                medicine: true,
              },
            });

          if (!inventory) {
            throw new NotFoundException(
              `Medicine ID ${item.medicineId} is not in this pharmacy's inventory.`,
            );
          }

          if (inventory.quantity <= 0) {
            throw new BadRequestException(
              `${inventory.medicine.name} is out of stock.`,
            );
          }

          if (
            item.quantity >
            inventory.quantity
          ) {
            throw new BadRequestException(
              `Only ${inventory.quantity} unit(s) of ${inventory.medicine.name} are available.`,
            );
          }

          const totalPrice =
            inventory.price *
            item.quantity;

          totalAmount += totalPrice;

          saleItems.push({
            medicineId: item.medicineId,
            quantity: item.quantity,
            unitPrice: inventory.price,
            totalPrice,
          });
        }

        /*
         * Create the sale and sale items.
         */
        const sale =
          await tx.sale.create({
            data: {
              pharmacyId: dto.pharmacyId,
              totalAmount,
              items: {
                create: saleItems,
              },
            },
            include: {
              pharmacy: true,
              items: {
                include: {
                  medicine: true,
                },
              },
            },
          });

        /*
         * Reduce inventory.
         */
        for (const item of dto.items) {
          const inventory =
            await tx.inventory.findUnique({
              where: {
                pharmacyId_medicineId: {
                  pharmacyId: dto.pharmacyId,
                  medicineId: item.medicineId,
                },
              },
            });

          if (!inventory) {
            throw new NotFoundException(
              "Inventory item not found.",
            );
          }

          const newQuantity =
            inventory.quantity -
            item.quantity;

          let stockStatus:
            | "AVAILABLE"
            | "LOW_STOCK"
            | "OUT_OF_STOCK";

          if (newQuantity <= 0) {
            stockStatus =
              "OUT_OF_STOCK";
          } else if (newQuantity <= 3) {
            stockStatus =
              "LOW_STOCK";
          } else {
            stockStatus =
              "AVAILABLE";
          }

          await tx.inventory.update({
            where: {
              id: inventory.id,
            },
            data: {
              quantity: newQuantity,
              stockStatus,
            },
          });
        }

        return {
          success: true,
          message:
            "Sale completed successfully.",
          sale,
        };
      },
    );
  }

  async getSalesByPharmacy(
    pharmacyId: number,
  ) {
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

    return this.prisma.sale.findMany({
      where: {
        pharmacyId,
      },
      include: {
        items: {
          include: {
            medicine: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async getSale(id: number) {
    const sale =
      await this.prisma.sale.findUnique({
        where: {
          id,
        },
        include: {
          pharmacy: true,
          items: {
            include: {
              medicine: true,
            },
          },
        },
      });

    if (!sale) {
      throw new NotFoundException(
        "Sale not found.",
      );
    }

    return sale;
  }
}