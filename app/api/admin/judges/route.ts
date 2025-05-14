import { NextRequest, NextResponse } from 'next/server';
import * as JudgeService from '@/lib/judge-service';
import { parseCSV } from '@/lib/utils';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/sendGrid';
import { WELCOME_MESSAGE, SUBJECT_LINE } from '@/lib/constants';

export async function GET() {
  try {
    console.log('GET /api/admin/judges - Fetching judges');
    const judges = await prisma.judge.findMany({
      include: {
        next: true,
        prev: true,
        decisions: true
      }
    });
    console.log('Judges fetched:', judges);
    
    return NextResponse.json({ judges });
  } catch (error) {
    console.error('Error in GET /api/admin/judges:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/admin/judges - Starting request');
    const formData = await request.formData();
    const action = formData.get('action') as string;
    console.log('Action received:', action);
    
    if (action === 'Submit') {
      console.log('Handling bulk create from CSV');
      let data: string[][];
      
      // Check if a file was uploaded
      const file = formData.get('file') as File;
      if (file && (file.name.endsWith('.csv') || file.name.endsWith('.txt'))) {
        console.log(`Processing uploaded file: ${file.name}`);
        const text = await file.text();
        data = parseCSV(text);
      } else {
        console.log('Processing CSV data from text area');
        const csvData = formData.get('data') as string;
        data = parseCSV(csvData);
      }
      
      if (!data || data.length === 0) {
        console.log('No data provided');
        return NextResponse.json(
          { error: 'No data provided' },
          { status: 400 }
        );
      }
      
      // Validate data
      console.log(`Validating ${data.length} rows of data`);
      for (let i = 0; i < data.length; i++) {
        if (data[i].length < 2 || data[i].length > 3) {
          console.log(`Invalid row ${i + 1}: has ${data[i].length} elements`);
          return NextResponse.json(
            { error: `Row ${i + 1} has ${data[i].length} elements (expecting 2-3)` },
            { status: 400 }
          );
        }
      }
      
      // Create judges
      console.log('Creating judges...');
      const judges = await Promise.all(
        data.map(([name, email, description]) => 
          JudgeService.createJudge(name, email, description)
        )
      );
      console.log('Judges created:', judges);
      
      return NextResponse.json({ success: true, judgesCreated: judges.length });
    } else if (action === 'Disable' || action === 'Enable') {
      console.log(`Toggling judge active state to: ${action}`);
      const judgeId = Number(formData.get('judge_id'));
      const targetState = action === 'Enable';
      
      await prisma.judge.update({
        where: { id: judgeId },
        data: { active: targetState }
      });
      
      console.log(`Judge ${judgeId} state updated to: ${targetState}`);
      return NextResponse.json({ success: true });
    } else if (action === 'Delete') {
      console.log('Handling delete for judge');
      const judgeId = Number(formData.get('judge_id'));
      
      try {
        await prisma.$transaction([
          prisma.itemsViewedByJudges.deleteMany({
            where: { judgeId }
          }),
          prisma.itemsIgnoredByJudges.deleteMany({
            where: { judgeId }
          }),
          prisma.judge.delete({
            where: { id: judgeId }
          })
        ]);
        
        console.log(`Judge ${judgeId} deleted successfully`);
        return NextResponse.json({ success: true });
      } catch (error) {
        console.error('Error deleting judge:', error);
        return NextResponse.json(
          { error: "Judges can't be deleted once they have voted on a project. You can use the 'disable' functionality instead." },
          { status: 400 }
        );
      }
    } else if (action === 'Email') {
      console.log('Handling email action for judge');
      const judgeId = Number(formData.get('judge_id'));
      
      const judge = await prisma.judge.findUnique({
        where: { id: judgeId }
      });
      
      if (!judge) {
        console.log('Judge not found:', judgeId);
        return NextResponse.json(
          { error: 'Judge not found' },
          { status: 404 }
        );
      }
      
      // Get the login link (would be used in email)
      const loginLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/judge/login/${judge.secret}`;
      console.log(`Login link for judge ${judgeId}: ${loginLink}`);
      
      // In a real implementation, you would send an email here with sendGrid
      await sendEmail(judge.email, SUBJECT_LINE, WELCOME_MESSAGE + loginLink);



      
      return NextResponse.json({ 
        success: true, 
        message: `Email would be sent to ${judge.email} with login link: ${loginLink}` 
      });
    }
    
    console.log('Invalid action received:', action);
    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in POST /api/admin/judges:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
} 