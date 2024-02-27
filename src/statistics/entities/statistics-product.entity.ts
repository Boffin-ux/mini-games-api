import { Product } from '@prisma/client';
import { StatisticsEntity } from './statistics.entity';

export class StatisticsProductEntity extends StatisticsEntity {
  product: Partial<Product>;

  constructor(partial: Partial<StatisticsProductEntity>) {
    super(partial);
    Object.assign(this, partial);
  }
}
