import { Exclude } from 'class-transformer';

export class StatisticsEntity {
  id: string;
  createdAt: Date;
  level: number;
  totalTime: string | null;
  score: number | null;
  other: string | null;

  @Exclude()
  userId: string;

  @Exclude()
  productId: string;

  constructor(partial: Partial<StatisticsEntity>) {
    Object.assign(this, partial);
  }
}
