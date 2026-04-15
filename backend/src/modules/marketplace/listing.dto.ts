import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';
import { ListingCategory } from '@prisma/client';

export class CreateListingDto {
  @IsString()
  @Length(4, 120)
  title!: string;

  @IsString()
  @Length(20, 2000)
  description!: string;

  @IsEnum(ListingCategory)
  category!: ListingCategory;

  @IsInt()
  @Min(1)
  @Max(1_000_000)
  priceStars!: number;

  @IsInt()
  @Min(1)
  @Max(90)
  deliveryDays!: number;

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}

export class UpdateListingDto {
  @IsOptional()
  @IsString()
  @Length(4, 120)
  title?: string;

  @IsOptional()
  @IsString()
  @Length(20, 2000)
  description?: string;

  @IsOptional()
  @IsEnum(ListingCategory)
  category?: ListingCategory;

  @IsOptional()
  @IsInt()
  @Min(1)
  priceStars?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(90)
  deliveryDays?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  coverImage?: string;
}
