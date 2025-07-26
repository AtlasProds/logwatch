import { getLogContent, getActivePM2Processes } from '@/lib/logs';
import { LogViewer } from '@/components/LogViewer';

export default async function LogPage({ params, searchParams }: { params: { logFile: string }, searchParams: { page?: string; startDate?: string; endDate?: string; timezone?: string } }) {
  const logFile = decodeURIComponent(params.logFile);
  const page = parseInt(searchParams.page || '1', 10);
  const startDate = searchParams.startDate ? new Date(searchParams.startDate) : undefined;
  const endDate = searchParams.endDate ? new Date(searchParams.endDate) : undefined;
  const timezone = searchParams.timezone || 'local';

  // Extract app name from log file name to check if it's an active process
  const activeMatch = logFile.match(/(.+)-(out|error)\.log$/);
  const rotatedMatch = logFile.match(/(.+)-(out|error)__(\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2})\.log$/);
  
  let appName: string;
  if (activeMatch) {
    [, appName] = activeMatch;
  } else if (rotatedMatch) {
    [, appName] = rotatedMatch;
  } else {
    appName = '';
  }

  // Check if this is an inactive process
  const activeProcessNames = await getActivePM2Processes();
  const isInactiveProcess = Boolean(appName && !activeProcessNames.includes(appName));

  let allLogs = await getLogContent(logFile, startDate, endDate, isInactiveProcess);

  // Sort logs: latest first
  allLogs = allLogs.slice().sort((a, b) => {
    if (a.timestamp && b.timestamp) {
      return b.timestamp.getTime() - a.timestamp.getTime();
    }
    if (a.timestamp) return -1;
    if (b.timestamp) return 1;
    return 0;
  });

  const logsPerPage = 50;
  const totalPages = Math.ceil(allLogs.length / logsPerPage);
  const paginatedLogs = allLogs.slice((page - 1) * logsPerPage, page * logsPerPage);

  return (
    <LogViewer
      logs={paginatedLogs}
      logFile={logFile}
      totalPages={totalPages}
      currentPage={page}
      timezone={timezone}
    />
  );
}