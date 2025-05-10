import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { remark } from 'remark';
import html from 'remark-html';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function renderMarkdown(text: string): Promise<string> {
  const result = await remark().use(html).process(text);
  return result.toString();
}

export function generateSecret(length: number = 32): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function parseCSV(csvText: string): string[][] {
  if (!csvText.trim()) {
    return [];
  }
  
  return csvText
    .split('\n')
    .filter(line => line.trim())
    .map(line => {
      const values = [];
      let inQuotes = false;
      let currentValue = '';
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];
        
        if (char === '"' && inQuotes && nextChar === '"') {
          // Handle escaped quotes
          currentValue += '"';
          i++;
        } else if (char === '"') {
          // Toggle quote state
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          // End of field
          values.push(currentValue.trim());
          currentValue = '';
        } else {
          // Normal character
          currentValue += char;
        }
      }
      
      // Add the last field
      values.push(currentValue.trim());
      return values;
    });
}

export function convertToCSV(data: any[]): string {
  if (!data || data.length === 0) {
    return "";
  }

  const replacer = (key: string, value: any) => value === null || value === undefined ? '' : value;
  
  const header = Object.keys(data[0]);
  const csv = [
    header.join(','), // header row
    ...data.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
  ].join('\r\n');

  return csv;
}
