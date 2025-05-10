import { NextRequest, NextResponse } from 'next/server';
import * as SettingsService from '@/lib/settings-service';
import { SETTING_CLOSED } from '@/lib/constants';

export async function GET() {
  try {
    console.log('GET /api/admin/settings - Fetching all settings');
    const settings = await SettingsService.getAllSettings();
    console.log('Settings fetched:', settings);
    
    const closed = await SettingsService.isJudgingClosed();
    console.log('Judging closed status:', closed);
    
    return NextResponse.json({ settings, closed });
  } catch (error) {
    console.error('Error in GET /api/admin/settings:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/admin/settings - Starting request');
    const formData = await request.formData();
    const key = formData.get('key') as string;
    console.log('Received key:', key);
    
    if (key === 'closed') {
      const action = formData.get('action') as string;
      console.log('Action received for closed setting:', action);
      const closed = action === 'Close';
      
      await SettingsService.setJudgingClosed(closed);
      console.log('Judging closed status set to:', closed);
      
      return NextResponse.json({ success: true, closed });
    } else {
      const value = formData.get('value') as string;
      console.log('Received value for setting:', value);
      
      if (!key || !value) {
        console.log('Error: Key and value are required');
        return NextResponse.json(
          { error: 'Key and value are required' },
          { status: 400 }
        );
      }
      
      await SettingsService.setSetting(key, value);
      console.log(`Setting ${key} updated to:`, value);
      
      return NextResponse.json({ success: true });
    }
  } catch (error) {
    console.error('Error in POST /api/admin/settings:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
} 