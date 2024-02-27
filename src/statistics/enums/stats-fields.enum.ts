export const StatsFields = {
  totalTime: 'totalTime',
  score: 'score',
  other: 'other',
};

export type StatsFields = (typeof StatsFields)[keyof typeof StatsFields];
