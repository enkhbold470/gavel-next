import { NextRequest, NextResponse } from 'next/server';
import * as ItemService from '@/lib/item-service';
import { parseCSV } from '@/lib/utils';
import { Item } from '@/lib/types';

export async function GET() {
  console.log('GET /api/admin/items - Starting request');
  try {
    console.log('Fetching all items');
    const items = await ItemService.getAllItems();
    console.log(`Found ${items.length} items`);
    
    console.log('Fetching stats for each item');
    const itemsWithStats = await Promise.all(
      items.map(async (item: Item) => {
        console.log(`Getting stats for item ${item.id}`);
        const stats = await ItemService.getItemStats(item.id);
        return stats;
      })
    );
    console.log('Successfully fetched all item stats');
    
    return NextResponse.json({ items: itemsWithStats });
  } catch (error) {
    console.error('Error in GET /api/admin/items:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  console.log('POST /api/admin/items - Starting request');
  try {
    const formData = await request.formData();
    const action = formData.get('action') as string;
    console.log(`Action: ${action}`);
    
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
      
      console.log(`Validating ${data.length} rows of data`);
      // Validate data
      for (let i = 0; i < data.length; i++) {
        if (data[i].length !== 3) {
          console.log(`Invalid row ${i + 1}: has ${data[i].length} elements`);
          return NextResponse.json(
            { error: `Row ${i + 1} has ${data[i].length} elements (expecting 3)` },
            { status: 400 }
          );
        }
      }
      
      console.log('Creating items from CSV data');
      // Create items
      const items = await Promise.all(
        data.map(([name, location, description]) => {
          console.log(`Creating item: ${name}`);
          return ItemService.createItem(name, location, description);
        })
      );
      
      console.log(`Successfully created ${items.length} items`);
      return NextResponse.json({ success: true, itemsCreated: items.length });
    } else if (action === 'Prioritize' || action === 'Cancel') {
      console.log(`Handling ${action} action`);
      const itemId = Number(formData.get('item_id'));
      const targetState = action === 'Prioritize';
      console.log(`Updating priority for item ${itemId} to ${targetState}`);
      
      await ItemService.updateItemPriority(itemId, targetState);
      
      return NextResponse.json({ success: true });
    } else if (action === 'Disable' || action === 'Enable') {
      console.log(`Handling ${action} action`);
      const itemId = Number(formData.get('item_id'));
      const targetState = action === 'Enable';
      console.log(`Updating active state for item ${itemId} to ${targetState}`);
      
      await ItemService.updateItemActive(itemId, targetState);
      
      return NextResponse.json({ success: true });
    } else if (action === 'Delete') {
      console.log('Handling delete action');
      const itemId = Number(formData.get('item_id'));
      console.log(`Attempting to delete item ${itemId}`);
      
      const deleted = await ItemService.deleteItem(itemId);
      
      if (!deleted) {
        console.log(`Failed to delete item ${itemId} - has been voted on`);
        return NextResponse.json(
          { error: "Items can't be deleted once they have been voted on by a judge. You can use the 'disable' functionality instead." },
          { status: 400 }
        );
      }
      
      console.log(`Successfully deleted item ${itemId}`);
      return NextResponse.json({ success: true });
    } else if (action === 'Update') {
      console.log('Handling update action');
      const itemId = Number(formData.get('item_id'));
      const name = formData.get('name') as string;
      const location = formData.get('location') as string;
      const description = formData.get('description') as string;
      console.log(`Updating item ${itemId} with new data`);
      
      await ItemService.updateItem(itemId, {
        name: name || undefined,
        location: location || undefined,
        description: description || undefined
      });
      
      console.log(`Successfully updated item ${itemId}`);
      return NextResponse.json({ success: true });
    }
    
    console.log('Invalid action received');
    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in POST /api/admin/items:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
}