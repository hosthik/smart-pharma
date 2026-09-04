import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import fs from "node:fs/promises";
import path from "node:path";

import { PrismaService } from "../prisma/prisma.service.js";

type PharmacyDocuments = {
  businessRegistration: string | null;
  businessLicense: string | null;
  pharmacyLicense: string | null;
  pharmacyPhoto: string | null;
  ownerIdDocument: string | null;
};

export type DocumentResult = {
  path: string;
  filename: string;
  mimeType: string;
};

@Injectable()
export class DocumentService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getDocument(
    pharmacyId: number,
    documentType: string,
  ): Promise<DocumentResult> {
    const pharmacy =
      await this.prisma.pharmacy.findUnique({
        where: {
          id: pharmacyId,
        },

        select: {
          businessRegistration: true,
          businessLicense: true,
          pharmacyLicense: true,
          pharmacyPhoto: true,
          ownerIdDocument: true,
        },
      });

    if (!pharmacy) {
      throw new NotFoundException(
        "Pharmacy not found.",
      );
    }

    const document =
      this.getDocumentMetadata(
        pharmacy,
        documentType,
      );

    if (!document) {
      throw new NotFoundException(
        "Requested document was not submitted.",
      );
    }

    const uploadsDirectory =
      path.resolve(
        process.cwd(),
        "uploads",
      );

    const absolutePath =
      path.resolve(
        uploadsDirectory,
        document.filename,
      );

    const uploadsPrefix =
      uploadsDirectory.endsWith(
        path.sep,
      )
        ? uploadsDirectory
        : `${uploadsDirectory}${path.sep}`;

    /*
     * Prevent path traversal.
     */
    if (
      !absolutePath.startsWith(
        uploadsPrefix,
      )
    ) {
      throw new BadRequestException(
        "Invalid document path.",
      );
    }

    try {
      await fs.access(
        absolutePath,
      );
    } catch {
      throw new NotFoundException(
        "Document file could not be found.",
      );
    }

    return {
      path: absolutePath,

      filename:
        path.basename(
          document.filename,
        ),

      mimeType:
        document.mimeType,
    };
  }

  private getDocumentMetadata(
    pharmacy: PharmacyDocuments,
    documentType: string,
  ): {
    filename: string;
    mimeType: string;
  } | null {
    let filename:
      | string
      | null = null;

    switch (
      documentType
    ) {
      case "business-registration":
        filename =
          pharmacy.businessRegistration;
        break;

      case "business-license":
        filename =
          pharmacy.businessLicense;
        break;

      case "pharmacy-license":
        filename =
          pharmacy.pharmacyLicense;
        break;

      case "owner-id":
        filename =
          pharmacy.ownerIdDocument;
        break;

      case "pharmacy-photo":
        filename =
          pharmacy.pharmacyPhoto;
        break;

      default:
        throw new BadRequestException(
          "Unsupported document type.",
        );
    }

    if (!filename) {
      return null;
    }

    return {
      filename,

      mimeType:
        this.getMimeType(
          filename,
        ),
    };
  }

  private getMimeType(
    filename: string,
  ): string {
    const extension =
      path.extname(
        filename,
      ).toLowerCase();

    switch (
      extension
    ) {
      case ".pdf":
        return "application/pdf";

      case ".jpg":
      case ".jpeg":
        return "image/jpeg";

      case ".png":
        return "image/png";

      default:
        return "application/octet-stream";
    }
  }
}