import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';

export class SubscribePlusDto {
  @IsString()
  planId!: string;

  @IsEnum(['STARS', 'TON'])
  currency!: 'STARS' | 'TON';
}

export class CreatePlusPlanDto {
  @IsString() @Length(1, 40)
  name!: string;

  @IsInt() @Min(1)
  durationDays!: number;

  @IsOptional() @IsInt() @Min(1)
  priceStars?: number;

  @IsOptional() @IsNumber() @Min(0.01)
  priceTon?: number;

  @IsOptional() @IsNumber() @Min(1)
  priceFiat?: number;
}

export class UpdatePlusPlanDto {
  @IsOptional() @IsString() @Length(1, 40)
  name?: string;

  @IsOptional() @IsInt() @Min(1)
  durationDays?: number;

  @IsOptional() @IsInt() @Min(1)
  priceStars?: number;

  @IsOptional() @IsNumber() @Min(0.01)
  priceTon?: number;

  @IsOptional() @IsNumber() @Min(1)
  priceFiat?: number;

  @IsOptional() @IsBoolean()
  isActive?: boolean;
}
