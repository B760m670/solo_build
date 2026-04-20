import {
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';

export class CreateTipDto {
  @IsString()
  @Length(1, 64)
  idempotencyKey!: string;

  @IsNumber()
  @Min(0.01)
  @Max(10_000)
  amountTon!: number;

  // Exactly one of these resolves the recipient. If the username isn't linked
  // to a Unisouq account yet, the tip lands in escrow and waits for claim.
  @IsOptional()
  @IsString()
  @Length(1, 64)
  recipientUsername?: string;

  @IsOptional()
  @IsString()
  @Length(1, 32)
  recipientTelegramId?: string;

  @IsOptional()
  @IsString()
  @Length(1, 200)
  note?: string;
}

export class ConfirmTipDto {
  @IsString()
  @Length(1, 200)
  sendTxHash!: string;
}
