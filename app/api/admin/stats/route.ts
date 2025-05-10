import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('GET /api/admin/stats - Fetching statistics');

    // Count total number of decisions
    const votes = await prisma.decision.count();
    console.log('Total votes counted:', votes);
    
    // Count total number of items
    const itemCount = await prisma.item.count();
    console.log('Total items counted:', itemCount);
    
    // Count total number of judges
    const judgeCount = await prisma.judge.count();
    console.log('Total judges counted:', judgeCount);
    
    // Count active items and judges
    const activeItemCount = await prisma.item.count({
      where: { active: true }
    });
    console.log('Active items counted:', activeItemCount);
    
    const activeJudgeCount = await prisma.judge.count({
      where: { active: true }
    });
    console.log('Active judges counted:', activeJudgeCount);
    
    return NextResponse.json({
      votes,
      itemCount,
      judgeCount,
      activeItemCount,
      activeJudgeCount
    });
  } catch (error) {
    console.error('Error in GET /api/admin/stats:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
} 