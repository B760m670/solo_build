import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';
import { TaskProofType } from '@prisma/client';

export class SubmitProofDto {
  @IsString()
  @Length(1, 2000)
  proof!: string;
}

export class RejectTaskDto {
  @IsOptional()
  @IsString()
  @Length(0, 500)
  reason?: string;
}

export class CreateBrandTaskDto {
  @IsString()
  @Length(1, 64)
  brandName!: string;

  @IsOptional()
  @IsString()
  brandLogo?: string;

  @IsString()
  @Length(1, 120)
  title!: string;

  @IsString()
  @Length(1, 2000)
  description!: string;

  @IsEnum(['SCREENSHOT', 'LINK', 'TEXT'])
  proofType!: TaskProofType;

  @IsInt()
  @Min(1)
  rewardStars!: number;

  @IsInt()
  @Min(1)
  totalSlots!: number;

  @IsNumber()
  @Min(0)
  fundedTon!: number;
}
