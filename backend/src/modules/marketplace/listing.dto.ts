import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  Min,
  MaxLength,
} from 'class-validator';

export class CreateListingDto {
  @IsString()
  @MaxLength(200)
  title!: string;

  @IsString()
  @MaxLength(2000)
  description!: string;

  @IsNumber()
  @Min(1)
  price!: number;

  @IsString()
  category!: string;

  @IsArray()
  @IsString({ each: true })
  images!: string[];
}

export class UpdateListingDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  price?: number;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}

export class ListingFilterDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  category?: string;
}
