import { IsOptional, IsString, Length } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  listingId!: string;
}

export class DeliverOrderDto {
  @IsString()
  @Length(1, 5000)
  deliverable!: string;
}

export class DisputeOrderDto {
  @IsString()
  @Length(10, 1000)
  reason!: string;
}

export class CancelOrderDto {
  @IsOptional()
  @IsString()
  @Length(0, 500)
  reason?: string;
}
