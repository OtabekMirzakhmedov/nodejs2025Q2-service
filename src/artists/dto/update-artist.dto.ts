import { IsString, IsNotEmpty, IsBoolean } from 'class-validator';

export class UpdateArtistDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsBoolean()
  grammy: boolean;
}
