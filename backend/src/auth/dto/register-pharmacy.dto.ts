import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterPharmacyDto {
  @IsString()
  pharmacyName: string;

  @IsString()
  address: string;

  @IsString()
  phone: string;

  @IsString()
  ownerName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}