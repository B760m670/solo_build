import { IsString, MaxLength, MinLength } from 'class-validator';

export class InspectAddressDto {
  @IsString()
  @MinLength(10)
  @MaxLength(120)
  address!: string;
}

export class DecodeTransactionDto {
  @IsString()
  @MinLength(16)
  @MaxLength(300)
  txRef!: string;
}
