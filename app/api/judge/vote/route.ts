import { NextRequest, NextResponse } from 'next/server';
import * as JudgeService from '@/lib/judge-service';
import * as SettingsService from '@/lib/settings-service';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Check if judging is closed
    const closed = await SettingsService.isJudgingClosed();
    if (closed) {
      return NextResponse.json(
        { error: 'Judging is currently closed' },
        { status: 403 }
      );
    }
    
    // Get judge ID from cookie
    const cookieStore = await cookies();
    const judgeIdCookie = cookieStore.get('judge_id');
    if (!judgeIdCookie) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    const judgeId = Number(judgeIdCookie.value);
    
    // Get judge and check if active
    const judge = await JudgeService.getJudgeById(judgeId);
    if (!judge || !judge.active) {
      return NextResponse.json(
        { error: 'Judge not found or not active' },
        { status: 403 }
      );
    }
    
    const formData = await request.formData();
    const action = formData.get('action') as string;

    if (action === 'SkipStartItem') {
      const itemId = Number(formData.get('item_id'));
      if (!itemId) {
        return NextResponse.json({ error: 'Missing item_id for SkipStartItem' }, { status: 400 });
      }
      // Ensure this item was indeed the judge's nextItem
      if (judge.nextId !== itemId) {
        return NextResponse.json({ error: 'Invalid item for SkipStartItem' }, { status: 400 });
      }
      await JudgeService.ignoreItem(judgeId, itemId);
      // Clear prevId as we are skipping the first of a potential pair
      await prisma.judge.update({ where: { id: judgeId }, data: { prevId: null } });
      const nextItem = await JudgeService.chooseNextItem(judgeId);
      await JudgeService.updateJudgeNextItem(judgeId, nextItem?.id || null);
      return NextResponse.json({ success: true, nextItem });

    } else if (action === 'ConfirmStartItem') {
      const itemId = Number(formData.get('item_id'));
      if (!itemId) {
        return NextResponse.json({ error: 'Missing item_id for ConfirmStartItem' }, { status: 400 });
      }
      if (judge.nextId !== itemId) {
        return NextResponse.json({ error: 'Invalid item for ConfirmStartItem' }, { status: 400 });
      }
      // Set current nextItem as prevItem
      await prisma.judge.update({ where: { id: judgeId }, data: { prevId: itemId } });
      // Choose a new nextItem for comparison
      const nextItem = await JudgeService.chooseNextItem(judgeId);
      await JudgeService.updateJudgeNextItem(judgeId, nextItem?.id || null);
      // Client will navigate to /compare, which will fetch this new pair
      return NextResponse.json({ success: true, newNextItemId: nextItem?.id }); 

    } else if (action === 'Skip' || action === 'Previous' || action === 'Current') {
      const prevId = Number(formData.get('prev_id'));
      const nextId = Number(formData.get('next_id'));

      if (!prevId || !nextId) {
        return NextResponse.json({ error: 'Missing prev_id or next_id' }, { status: 400 });
      }
      
      // Validate that these are the items assigned to the judge
      if (judge.prevId !== prevId || judge.nextId !== nextId) {
        return NextResponse.json({ error: 'Invalid items for vote/skip' }, { status: 400 });
      }

      if (action === 'Skip') {
        await JudgeService.ignoreItem(judgeId, nextId); // Only ignore the current 'next' item
        // The current prevId remains, a new nextId is chosen against it.
        const newItemForComparison = await JudgeService.chooseNextItem(judgeId);
        await JudgeService.updateJudgeNextItem(judgeId, newItemForComparison?.id || null);
        return NextResponse.json({ success: true, nextItem: newItemForComparison });
      } else { // 'Previous' or 'Current' (a vote occurred)
        if (!judge.prev?.active || !judge.next?.active) {
          await JudgeService.ignoreItem(judgeId, nextId); // Ignore the problematic next item
          // Potentially also ignore prevItem if it was the cause, or handle as needed
          // For now, just try to get a new next item, keeping prev if it was active.
          if (judge.prev && !judge.prev.active) { // if prev was also inactive, clear it.
             await JudgeService.ignoreItem(judgeId, prevId);
             await prisma.judge.update({ where: { id: judgeId }, data: { prevId: null } });
          }
          const nextItem = await JudgeService.chooseNextItem(judgeId);
          await JudgeService.updateJudgeNextItem(judgeId, nextItem?.id || null);
          return NextResponse.json({ 
            success: true, 
            nextItem,
            message: 'One of the items was deactivated, new comparison loaded.' 
          });
        }
        
        const nextWon = action === 'Current';
        await JudgeService.performVote(judgeId, nextWon);
        const winnerId = nextWon ? nextId : prevId;
        const loserId = nextWon ? prevId : nextId;
        await JudgeService.recordDecision(judgeId, winnerId, loserId);
        await JudgeService.markItemAsViewed(judgeId, nextId);
        await JudgeService.ignoreItem(judgeId, nextId);
        
        // The one that was 'next' (and just voted on) becomes the new 'prev'
        await prisma.judge.update({
          where: { id: judgeId },
          data: { prevId: nextId }
        });
        // Choose the next item for comparison against the new prevId
        const newItemForComparison = await JudgeService.chooseNextItem(judgeId);
        await JudgeService.updateJudgeNextItem(judgeId, newItemForComparison?.id || null);
        
        return NextResponse.json({ success: true, nextItem: newItemForComparison });
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error in POST /api/judge/vote:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
} 