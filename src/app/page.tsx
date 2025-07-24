import { getLogFiles, LogFile } from '@/lib/logs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card';
import { FileText, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import path from 'path';

function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export default async function Home() {
  const logFiles = await getLogFiles();

  // Group logs by appName, then by logType
  const grouped = logFiles.reduce((acc, log) => {
    if (!acc[log.appName]) {
      acc[log.appName] = { out: null, error: null };
    }
    if (!log.isRotated) {
      acc[log.appName][log.logType] = log;
    }
    return acc;
  }, {} as Record<string, { out: LogFile | null; error: LogFile | null }>);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="p-4 border-b dark:border-gray-800">
        <h1 className="text-2xl font-bold">LogWatch</h1>
      </header>
      <main className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Object.entries(grouped).map(([appName, logs]) => (
            <Card key={appName}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{appName}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(['out', 'error'] as const).map(type => {
                    const log = logs[type];
                    if (!log) return null;
                    return (
                      <Link href={`/logs/${encodeURIComponent(path.basename(log.filePath))}`} key={type} className="block">
                        <div className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                          <div className="flex items-center space-x-2">
                            {type === 'out' ? <FileText size={16} /> : <AlertCircle size={16} />}
                            <span className="uppercase text-xs font-semibold text-gray-500 dark:text-gray-400">[{type}]</span>
                            <span>active</span>
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {formatBytes(log.size)}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}