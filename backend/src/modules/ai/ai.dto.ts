import { IsOptional, IsString, Length } from 'class-validator';

export class SendMessageDto {
  @IsString() @Length(1, 4000)
  message!: string;

  @IsOptional() @IsString()
  chatId?: string;
}
