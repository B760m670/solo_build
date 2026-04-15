import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';

export class BuyThemeDto {
  @IsEnum(['STARS', 'TON'])
  currency!: 'STARS' | 'TON';
}

export class CreateThemeDto {
  @IsString() @Length(1, 80)
  name!: string;

  @IsOptional() @IsString() @Length(0, 500)
  description?: string;

  @IsOptional() @IsString() @Length(0, 500)
  previewUrl?: string;

  @IsObject()
  palette!: Record<string, string>;

  @IsOptional() @IsInt() @Min(1)
  priceStars?: number;

  @IsOptional() @IsNumber() @Min(0.01)
  priceTon?: number;

  @IsOptional() @IsBoolean()
  plusOnly?: boolean;
}

export class UpdateThemeDto {
  @IsOptional() @IsString() @Length(1, 80)
  name?: string;

  @IsOptional() @IsString() @Length(0, 500)
  description?: string;

  @IsOptional() @IsString() @Length(0, 500)
  previewUrl?: string;

  @IsOptional() @IsObject()
  palette?: Record<string, string>;

  @IsOptional() @IsInt() @Min(1)
  priceStars?: number;

  @IsOptional() @IsNumber() @Min(0.01)
  priceTon?: number;

  @IsOptional() @IsBoolean()
  plusOnly?: boolean;

  @IsOptional() @IsBoolean()
  isActive?: boolean;
}

export class ActivateThemeDto {
  @IsOptional() @IsString()
  themeId?: string | null;
}
