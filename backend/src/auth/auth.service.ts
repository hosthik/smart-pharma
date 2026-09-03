import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterPharmacyDto } from './dto/register-pharmacy.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async registerPharmacy(dto: RegisterPharmacyDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (existingUser) {
      throw new UnauthorizedException(
        'Email is already registered',
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const pharmacy = await this.prisma.pharmacy.create({
      data: {
        name: dto.pharmacyName,
        address: dto.address,
        phone: dto.phone,

        users: {
          create: {
            name: dto.ownerName,
            email: dto.email,
            passwordHash,
            role: 'PHARMACY_OWNER',
          },
        },
      },
      include: {
        users: true,
      },
    });

    return {
      message: 'Pharmacy registered successfully',
      pharmacy: {
        id: pharmacy.id,
        name: pharmacy.name,
        address: pharmacy.address,
      },
      owner: {
        id: pharmacy.users[0].id,
        name: pharmacy.users[0].name,
        email: pharmacy.users[0].email,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        pharmacy: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException(
        'Invalid email or password',
      );
    }

    const passwordValid = await bcrypt.compare(
      password,
      user.passwordHash,
    );

    if (!passwordValid) {
      throw new UnauthorizedException(
        'Invalid email or password',
      );
    }

    if (!user.pharmacy) {
      throw new UnauthorizedException(
        'This account is not connected to a pharmacy',
      );
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      pharmacyId: user.pharmacy.id,
    };

    return {
      message: 'Login successful',
      accessToken: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        pharmacyId: user.pharmacy.id,
        pharmacyName: user.pharmacy.name,
      },
    };
  }
}