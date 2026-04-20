import { IsIn, IsOptional, IsString, Length } from 'class-validator';

export type FlowStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type FlowTriggerType =
  | 'TELEGRAM_COMMAND'
  | 'TELEGRAM_BUTTON'
  | 'WEBHOOK'
  | 'SCHEDULE'
  | 'STARS_PAYMENT';

export class CreateFlowDto {
  @IsString()
  @Length(1, 80)
  name!: string;

  @IsIn(['TELEGRAM_COMMAND', 'TELEGRAM_BUTTON', 'WEBHOOK', 'SCHEDULE', 'STARS_PAYMENT'])
  triggerType!: FlowTriggerType;

  @IsOptional()
  triggerConfig?: Record<string, unknown>;
}

export class UpdateFlowDto {
  @IsOptional()
  @IsString()
  @Length(1, 80)
  name?: string;

  @IsOptional()
  @IsIn(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
  status?: FlowStatus;
}
