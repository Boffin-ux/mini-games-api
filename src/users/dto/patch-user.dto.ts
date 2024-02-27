import { Transform } from 'class-transformer';
import { IsBoolean } from 'class-validator';

export class PatchUserDto {
  @IsBoolean()
  @Transform(({ obj }) => obj.isBlocked === 'true')
  readonly isBlocked: boolean;
}
