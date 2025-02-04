import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: Request) {
  try {
    const { content, filename: customFilename } = await request.json();
    
    // Create a filename - either custom or timestamp-based
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = customFilename
      ? `${customFilename}.json`
      : `json-${timestamp}.json`;
    
    // Save to the public directory
    const filePath = join(process.cwd(), 'public', 'saved-json', filename);
    
    // Ensure the directory exists
    await writeFile(filePath, JSON.stringify(content, null, 2));
    
    return NextResponse.json({ success: true, filename });
  } catch (error) {
    console.error('Error saving JSON:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save JSON' },
      { status: 500 }
    );
  }
}