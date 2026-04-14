import { IsString, IsNumber, Min, IsOptional, MinLength, MaxLength } from 'class-validator';

export class WithdrawDto {
  @IsString()
  tonAddress!: string;

  @IsNumber()
  @Min(100)
  amount!: number;

  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  idempotencyKey?: string;
}

export class ConnectWalletDto {
  @IsString()
  tonAddress!: string;
}
