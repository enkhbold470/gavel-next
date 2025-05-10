import { prisma } from './prisma';
import { generateSecret } from './utils';
import * as CrowdBT from './crowd-bt';
import { MIN_VIEWS, TIMEOUT } from './constants';
import { Item, Judge, ItemViewCount } from './types';

// Using constants from crowd-bt
const { ALPHA_PRIOR, BETA_PRIOR, EPSILON } = CrowdBT;

export async function createJudge(name: string, email: string, description?: string) {
  const secret = generateSecret();
  
  return await prisma.judge.create({
    data: {
      name,
      email,
      description,
      secret,
      alpha: ALPHA_PRIOR,
      beta: BETA_PRIOR,
      active: true,
      read_welcome: false
    }
  });
}

export async function getJudgeBySecret(secret: string) {
  return await prisma.judge.findUnique({
    where: { secret },
    include: {
      next: true,
      prev: true
    }
  });
}

export async function getJudgeById(id: number) {
  return await prisma.judge.findUnique({
    where: { id },
    include: {
      next: true,
      prev: true
    }
  });
}

export async function updateJudgeNextItem(judgeId: number, itemId: number | null) {
  return await prisma.judge.update({
    where: { id: judgeId },
    data: {
      nextId: itemId,
      updated: new Date()
    }
  });
}

export async function markItemAsViewed(judgeId: number, itemId: number) {
  return await prisma.itemsViewedByJudges.upsert({
    where: {
      judgeId_itemId: { // Assumes default compound key name
        judgeId: judgeId,
        itemId: itemId,
      }
    },
    create: {
      judgeId: judgeId,
      itemId: itemId,
    },
    update: {}, // No fields to update if it already exists
  });
}

export async function ignoreItem(judgeId: number, itemId: number) {
  return await prisma.itemsIgnoredByJudges.upsert({
    where: {
      judgeId_itemId: { // Assumes default compound key name
        judgeId: judgeId,
        itemId: itemId,
      }
    },
    create: {
      judgeId: judgeId,
      itemId: itemId,
    },
    update: {}, // No fields to update if it already exists
  });
}

export async function recordDecision(judgeId: number, winnerId: number, loserId: number) {
  return await prisma.decision.create({
    data: {
      judgeId,
      winnerId,
      loserId,
      time: new Date()
    }
  });
}

export async function performVote(judgeId: number, nextWon: boolean) {
  const judge = await prisma.judge.findUnique({
    where: { id: judgeId },
    include: {
      next: true,
      prev: true
    }
  });

  if (!judge || !judge.next || !judge.prev) {
    throw new Error('Judge or items not found');
  }

  const winner = nextWon ? judge.next : judge.prev;
  const loser = nextWon ? judge.prev : judge.next;

  const [uAlpha, uBeta, uWinnerMu, uWinnerSigmaSq, uLoserMu, uLoserSigmaSq] = CrowdBT.update(
    judge.alpha,
    judge.beta,
    winner.mu,
    winner.sigma_sq,
    loser.mu,
    loser.sigma_sq
  );

  await prisma.$transaction([
    // Update judge
    prisma.judge.update({
      where: { id: judge.id },
      data: {
        alpha: uAlpha,
        beta: uBeta
      }
    }),
    
    // Update winner
    prisma.item.update({
      where: { id: winner.id },
      data: {
        mu: uWinnerMu,
        sigma_sq: uWinnerSigmaSq
      }
    }),
    
    // Update loser
    prisma.item.update({
      where: { id: loser.id },
      data: {
        mu: uLoserMu,
        sigma_sq: uLoserSigmaSq
      }
    })
  ]);

  return { judge, winner, loser };
}

export async function chooseNextItem(judgeId: number) {
  const judge = await prisma.judge.findUnique({
    where: { id: judgeId },
    include: {
      ignoredItems: true,
      prev: true
    }
  });

  if (!judge) {
    throw new Error('Judge not found');
  }

  const ignoredItemIds = judge.ignoredItems.map((i: { itemId: number }) => i.itemId);
  
  // Get all active items that haven't been ignored
  let availableItems = await prisma.item.findMany({
    where: {
      active: true,
      id: {
        notIn: ignoredItemIds
      }
    }
  });

  // Prioritize prioritized items
  const prioritizedItems = availableItems.filter((item: Item) => item.prioritized);
  const items = prioritizedItems.length > 0 ? prioritizedItems : availableItems;

  if (items.length === 0) {
    return null;
  }

  // Find items that are not currently being viewed by other judges
  const timeoutThreshold = new Date(Date.now() - TIMEOUT * 60 * 1000);
  const busyJudges = await prisma.judge.findMany({
    where: {
      active: true,
      nextId: { not: null },
      updated: { gt: timeoutThreshold }
    },
    select: {
      nextId: true
    }
  });

  const busyItemIds = busyJudges.map((judge: { nextId: number | null }) => judge.nextId).filter(Boolean) as number[];
  const nonBusyItems = items.filter((item: Item) => !busyItemIds.includes(item.id));
  const preferred = nonBusyItems.length > 0 ? nonBusyItems : items;

  // Find items with fewer than MIN_VIEWS views
  const viewCounts = await prisma.itemsViewedByJudges.groupBy({
    by: ['itemId'],
    _count: {
      itemId: true
    },
    where: {
      itemId: {
        in: preferred.map((item: Item) => item.id)
      }
    }
  });

  const itemViewMap = new Map<number, number>(viewCounts.map((v: ItemViewCount) => [v.itemId, v._count.itemId]));
  const lessSeenItems = preferred.filter((item: Item) => 
    (itemViewMap.get(item.id) ?? 0) < MIN_VIEWS
  );

  const candidateItems = lessSeenItems.length > 0 ? lessSeenItems : preferred;
  
  // Shuffle the items for random selection
  const shuffledItems = [...candidateItems].sort(() => Math.random() - 0.5);
  
  if (Math.random() < EPSILON) {
    // Epsilon-greedy: occasionally choose a random item
    return shuffledItems[0];
  } else if (judge.prev) {
    // Use information gain to choose the best item to compare
    const itemWithMaxGain = CrowdBT.argmax<Item>(
      (item) => CrowdBT.expectedInformationGain(
        judge.alpha,
        judge.beta,
        judge.prev?.mu ?? 0,
        judge.prev?.sigma_sq ?? 0,
        item.mu,
        item.sigma_sq
      ),
      shuffledItems
    );
    
    return itemWithMaxGain;
  } else {
    // If no previous item, just choose randomly
    return shuffledItems[0];
  }
}

export async function getAllJudges() {
  return await prisma.judge.findMany({
    orderBy: {
      name: 'asc' // Or any other preferred order
    }
  });
} 