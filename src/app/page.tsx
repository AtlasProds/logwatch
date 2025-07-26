import { getActiveProcessesWithLogs, getInactiveProcessesWithLogs, ProcessInfo } from '@/lib/logs';
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

function hasAnyLogs(process: ProcessInfo): boolean {
  return !!(process.logs.out || process.logs.error);
}

function groupActiveProcesses(processes: ProcessInfo[]) {
  const activeWithLogs = processes.filter(p => hasAnyLogs(p));
  const activeWithoutLogs = processes.filter(p => !hasAnyLogs(p));
  
  return {
    activeWithLogs,
    activeWithoutLogs
  };
}

export default async function Home() {
  const activeProcesses = await getActiveProcessesWithLogs();
  const inactiveProcesses = await getInactiveProcessesWithLogs();
  const { activeWithLogs, activeWithoutLogs } = groupActiveProcesses(activeProcesses);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="p-4 border-b dark:border-gray-800">
        <h1 className="text-2xl font-bold">LogWatch</h1>
      </header>
      <main className="p-4 space-y-8">
        {/* Active Processes with Logs */}
        {activeWithLogs.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-4 text-green-600 dark:text-green-400">
              Active Processes with Logs ({activeWithLogs.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {activeWithLogs.map((process) => (
                <Card key={process.appName}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{process.appName}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {(['out', 'error'] as const).map(type => {
                        const log = process.logs[type];
                        if (!log) {
                          return (
                            <div key={type} className="flex items-center justify-between p-2 rounded-md bg-gray-50 dark:bg-gray-800">
                              <div className="flex items-center space-x-2">
                                {type === 'out' ? <FileText size={16} /> : <AlertCircle size={16} />}
                                <span className="uppercase text-xs font-semibold text-gray-500 dark:text-gray-400">[{type}]</span>
                                <span className="text-gray-500 dark:text-gray-400">No log file</span>
                              </div>
                            </div>
                          );
                        }
                        return (
                          <Link href={`/logs/${encodeURIComponent(path.basename(log.filePath))}`} key={type} className="block">
                            <div className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                              <div className="flex items-center space-x-2">
                                {type === 'out' ? <FileText size={16} /> : <AlertCircle size={16} />}
                                <span className="uppercase text-xs font-semibold text-gray-500 dark:text-gray-400">[{type}]</span>
                                <span className="text-green-600 dark:text-green-400">active</span>
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
          </section>
        )}

        {/* Active Processes without Logs */}
        {activeWithoutLogs.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-4 text-yellow-600 dark:text-yellow-400">
              Active Processes without Logs ({activeWithoutLogs.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {activeWithoutLogs.map((process) => (
                <Card key={process.appName}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{process.appName}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {(['out', 'error'] as const).map(type => (
                        <div key={type} className="flex items-center justify-between p-2 rounded-md bg-gray-50 dark:bg-gray-800">
                          <div className="flex items-center space-x-2">
                            {type === 'out' ? <FileText size={16} /> : <AlertCircle size={16} />}
                            <span className="uppercase text-xs font-semibold text-gray-500 dark:text-gray-400">[{type}]</span>
                            <span className="text-gray-500 dark:text-gray-400">No log file</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Inactive Processes with Logs */}
        {inactiveProcesses.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-4 text-gray-600 dark:text-gray-400">
              Inactive Processes with Logs ({inactiveProcesses.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {inactiveProcesses.map((process) => (
                <Card key={process.appName}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{process.appName}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {(['out', 'error'] as const).map(type => {
                        const log = process.logs[type];
                        if (!log) {
                          return (
                            <div key={type} className="flex items-center justify-between p-2 rounded-md bg-gray-50 dark:bg-gray-800">
                              <div className="flex items-center space-x-2">
                                {type === 'out' ? <FileText size={16} /> : <AlertCircle size={16} />}
                                <span className="uppercase text-xs font-semibold text-gray-500 dark:text-gray-400">[{type}]</span>
                                <span className="text-gray-500 dark:text-gray-400">No log file</span>
                              </div>
                            </div>
                          );
                        }
                        return (
                          <Link href={`/logs/${encodeURIComponent(path.basename(log.filePath))}`} key={type} className="block">
                            <div className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                              <div className="flex items-center space-x-2">
                                {type === 'out' ? <FileText size={16} /> : <AlertCircle size={16} />}
                                <span className="uppercase text-xs font-semibold text-gray-500 dark:text-gray-400">[{type}]</span>
                                <span className="text-gray-500 dark:text-gray-400">
                                  {log.isRotated ? 'rotated' : 'inactive'}
                                </span>
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
          </section>
        )}
      </main>
    </div>
  );
}
