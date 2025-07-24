import { getLogContent } from '@/lib/logs';
import { LogViewer } from '@/components/LogViewer';

export default async function LogPage({ params, searchParams }: { params: { logFile: string }, searchParams: { page?: string; startDate?: string; endDate?: string; timezone?: string } }) {
  const logFile = decodeURIComponent(params.logFile);
  const page = parseInt(searchParams.page || '1', 10);
  const startDate = searchParams.startDate ? new Date(searchParams.startDate) : undefined;
  const endDate = searchParams.endDate ? new Date(searchParams.endDate) : undefined;
  const timezone = searchParams.timezone || 'local';

  let allLogs = await getLogContent(logFile, startDate, endDate);

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