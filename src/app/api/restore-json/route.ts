import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');

    if (!filename) {
      return NextResponse.json(
        { success: false, error: 'Filename is required' },
        { status: 400 }
      );
    }

    const filePath = join(process.cwd(), 'public', 'saved-json', filename);
    const content = await readFile(filePath, 'utf-8');
    const jsonContent = JSON.parse(content);

    return NextResponse.json({ success: true, content: jsonContent });
  } catch (error) {
    console.error('Error restoring JSON:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to restore JSON' },
      { status: 500 }
    );
  }
}