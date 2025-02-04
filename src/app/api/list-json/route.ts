import { NextResponse } from 'next/server';
import { readdir, stat } from 'fs/promises';
import { join } from 'path';

export async function GET() {
  try {
    const savedJsonDir = join(process.cwd(), 'public', 'saved-json');
    const files = await readdir(savedJsonDir);

    // Get file stats and sort by modification time
    const fileStats = await Promise.all(
      files.map(async (filename) => {
        const filePath = join(savedJsonDir, filename);
        const stats = await stat(filePath);
        return {
          filename,
          timestamp: stats.mtime.toISOString(),
        };
      })
    );

    // Sort by timestamp (newest first) and limit to 10 files
    const sortedFiles = fileStats
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
      .slice(0, 10);

    return NextResponse.json({ files: sortedFiles });
  } catch (error) {
    console.error('Error listing JSON files:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to list JSON files' },
      { status: 500 }
    );
  }
}