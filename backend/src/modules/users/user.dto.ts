import { IsString, IsOptional, IsIn } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsIn(['dark', 'light'])
  theme?: string;

  @IsOptional()
  @IsIn(['en', 'ru', 'ar'])
  language?: string;

  @IsOptional()
  @IsString()
  tonWallet?: string;
}
