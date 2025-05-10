// Types for Prisma models to avoid importing from @prisma/client directly

export interface Item {
  id: number;
  name: string;
  location: string;
  description: string;
  mu: number;
  sigma_sq: number;
  prioritized: boolean;
  active: boolean;
}

export interface Judge {
  id: number;
  name: string;
  email: string;
  description: string | null;
  secret: string;
  alpha: number;
  beta: number;
  active: boolean;
  read_welcome: boolean;
  next?: Item | null;
  nextId: number | null;
  prev?: Item | null;
  prevId: number | null;
  updated: Date | null;
  ignoredItems: { itemId: number }[];
  viewedItems: { itemId: number }[];
}

export interface Decision {
  id: number;
  judgeId: number;
  winnerId: number;
  loserId: number;
  time: Date;
  judge?: Judge;
  winner?: Item;
  loser?: Item;
}

export interface ItemViewCount {
  itemId: number;
  _count: {
    itemId: number;
  };
}

export interface ViewedJudge {
  judgeId: number;
} 