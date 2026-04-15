import { IsNumber, IsOptional, IsString, Length, Min } from 'class-validator';

export class WithdrawTonDto {
  @IsString()
  @Length(48, 68)
  tonAddress!: string;

  @IsNumber()
  @Min(0.1)
  amount!: number;

  @IsOptional()
  @IsString()
  idempotencyKey?: string;
}
