import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Parses a CSV file that contains multiline JSON in quoted fields
 * @param content The raw CSV content
 * @returns Array of parsed rows as objects
 */
function parseCSV(content: string): Record<string, string>[] {
  const rows: Record<string, string>[] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;
  let i = 0;
  let headers: string[] = [];

  while (i < content.length) {
    const char = content[i];
    const nextChar = content[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        // Escaped quote
        currentField += '"';
        i += 2;
      } else if (char === '"') {
        // End of quoted field
        inQuotes = false;
        i++;
      } else {
        currentField += char;
        i++;
      }
    } else {
      if (char === '"') {
        // Start of quoted field
        inQuotes = true;
        i++;
      } else if (char === ',') {
        // End of field
        currentRow.push(currentField);
        currentField = '';
        i++;
      } else if (char === '\n' || (char === '\r' && nextChar === '\n')) {
        // End of row
        currentRow.push(currentField);
        currentField = '';

        if (headers.length === 0) {
          headers = currentRow;
        } else if (currentRow.length > 0 && currentRow.some(field => field.trim())) {
          const rowObj: Record<string, string> = {};
          headers.forEach((header, idx) => {
            rowObj[header] = currentRow[idx] || '';
          });
          rows.push(rowObj);
        }

        currentRow = [];
        i += char === '\r' ? 2 : 1;
      } else {
        currentField += char;
        i++;
      }
    }
  }

  // Handle last row if file doesn't end with newline
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField);
    if (headers.length > 0 && currentRow.length > 0 && currentRow.some(field => field.trim())) {
      const rowObj: Record<string, string> = {};
      headers.forEach((header, idx) => {
        rowObj[header] = currentRow[idx] || '';
      });
      rows.push(rowObj);
    }
  }

  return rows;
}

export async function POST(request: NextRequest) {
  try {
    // Read the CSV file
    const csvPath = path.join(process.cwd(), 'tasks', 'dashdoor.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');

    // Parse the CSV
    const rows = parseCSV(csvContent);

    // Build the verifiers object
    const verifiers: Record<string, any> = {};

    for (const row of rows) {
      const taskId = row['task_id'];
      const fullTaskJson = row['full_task_json'];

      if (!taskId || !fullTaskJson) {
        continue;
      }

      try {
        // Parse the JSON
        const taskData = JSON.parse(fullTaskJson);

        // Remove the task_id field from the parsed JSON
        const { task_id, ...taskWithoutId } = taskData;

        // Add to verifiers with uppercase task_id as key
        verifiers[taskId.toUpperCase()] = taskWithoutId;
      } catch (parseError) {
        console.error(`Failed to parse JSON for task ${taskId}:`, parseError);
        continue;
      }
    }

    return NextResponse.json({
      verifiers,
    });
  } catch (error: any) {
    console.error('Error reading expected state:', error);
    return NextResponse.json(
      { error: 'Failed to read expected state', message: error.message },
      { status: 500 }
    );
  }
}

