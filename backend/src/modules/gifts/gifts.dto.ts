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

export type GiftRarityDto = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';

export class BuyGiftDto {
  @IsEnum(['STARS', 'TON'])
  currency!: 'STARS' | 'TON';
}

export class CreateGiftDto {
  @IsString() @Length(1, 80)
  name!: string;

  @IsString() @Length(1, 500)
  description!: string;

  @IsString() @Length(1, 500)
  imageUrl!: string;

  @IsEnum(['COMMON', 'RARE', 'EPIC', 'LEGENDARY'])
  rarity!: GiftRarityDto;

  @IsOptional() @IsInt() @Min(1)
  priceStars?: number;

  @IsOptional() @IsNumber() @Min(0.01)
  priceTon?: number;

  @IsOptional() @IsInt() @Min(1)
  editionSize?: number;
}

export class UpdateGiftDto {
  @IsOptional() @IsString() @Length(1, 80)
  name?: string;

  @IsOptional() @IsString() @Length(1, 500)
  description?: string;

  @IsOptional() @IsString() @Length(1, 500)
  imageUrl?: string;

  @IsOptional() @IsInt() @Min(1)
  priceStars?: number;

  @IsOptional() @IsNumber() @Min(0.01)
  priceTon?: number;

  @IsOptional() @IsBoolean()
  isActive?: boolean;
}
