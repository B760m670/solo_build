import { IsString, IsOptional, IsIn } from 'class-validator';

export class TaskFilterDto {
  @IsOptional()
  @IsIn(['survey', 'review', 'test', 'subscribe'])
  category?: string;

  @IsOptional()
  @IsIn(['PENDING', 'ACTIVE', 'COMPLETED'])
  status?: string;
}

export class CompleteTaskDto {
  @IsString()
  proof!: string;
}
