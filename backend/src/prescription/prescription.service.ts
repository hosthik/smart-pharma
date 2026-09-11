import { Injectable } from "@nestjs/common";
import { createWorker } from "tesseract.js";

import { PrismaService } from "../prisma/prisma.service.js";

@Injectable()
export class PrescriptionService {
  constructor(private readonly prisma: PrismaService) {}

  async scanPrescription(file: Express.Multer.File) {
    if (!file) {
      throw new Error("No prescription image was uploaded.");
    }

    const worker = await createWorker("eng");

    try {
      const {
        data: { text },
      } = await worker.recognize(file.buffer);

      const cleanedText = this.cleanOcrText(text);
      const matchedMedicines =
        await this.findMedicinesInDatabase(cleanedText);

      return {
        success: true,
        message: "Prescription scanned successfully.",
        filename: file.originalname,
        text: cleanedText,
        medicines: matchedMedicines,
      };
    } finally {
      await worker.terminate();
    }
  }

  private cleanOcrText(text: string): string {
    return text
      .replace(/\r/g, "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .join("\n");
  }

  private async findMedicinesInDatabase(text: string) {
    if (!text.trim()) {
      return [];
    }

    const now = new Date();

    const medicines = await this.prisma.medicine.findMany({
      select: {
        id: true,
        name: true,
        genericName: true,
        category: true,
        inventory: {
          where: {
            quantity: {
              gt: 0,
            },
            pharmacy: {
              verificationStatus: "APPROVED",
              subscription: {
                is: {
                  status: "ACTIVE",
                  OR: [
                    {
                      renewalDate: null,
                    },
                    {
                      renewalDate: {
                        gt: now,
                      },
                    },
                  ],
                },
              },
            },
          },
          select: {
            pharmacyId: true,
            quantity: true,
            price: true,
            stockStatus: true,
            section: true,
            shelf: true,
            row: true,
            pharmacy: {
              select: {
                id: true,
                name: true,
                address: true,
                phone: true,
              },
            },
          },
          orderBy: {
            price: "asc",
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    const normalizedOcrText = this.normalizeText(text);

    const matches = medicines.filter((medicine) => {
      const medicineName = this.normalizeText(medicine.name);

      const genericName = medicine.genericName
        ? this.normalizeText(medicine.genericName)
        : "";

      return (
        this.isMedicineMatch(normalizedOcrText, medicineName) ||
        (genericName.length >= 4 &&
          this.isMedicineMatch(normalizedOcrText, genericName))
      );
    });

    return matches.map((medicine) => ({
      id: medicine.id,
      name: medicine.name,
      genericName: medicine.genericName,
      category: medicine.category,
      pharmacies: medicine.inventory.map((inventory) => ({
        pharmacyId: inventory.pharmacyId,
        pharmacyName: inventory.pharmacy.name,
        address: inventory.pharmacy.address,
        phone: inventory.pharmacy.phone,
        quantity: inventory.quantity,
        price: inventory.price,
        stockStatus: inventory.stockStatus,
        section: inventory.section,
        shelf: inventory.shelf,
        row: inventory.row,
      })),
    }));
  }

  private isMedicineMatch(
    ocrText: string,
    medicineName: string,
  ): boolean {
    if (!medicineName || medicineName.length < 3) {
      return false;
    }

    // Exact full-name match.
    if (ocrText.includes(medicineName)) {
      return true;
    }

    // Check individual words for multi-word medicine names.
    const medicineWords = medicineName
      .split(" ")
      .filter((word) => word.length >= 3);

    if (medicineWords.length > 1) {
      const matchedWords = medicineWords.filter((word) =>
        this.findSimilarWord(ocrText, word),
      );

      if (matchedWords.length === medicineWords.length) {
        return true;
      }
    }

    // Fuzzy matching for common OCR mistakes.
    const ocrWords = ocrText
      .split(" ")
      .map((word) => word.trim())
      .filter((word) => word.length >= 3);

    const medicineWordsForFuzzyMatch = medicineName
      .split(" ")
      .map((word) => word.trim())
      .filter((word) => word.length >= 3);

    return medicineWordsForFuzzyMatch.some((medicineWord) =>
      ocrWords.some(
        (ocrWord) =>
          this.calculateSimilarity(ocrWord, medicineWord) >= 0.8,
      ),
    );
  }

  private findSimilarWord(
    text: string,
    targetWord: string,
  ): boolean {
    const words = text
      .split(" ")
      .map((word) => word.trim())
      .filter((word) => word.length >= 3);

    return words.some(
      (word) =>
        word === targetWord ||
        this.calculateSimilarity(word, targetWord) >= 0.8,
    );
  }

  private calculateSimilarity(
    first: string,
    second: string,
  ): number {
    if (first === second) {
      return 1;
    }

    if (!first || !second) {
      return 0;
    }

    const distance = this.levenshteinDistance(first, second);
    const maxLength = Math.max(first.length, second.length);

    return 1 - distance / maxLength;
  }

  private levenshteinDistance(
    first: string,
    second: string,
  ): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= second.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= first.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= second.length; i++) {
      for (let j = 1; j <= first.length; j++) {
        if (second.charAt(i - 1) === first.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j - 1] + 1,
          );
        }
      }
    }

    return matrix[second.length][first.length];
  }

  private normalizeText(value: string): string {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }
}