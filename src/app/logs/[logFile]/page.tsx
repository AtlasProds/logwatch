
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { getLogFiles, LogFile } from '@/lib/logs';
import { parseLogContent } from '@/lib/log-parser';
import { LogViewer } from '@/components/LogViewer';

async function getLogContent(logFile: string): Promise<string> {
  const logDir = path.join(os.homedir(), '.pm2', 'logs');
  const filePath = path.join(logDir, logFile);

  try {
    // Sanitize filePath to prevent path traversal
    if (path.dirname(filePath) !== logDir) {
      throw new Error('Invalid log file path');
    }
    const content = await fs.readFile(filePath, 'utf-8');
    return content;
  } catch (error) {
    console.error(`Error reading log file ${logFile}:`, error);
    return 'Error reading log file.';
  }
}

export default async function LogViewerPage({ params }: { params: { logFile: string } }) {
  const logFile = decodeURIComponent(params.logFile);
  const content = await getLogContent(logFile);
  const parsedLogs = parseLogContent(content);
  
  const timezones = Intl.supportedValuesOf('timeZone');

  // Discover all logs for the same process/logType
  const allLogs = await getLogFiles();
  // Find the current log object
  const currentLog = allLogs.find(l => l.filePath.endsWith(logFile));
  let relatedLogs: LogFile[] = [];
  if (currentLog) {
    // Group by appName and logType
    relatedLogs = allLogs.filter(l => l.appName === currentLog.appName && l.logType === currentLog.logType)
      .sort((a, b) => {
        // Active log first, then rotated logs by timestamp descending
        if (!a.isRotated && b.isRotated) return -1;
        if (a.isRotated && !b.isRotated) return 1;
        if (!a.isRotated && !b.isRotated) return 0;
        // Both rotated: sort by timestamp descending
        return (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0);
      });
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="p-4 border-b dark:border-gray-800 flex items-center space-x-4">
        <Link href="/" className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700">
          <ChevronLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold">{logFile}</h1>
      </header>
      <main className="p-4 flex flex-col md:flex-row gap-4">
        <aside className="w-full md:w-64 mb-4 md:mb-0">
          <div className="bg-white dark:bg-gray-800 rounded-md shadow p-2">
            <div className="font-semibold mb-2">Log Files</div>
            <ul className="space-y-1">
              {relatedLogs.map(l => (
                <li key={l.filePath}>
                  <Link
                    href={`/logs/${encodeURIComponent(path.basename(l.filePath))}`}
                    className={`block px-2 py-1 rounded transition-colors ${l.filePath.endsWith(logFile) ? 'bg-gray-200 dark:bg-gray-700 font-bold' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  >
                    {l.isRotated ? `rotated - ${l.timestamp ? l.timestamp.toLocaleString() : 'Unknown Date'}` : 'active'}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
        <section className="flex-1">
          <LogViewer logs={parsedLogs} timezones={timezones} />
        </section>
      </main>
    </div>
  );
}
