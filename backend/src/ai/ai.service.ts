
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";

import { GoogleGenAI } from "@google/genai";

import { PrismaService } from "../prisma/prisma.service.js";
import { ChatDto } from "./dto/chat.dto.js";

@Injectable()
export class AiService {
  private readonly ai: GoogleGenAI;

  private readonly model = "gemini-3.6-flash";

  private readonly systemInstruction = `
You are SmartPharma AI Assistant.

You are a pharmacy and general health-information assistant.
You are NOT a doctor, pharmacist, nurse, or emergency medical service.

Your purpose is to provide clear, useful, general information about:

- medicines
- common medicine uses
- generic and brand medicine terminology
- dosage forms such as tablets, capsules, syrups, creams, and injections
- general medicine precautions
- common side effects
- general pharmacy information
- general health education
- SmartPharma website features

MEDICAL SAFETY RULES:

1. Do not diagnose users.
Never tell a user that they definitely have a disease or medical condition.

2. Do not prescribe medicines.
Do not choose prescription medicines for a user.

3. Do not tell users to start, stop, increase, decrease, or change prescription medicines.

4. Do not create personalized treatment plans.

5. Do not pretend to be a healthcare professional.

6. When a user describes personal symptoms, provide only general educational information and explain that a qualified healthcare professional should evaluate them when personalized medical advice is needed.

7. If symptoms could represent an emergency or serious medical problem, recommend urgent professional medical care or local emergency services.

8. Do not encourage users to delay necessary medical care.

9. Do not request unnecessary sensitive medical information.

10. Do not present uncertain medical information as certain.

11. When discussing dosage, prefer general information from medicine labels or healthcare professionals. Do not calculate personalized doses.

12. If a user asks for a diagnosis, politely explain that you cannot diagnose them and provide general educational information instead.

13. If a user asks you to prescribe medicine, politely explain that you cannot prescribe medicine.

14. When explaining a medicine, where appropriate describe:
- what it is
- its common uses
- common dosage forms
- common side effects
- general precautions
- important situations where professional advice is appropriate

15. Keep responses clear, friendly, and reasonably concise.

16. Do not repeat a long medical disclaimer in every response. Mention your limitations naturally when relevant.

SMARTPHARMA IDENTITY:

You are part of SmartPharma.

Your name is "SmartPharma AI Assistant".

If asked who you are, explain that you are SmartPharma's AI-powered pharmacy information assistant.

Do not claim that SmartPharma provides medical diagnosis or prescriptions.

DATABASE SEARCH:

SmartPharma has a real medicine and pharmacy database.

When the application provides database search results, treat those results as authoritative for:
- medicine availability
- pharmacy names
- pharmacy addresses
- pharmacy phone numbers
- inventory quantities
- medicine prices
- stock status

Never invent pharmacy inventory or availability.

If the database does not contain a medicine or pharmacy, clearly say that it was not found in the SmartPharma database.

If you do not know something or are uncertain, say so instead of inventing information.

Be friendly, respectful, and helpful.
`;

  constructor(private readonly prisma: PrismaService) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY is not defined in the environment.",
      );
    }

    this.ai = new GoogleGenAI({
      apiKey,
    });
  }

  async chat(chatDto: ChatDto) {
    const message = chatDto.message?.trim();

    if (!message) {
      throw new BadRequestException("Message cannot be empty.");
    }

    try {
      /*
       * ---------------------------------------------------------
       * SMARTPHARMA DATABASE SEARCH
       * ---------------------------------------------------------
       *
       * We first check whether the user is asking where a medicine
       * is available. These requests should use our real database
       * instead of relying on Gemini's knowledge.
       */

      const searchTerm = this.extractMedicineSearchTerm(message);

      if (searchTerm) {
        return await this.searchMedicineAvailability(searchTerm);
      }

      /*
       * ---------------------------------------------------------
       * GENERAL AI RESPONSE
       * ---------------------------------------------------------
       */

      const contents = [
        ...(chatDto.history ?? []).map((item) => ({
          role: item.role === "assistant" ? "model" : "user",
          parts: [
            {
              text: item.content,
            },
          ],
        })),

        {
          role: "user" as const,
          parts: [
            {
              text: message,
            },
          ],
        },
      ];

      const response = await this.ai.models.generateContent({
        model: this.model,
        contents,
        config: {
          systemInstruction: this.systemInstruction,
          maxOutputTokens: 1000,
          temperature: 0.4,
        },
      });

      const text = response.text?.trim();

      if (!text) {
        throw new InternalServerErrorException(
          "The AI assistant did not return a response.",
        );
      }

      return {
        success: true,
        message: text,
      };
    } catch (error) {
      console.error(
        "========== SMARTPHARMA AI ERROR ==========",
      );

      console.error(error);

      console.error(
        "==========================================",
      );

      if (error instanceof BadRequestException) {
        throw error;
      }

      if (error instanceof InternalServerErrorException) {
        throw error;
      }

      throw new InternalServerErrorException(
        "The AI assistant is temporarily unavailable. Please try again later.",
      );
    }
  }

  /*
   * ---------------------------------------------------------
   * DETECT MEDICINE SEARCH REQUESTS
   * ---------------------------------------------------------
   *
   * Examples:
   *
   * "Where can I find paracetamol?"
   * "Which pharmacies have ibuprofen?"
   * "Do you have amoxicillin?"
   * "Find pharmacies with aspirin"
   * "Is paracetamol available?"
   */

  private extractMedicineSearchTerm(message: string): string | null {
    const normalized = message
      .toLowerCase()
      .replace(/[?!.,]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const searchPatterns = [
      /where can i find (.+)/i,
      /where can i get (.+)/i,
      /where do i find (.+)/i,
      /which pharmacies have (.+)/i,
      /which pharmacy has (.+)/i,
      /what pharmacies have (.+)/i,
      /what pharmacy has (.+)/i,
      /find pharmacies with (.+)/i,
      /find a pharmacy with (.+)/i,
      /find (.+) in pharmacies/i,
      /do you have (.+)/i,
      /does any pharmacy have (.+)/i,
      /is (.+) available/i,
      /is there (.+) available/i,
      /where is (.+) available/i,
      /pharmacies with (.+)/i,
      /pharmacy with (.+)/i,
      /available pharmacies for (.+)/i,
    ];

    for (const pattern of searchPatterns) {
      const match = normalized.match(pattern);

      if (match?.[1]) {
        const term = match[1]
          .trim()
          .replace(
            /\b(in my area|near me|nearby|around me|please|for me)\b/gi,
            "",
          )
          .trim();

        if (term.length >= 2 && term.length <= 100) {
          return term;
        }
      }
    }

    /*
     * Also support short natural-language requests such as:
     *
     * "paracetamol availability"
     * "paracetamol stock"
     * "paracetamol pharmacies"
     */

    const shortSearchPattern =
      /^(.+?)\s+(availability|stock|pharmacies|pharmacy)$/i;

    const shortMatch = normalized.match(shortSearchPattern);

    if (shortMatch?.[1]) {
      const term = shortMatch[1].trim();

      if (term.length >= 2 && term.length <= 100) {
        return term;
      }
    }

    return null;
  }

  /*
   * ---------------------------------------------------------
   * SEARCH SMARTPHARMA DATABASE
   * ---------------------------------------------------------
   */

  private async searchMedicineAvailability(searchTerm: string) {
    const medicines = await this.prisma.medicine.findMany({
      where: {
        OR: [
          {
            name: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
          {
            genericName: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
        ],
      },
      include: {
        inventory: {
          where: {
            quantity: {
              gt: 0,
            },
            stockStatus: {
              in: ["AVAILABLE", "LOW_STOCK"],
            },
            pharmacy: {
              verificationStatus: "APPROVED",
            },
          },
          include: {
            pharmacy: true,
          },
          orderBy: {
            price: "asc",
          },
        },
      },
    });

    /*
     * Record the medicine search for SmartPharma analytics.
     */

    const firstMedicine = medicines[0];

    await this.prisma.medicineSearch.create({
      data: {
        query: searchTerm,
        medicineId: firstMedicine?.id ?? null,
      },
    });

    /*
     * Medicine does not exist.
     */

    if (medicines.length === 0) {
      return {
        success: true,
        type: "MEDICINE_SEARCH",
        message: `I couldn't find "${searchTerm}" in the SmartPharma medicine database.`,
        data: {
          searchTerm,
          medicines: [],
          pharmacies: [],
        },
      };
    }

    /*
     * Build a clean list of pharmacies.
     */

    const pharmacies: Array<{
      pharmacyId: number;
      pharmacyName: string;
      address: string;
      phone: string | null;
      latitude: number | null;
      longitude: number | null;
      medicineId: number;
      medicineName: string;
      genericName: string | null;
      category: string | null;
      quantity: number;
      price: number;
      stockStatus: string;
      section: string | null;
      shelf: string | null;
      row: string | null;
    }> = [];

    for (const medicine of medicines) {
      for (const item of medicine.inventory) {
        pharmacies.push({
          pharmacyId: item.pharmacy.id,
          pharmacyName: item.pharmacy.name,
          address: item.pharmacy.address,
          phone: item.pharmacy.phone,
          latitude: item.pharmacy.latitude,
          longitude: item.pharmacy.longitude,
          medicineId: medicine.id,
          medicineName: medicine.name,
          genericName: medicine.genericName,
          category: medicine.category,
          quantity: item.quantity,
          price: item.price,
          stockStatus: item.stockStatus,
          section: item.section,
          shelf: item.shelf,
          row: item.row,
        });
      }
    }

    /*
     * Medicine exists but no approved pharmacy has stock.
     */

    if (pharmacies.length === 0) {
      const medicineNames = medicines
        .map((medicine) => medicine.name)
        .join(", ");

      return {
        success: true,
        type: "MEDICINE_SEARCH",
        message:
          `I found ${medicineNames} in the SmartPharma database, ` +
          `but there are currently no approved pharmacies with available stock.`,
        data: {
          searchTerm,
          medicines: medicines.map((medicine) => ({
            id: medicine.id,
            name: medicine.name,
            genericName: medicine.genericName,
            category: medicine.category,
          })),
          pharmacies: [],
        },
      };
    }

    /*
     * Human-readable response.
     */

    const pharmacyCount = pharmacies.length;

    const pharmacyLines = pharmacies
      .slice(0, 10)
      .map((item) => {
        const stockLabel =
          item.stockStatus === "LOW_STOCK"
            ? "Low stock"
            : "Available";

        return (
          `• ${item.pharmacyName} — ${item.address}. ` +
          `${item.medicineName}: ${stockLabel}, ` +
          `quantity ${item.quantity}, ` +
          `price ${item.price.toFixed(2)}.`
        );
      })
      .join("\n");

    const additionalText =
      pharmacyCount > 10
        ? `\n\nI found ${pharmacyCount} matching pharmacy inventory records. Showing the first 10.`
        : "";

    return {
      success: true,
      type: "MEDICINE_SEARCH",
      message:
        `I found ${pharmacyCount} pharmacy inventory record` +
        `${pharmacyCount === 1 ? "" : "s"} for "${searchTerm}":\n\n` +
        pharmacyLines +
        additionalText,
      data: {
        searchTerm,
        medicines: medicines.map((medicine) => ({
          id: medicine.id,
          name: medicine.name,
          genericName: medicine.genericName,
          category: medicine.category,
        })),
        pharmacies,
      },
    };
  }
}
