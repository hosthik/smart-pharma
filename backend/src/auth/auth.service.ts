import {
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";

import { PrismaService } from "../prisma/prisma.service.js";
import { LoginDto } from "./dto/login.dto.js";
import { RegisterPharmacyDto } from "./dto/register-pharmacy.dto.js";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // ==========================================
  // Register Pharmacy
  // ==========================================

  async registerPharmacy(
    dto: RegisterPharmacyDto,
  ) {
    // ------------------------------------------
    // Check owner email
    // ------------------------------------------

    const existingUser =
      await this.prisma.user.findUnique({
        where: {
          email: dto.email,
        },
      });

    if (existingUser) {
      throw new UnauthorizedException(
        "Email is already registered.",
      );
    }

    // ------------------------------------------
    // Check TIN
    // ------------------------------------------

    const existingTin =
      await this.prisma.pharmacy.findUnique({
        where: {
          tinNumber: dto.tinNumber,
        },
      });

    if (existingTin) {
      throw new UnauthorizedException(
        "This TIN number is already registered.",
      );
    }

    // ------------------------------------------
    // Hash password
    // ------------------------------------------

    const passwordHash =
      await bcrypt.hash(dto.password, 10);

    // ------------------------------------------
    // Create pharmacy + owner
    // ------------------------------------------

    const pharmacy =
      await this.prisma.pharmacy.create({
        data: {
          name: dto.pharmacyName,
          address: dto.address,
          phone: dto.phone,
          email: dto.pharmacyEmail,

          latitude: dto.latitude,
          longitude: dto.longitude,

          openingHours: dto.openingHours,

          // Business verification
          tinNumber: dto.tinNumber,

          businessRegistration:
            dto.businessRegistration,

          businessLicense:
            dto.businessLicense,

          pharmacyLicense:
            dto.pharmacyLicense,

          pharmacyPhoto:
            dto.pharmacyPhoto,

          // Owner verification
          ownerIdNumber:
            dto.ownerIdNumber,

          ownerIdDocument:
            dto.ownerIdDocument,

          // New pharmacies require admin review
          verificationStatus: "PENDING",

          users: {
            create: {
              name: dto.ownerName,
              email: dto.email,
              passwordHash,
              role: "PHARMACY_OWNER",
            },
          },
        },

        include: {
          users: true,
        },
      });

    // ------------------------------------------
    // Return registration result
    // ------------------------------------------

    return {
      message:
        "Pharmacy registration submitted successfully.",

      verificationStatus:
        pharmacy.verificationStatus,

      pharmacy: {
        id: pharmacy.id,
        name: pharmacy.name,
        address: pharmacy.address,
        phone: pharmacy.phone,
        email: pharmacy.email,
        openingHours:
          pharmacy.openingHours,

        latitude: pharmacy.latitude,
        longitude: pharmacy.longitude,

        tinNumber: pharmacy.tinNumber,

        businessRegistration:
          pharmacy.businessRegistration,

        businessLicense:
          pharmacy.businessLicense,

        pharmacyLicense:
          pharmacy.pharmacyLicense,

        pharmacyPhoto:
          pharmacy.pharmacyPhoto,

        verificationStatus:
          pharmacy.verificationStatus,
      },

      owner: {
        id: pharmacy.users[0].id,
        name: pharmacy.users[0].name,
        email: pharmacy.users[0].email,

        ownerIdNumber:
          pharmacy.ownerIdNumber,

        ownerIdDocument:
          pharmacy.ownerIdDocument,
      },
    };
  }

  // ==========================================
  // Login
  // ==========================================

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // ------------------------------------------
    // Find user
    // ------------------------------------------

    const user =
      await this.prisma.user.findUnique({
        where: {
          email,
        },

        include: {
          pharmacy: true,
        },
      });

    // ------------------------------------------
    // Validate user
    // ------------------------------------------

    if (!user) {
      throw new UnauthorizedException(
        "Invalid email or password.",
      );
    }

    // ------------------------------------------
    // Validate password
    // ------------------------------------------

    const passwordValid =
      await bcrypt.compare(
        password,
        user.passwordHash,
      );

    if (!passwordValid) {
      throw new UnauthorizedException(
        "Invalid email or password.",
      );
    }

    // ==========================================
    // ADMIN LOGIN
    // ==========================================

    if (user.role === "ADMIN") {
      // Admin accounts do not require a pharmacy.
      const payload = {
        sub: user.id,
        email: user.email,
        role: user.role,
        pharmacyId: null,
      };

      const accessToken =
        await this.jwtService.signAsync(
          payload,
        );

      return {
        message: "Admin login successful.",

        accessToken,

        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          pharmacyId: null,
          pharmacyName: null,
        },

        pharmacy: null,
      };
    }

    // ==========================================
    // PHARMACY USER LOGIN
    // ==========================================

    if (!user.pharmacy) {
      throw new UnauthorizedException(
        "This account is not connected to a pharmacy.",
      );
    }

    // ------------------------------------------
    // Pharmacy verification status
    // ------------------------------------------

    const pharmacy =
      user.pharmacy;

    // ------------------------------------------
    // Create pharmacy-user JWT
    // ------------------------------------------

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      pharmacyId: pharmacy.id,
    };

    const accessToken =
      await this.jwtService.signAsync(
        payload,
      );

    // ------------------------------------------
    // Return pharmacy-user login
    // ------------------------------------------

    return {
      message: "Login successful.",

      accessToken,

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        pharmacyId: pharmacy.id,
        pharmacyName:
          pharmacy.name,
      },

      pharmacy: {
        id: pharmacy.id,
        name: pharmacy.name,
        verificationStatus:
          pharmacy.verificationStatus,
      },
    };
  }
}