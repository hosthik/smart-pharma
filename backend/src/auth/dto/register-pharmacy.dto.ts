
import { Type } from "class-transformer";
import {
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";

export class RegisterPharmacyDto {
  // =========================
  // Pharmacy Information
  // =========================

  @IsString()
  pharmacyName: string;

  @IsString()
  address: string;

  @IsString()
  phone: string;

  @IsOptional()
  @IsEmail()
  pharmacyEmail?: string;

  @IsOptional()
  @IsString()
  openingHours?: string;

  // =========================
  // Pharmacy Location
  // =========================

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;

  // =========================
  // Business Verification
  // =========================

  @IsString()
  tinNumber: string;

  @IsOptional()
  @IsString()
  businessRegistration?: string;

  @IsOptional()
  @IsString()
  businessLicense?: string;

  @IsOptional()
  @IsString()
  pharmacyLicense?: string;

  @IsOptional()
  @IsString()
  pharmacyPhoto?: string;

  // =========================
  // Owner Identity
  // =========================

  @IsString()
  ownerName: string;

  @IsString()
  ownerIdNumber: string;

  @IsOptional()
  @IsString()
  ownerIdDocument?: string;

  // =========================
  // Owner Account
  // =========================

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}