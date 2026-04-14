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
  IsArray,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class VerificationPolicyDto {
  @IsIn(['TEXT', 'LINK', 'SCREENSHOT_URL', 'JSON'])
  proofType!: 'TEXT' | 'LINK' | 'SCREENSHOT_URL' | 'JSON';

  @IsArray()
  @IsString({ each: true })
  requiredFields!: string[];

  @IsArray()
  @IsString({ each: true })
  autoCheckRules!: string[];

  @IsOptional()
  @IsInt()
  @Min(0)
  minTextLength?: number;
}

class CompleteProofDto {
  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsString()
  link?: string;

  @IsOptional()
  @IsString()
  screenshotUrl?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

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

  @IsOptional()
  @ValidateNested()
  @Type(() => CompleteProofDto)
  proofData?: CompleteProofDto;

  @IsOptional()
  @IsString()
  deviceFingerprint?: string;
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

  @IsOptional()
  @ValidateNested()
  @Type(() => VerificationPolicyDto)
  verificationPolicy?: VerificationPolicyDto;

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
  @MaxLength(80)
  sponsorName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  sponsorType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  kpiName?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  kpiTarget?: number;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  kpiUnit?: string;

  @IsOptional()
  @IsObject()
  audienceRules?: Record<string, unknown>;

  @IsOptional()
  @IsInt()
  @Min(0)
  cooldownSeconds?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  minReputation?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  minAccountAgeDays?: number;

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
  @ValidateNested()
  @Type(() => VerificationPolicyDto)
  verificationPolicy?: VerificationPolicyDto;

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
  @MaxLength(80)
  sponsorName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  sponsorType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  kpiName?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  kpiTarget?: number;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  kpiUnit?: string;

  @IsOptional()
  @IsObject()
  audienceRules?: Record<string, unknown>;

  @IsOptional()
  @IsInt()
  @Min(0)
  cooldownSeconds?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  minReputation?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  minAccountAgeDays?: number;

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
