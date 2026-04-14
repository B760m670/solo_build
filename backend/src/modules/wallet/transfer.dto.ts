import { IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class SendBrbDto {
  @IsString()
  @MaxLength(64)
  recipient!: string;

  @IsNumber()
  @Min(1)
  amount!: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  note?: string;
}
