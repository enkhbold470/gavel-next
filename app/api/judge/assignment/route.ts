import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import * as JudgeService from '@/lib/judge-service';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const judgeIdCookie = cookieStore.get('judge_id');

    if (!judgeIdCookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const judgeId = Number(judgeIdCookie.value);
    let judge = await JudgeService.getJudgeById(judgeId);

    if (!judge) {
      return NextResponse.json({ error: 'Judge not found' }, { status: 404 });
    }

    // If there's no next item assigned, or if the assigned next item is inactive,
    // and also if there's no prev item (or prev item is inactive implying we need a fresh start)
    // or if both prev and next items are somehow the same (which shouldn't happen but good to check)
    // let's try to pick a new one.
    // This logic ensures we always try to serve a valid next item if possible.
    if (!judge.next || !judge.next.active || (judge.prev && judge.nextId === judge.prevId)) {
      // If there was a 'next' item that's now problematic, and it was also the 'prev' item,
      // it means we are stuck. Let's clear prevId to get a truly fresh pick.
      if (judge.prevId && judge.prevId === judge.nextId) {
        await prisma.judge.update({
          where: { id: judgeId },
          data: { prevId: null },
        });
        // Re-fetch judge as prevId changed
        const updatedJudgeWithNullPrev = await JudgeService.getJudgeById(judgeId);
        if (updatedJudgeWithNullPrev) {
            judge = updatedJudgeWithNullPrev;
        } else {
            // Should not happen if judgeId is valid
             return NextResponse.json({ error: 'Judge disappeared' }, { status: 500 });
        }
      }
      
      const newItem = await JudgeService.chooseNextItem(judgeId);
      await JudgeService.updateJudgeNextItem(judgeId, newItem?.id || null);
      // Re-fetch judge to get populated next (and potentially prev)
      const updatedJudge = await JudgeService.getJudgeById(judgeId);
      if (updatedJudge) {
        judge = updatedJudge;
      } else {
        // Should not happen if judgeId is valid
        return NextResponse.json({ error: 'Judge disappeared after item assignment' }, { status: 500 });
      }
    }
    
    // If after attempting to choose a next item, judge.next is still null
    // it means there are no more items to judge.
    if (!judge.next) {
      return NextResponse.json({ 
        prevItem: judge.prev, // Could be the last judged item
        nextItem: null, 
        message: "No more items available for judging." 
      });
    }

    return NextResponse.json({ prevItem: judge.prev, nextItem: judge.next });

  } catch (error) {
    console.error("Error in GET /api/judge/assignment:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
} 