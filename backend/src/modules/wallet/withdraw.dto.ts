import { IsString, IsNumber, Min } from 'class-validator';

export class WithdrawDto {
  @IsString()
  tonAddress!: string;

  @IsNumber()
  @Min(100)
  amount!: number;
}

export class ConnectWalletDto {
  @IsString()
  tonAddress!: string;
}
