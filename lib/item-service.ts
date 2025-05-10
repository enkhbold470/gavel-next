import { prisma } from './prisma';
import { Prisma } from '@/lib/generated/prisma';
import { MU_PRIOR, SIGMA_SQ_PRIOR } from './crowd-bt';
import { ViewedJudge } from './types';

export async function createItem(name: string, location: string, description: string) {
  return await prisma.item.create({
    data: {
      name,
      location,
      description,
      mu: MU_PRIOR,
      sigma_sq: SIGMA_SQ_PRIOR,
      prioritized: false,
      active: true
    }
  });
}

export async function getItemById(id: number) {
  return await prisma.item.findUnique({
    where: { id }
  });
}

export async function updateItemPriority(id: number, prioritized: boolean) {
  return await prisma.item.update({
    where: { id },
    data: { prioritized }
  });
}

export async function updateItemActive(id: number, active: boolean) {
  return await prisma.item.update({
    where: { id },
    data: { active }
  });
}

export async function updateItem(id: number, data: { name?: string; location?: string; description?: string }) {
  return await prisma.item.update({
    where: { id },
    data
  });
}

export async function getAllItems() {
  return await prisma.item.findMany({
    orderBy: { mu: 'desc' }
  });
}

export async function getActiveItems() {
  return await prisma.item.findMany({
    where: { active: true },
    orderBy: { mu: 'desc' }
  });
}

export async function deleteItem(id: number): Promise<boolean> {
  try {
    await prisma.$transaction([
      prisma.itemsViewedByJudges.deleteMany({
        where: { itemId: id },
      }),
      prisma.itemsIgnoredByJudges.deleteMany({
        where: { itemId: id },
      }),
      prisma.judge.updateMany({
        where: { nextId: id },
        data: { nextId: null },
      }),
      prisma.judge.updateMany({
        where: { prevId: id },
        data: { prevId: null },
      }),
      prisma.item.delete({
        where: { id: id },
      }),
    ]);
    return true;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2003') {
        console.log(`Attempt to delete item ${id} failed due to P2003 (foreign key constraint).`);
        return false;
      }
    }
    console.error(`Unexpected error deleting item ${id}:`, error);
    throw error;
  }
}

export async function getItemViewCount(id: number) {
  const result = await prisma.itemsViewedByJudges.count({
    where: { itemId: id }
  });
  
  return result;
}

export async function getItemSkipCount(id: number) {
  // Skips are defined as items that are ignored but not viewed
  const viewedJudges = await prisma.itemsViewedByJudges.findMany({
    where: { itemId: id },
    select: { judgeId: true }
  });
  
  const viewedJudgeIds = viewedJudges.map((x: ViewedJudge) => x.judgeId);
  
  const skips = await prisma.itemsIgnoredByJudges.count({
    where: {
      itemId: id,
      judgeId: {
        notIn: viewedJudgeIds
      }
    }
  });
  
  return skips;
}

export async function getItemStats(id: number) {
  const item = await prisma.item.findUnique({
    where: { id }
  });
  
  if (!item) {
    throw new Error('Item not found');
  }
  
  const viewCount = await getItemViewCount(id);
  const skipCount = await getItemSkipCount(id);
  
  const winCount = await prisma.decision.count({
    where: { winnerId: id }
  });
  
  const lossCount = await prisma.decision.count({
    where: { loserId: id }
  });
  
  return {
    ...item,
    viewCount,
    skipCount,
    winCount,
    lossCount,
    totalVotes: winCount + lossCount
  };
} 