import {
  IsString,
  IsOptional,
  IsIn,
  IsNumber,
  IsInt,
  Min,
  MaxLength,
  IsBoolean,
  IsDateString,
} from 'class-validator';

export class TaskFilterDto {
  @IsOptional()
  @IsIn(['survey', 'review', 'test', 'subscribe'])
  category?: string;

  @IsOptional()
  @IsIn(['PENDING', 'ACTIVE', 'SUBMITTED', 'COMPLETED', 'REJECTED'])
  status?: string;
}

export class CompleteTaskDto {
  @IsString()
  proof!: string;
}

export class CreateTaskDto {
  @IsString()
  @MaxLength(120)
  title!: string;

  @IsString()
  @MaxLength(2000)
  description!: string;

  @IsIn(['survey', 'review', 'test', 'subscribe'])
  category!: string;

  @IsOptional()
  @IsIn(['MANUAL', 'AUTO_CONNECT_WALLET', 'AUTO_FIRST_LISTING', 'AUTO_FIRST_PURCHASE'])
  verificationType?: string;

  @IsNumber()
  @Min(0.01)
  reward!: number;

  @IsInt()
  @Min(1)
  timeMinutes!: number;

  @IsString()
  @MaxLength(80)
  brand!: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  brandLogo?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  totalSlots?: number;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsIn(['survey', 'review', 'test', 'subscribe'])
  category?: string;

  @IsOptional()
  @IsIn(['MANUAL', 'AUTO_CONNECT_WALLET', 'AUTO_FIRST_LISTING', 'AUTO_FIRST_PURCHASE'])
  verificationType?: string;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  reward?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  timeMinutes?: number;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  brand?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  brandLogo?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  totalSlots?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  filledSlots?: number;

  @IsOptional()
  @IsDateString()
  expiresAt?: string | null;
}
