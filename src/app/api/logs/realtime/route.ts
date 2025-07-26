import { NextRequest } from 'next/server';
import { getActivePM2Processes } from '@/lib/logs';
import { parseLogLine } from '@/lib/log-parser';
import { spawn } from 'child_process';
import path from 'path';
import os from 'os';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const logFile = searchParams.get('logFile');
  
  if (!logFile) {
    return new Response('Missing logFile parameter', { status: 400 });
  }

  // Extract app name and log type from filename
  const activeMatch = logFile.match(/(.+)-(out|error)\.log$/);
  if (!activeMatch) {
    return new Response('Invalid log file format for real-time watching', { status: 400 });
  }

  const [, appName, logType] = activeMatch;
  
  // Verify this is an active process
  const activeProcessNames = await getActivePM2Processes();
  if (!activeProcessNames.includes(appName)) {
    return new Response('Cannot watch logs for inactive processes', { status: 400 });
  }

  const logDir = path.join(os.homedir(), '.pm2', 'logs');
  const logPath = path.join(logDir, logFile);

  const stream = new ReadableStream({
    start(controller) {
      // Use tail -f to follow the log file
      const tail = spawn('tail', ['-f', logPath]);
      
      tail.stdout.on('data', (data) => {
        const lines = data.toString().split('\n').filter(line => line.trim());
        for (const line of lines) {
          const parsedLine = parseLogLine(line);
          controller.enqueue(`data: ${JSON.stringify(parsedLine)}\n\n`);
        }
      });

      tail.stderr.on('data', (data) => {
        console.error('tail stderr:', data.toString());
      });

      tail.on('close', () => {
        controller.close();
      });

      // Clean up on client disconnect
      request.signal.addEventListener('abort', () => {
        tail.kill();
        controller.close();
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
