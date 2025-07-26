import { getActiveProcessesWithLogs, ProcessInfo, getLogFiles, LogFile } from '@/lib/logs';
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

function groupProcesses(processes: ProcessInfo[], allLogFiles: LogFile[]) {
  const activeProcessNames = processes.map(p => p.appName);
  
  // Get all log files for inactive processes
  const inactiveLogFiles = allLogFiles.filter(log => !activeProcessNames.includes(log.appName));
  
  // Group inactive log files by app name
  const inactiveLogsByApp = inactiveLogFiles.reduce((acc, log) => {
    if (!acc[log.appName]) {
      acc[log.appName] = { out: null, error: null };
    }
    if (!log.isRotated) {
      acc[log.appName][log.logType] = log;
    }
    return acc;
  }, {} as Record<string, { out: LogFile | null; error: LogFile | null }>);
  
  // Create inactive processes
  const inactiveProcessNames = [...new Set(inactiveLogFiles.map(log => log.appName))];
  const inactiveProcesses: ProcessInfo[] = inactiveProcessNames.map(appName => ({
    appName,
    logs: inactiveLogsByApp[appName] || { out: null, error: null }
  }));
  
  // Group active processes
  const activeWithLogs = processes.filter(p => hasAnyLogs(p));
  const activeWithoutLogs = processes.filter(p => !hasAnyLogs(p));
  
  // Group inactive processes
  const inactiveWithLogs = inactiveProcesses.filter(p => hasAnyLogs(p));
  const inactiveWithoutLogs = inactiveProcesses.filter(p => !hasAnyLogs(p));
  
  return {
    activeWithLogs,
    activeWithoutLogs,
    inactiveWithLogs,
    inactiveWithoutLogs
  };
}

export default async function Home() {
  const processes = await getActiveProcessesWithLogs();
  const allLogFiles = await getLogFiles();
  const { activeWithLogs, activeWithoutLogs, inactiveWithLogs, inactiveWithoutLogs } = groupProcesses(processes, allLogFiles);

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
        {inactiveWithLogs.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-4 text-gray-600 dark:text-gray-400">
              Inactive Processes with Logs ({inactiveWithLogs.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {inactiveWithLogs.map((process) => (
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
                                <span className="text-gray-400 dark:text-gray-500">inactive</span>
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

        {/* Inactive Processes without Logs */}
        {inactiveWithoutLogs.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-4 text-gray-500 dark:text-gray-500">
              Inactive Processes without Logs ({inactiveWithoutLogs.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {inactiveWithoutLogs.map((process) => (
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
      </main>
    </div>
  );
}