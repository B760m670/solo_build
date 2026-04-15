import { IsOptional, IsString, Length } from 'class-validator';

export class UpdateSettingsDto {
  @IsOptional()
  @IsString()
  @Length(2, 5)
  language?: string;

  @IsOptional()
  @IsString()
  theme?: string;

  @IsOptional()
  @IsString()
  @Length(48, 68)
  tonAddress?: string;
}
