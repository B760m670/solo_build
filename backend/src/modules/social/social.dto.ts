import {
  IsInt,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';

export class CreatePostDto {
  @IsString() @Length(1, 2000)
  body!: string;

  @IsOptional() @IsString() @Length(0, 500)
  imageUrl?: string;
}

export class CreateCommentDto {
  @IsString() @Length(1, 1000)
  body!: string;
}

export class BoostPostDto {
  @IsInt() @Min(1)
  hours!: number;
}
