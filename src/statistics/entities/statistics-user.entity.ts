import { UserEntity } from '@users/entities/user.entity';
import { StatisticsEntity } from './statistics.entity';
import { Transform } from 'class-transformer';

export class StatisticsUserEntity extends StatisticsEntity {
  @Transform(({ value }) => new UserEntity(value))
  user: Partial<UserEntity>;

  constructor(partial: Partial<StatisticsUserEntity>) {
    super(partial);
    Object.assign(this, partial);
  }
}
