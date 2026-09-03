import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateMedicineDto } from './dto/create-medicine.dto.js';
import { UpdateMedicineDto } from './dto/update-medicine.dto.js';

@Injectable()
export class MedicinesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMedicineDto) {
    return this.prisma.medicine.create({
      data: {
        name: dto.name,
        genericName: dto.genericName,
        category: dto.category,
      },
    });
  }

  async findAll() {
    return this.prisma.medicine.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: number) {
    const medicine = await this.prisma.medicine.findUnique({
      where: { id },
    });

    if (!medicine) {
      throw new NotFoundException('Medicine not found');
    }

    return medicine;
  }

  async update(id: number, dto: UpdateMedicineDto) {
    await this.findOne(id);

    return this.prisma.medicine.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.medicine.delete({
      where: { id },
    });
  }

  async searchMedicines(query: string) {
    const search = query?.trim();

    if (!search) {
      return [];
    }

    const medicines = await this.prisma.medicine.findMany({
      where: {
        OR: [
          {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            genericName: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ],
      },
      include: {
        inventory: {
          include: {
            pharmacy: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return medicines.map((medicine) => ({
      id: medicine.id,
      name: medicine.name,
      genericName: medicine.genericName,
      category: medicine.category,
      pharmacies: medicine.inventory.map((item) => ({
        pharmacyId: item.pharmacyId,
        pharmacyName: item.pharmacy.name,
        address: item.pharmacy.address,
        phone: item.pharmacy.phone,
        latitude: item.pharmacy.latitude,
        longitude: item.pharmacy.longitude,
        quantity: item.quantity,
        price: item.price,
        stockStatus: item.stockStatus,
        section: item.section,
        shelf: item.shelf,
        row: item.row,
        updatedAt: item.updatedAt,
      })),
    }));
  }
}