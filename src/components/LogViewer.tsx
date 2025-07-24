'use client';

import { useState, useMemo, useEffect } from 'react';
import { ParsedLogLine } from '@/lib/log-parser';
import { format, toZonedTime } from 'date-fns-tz';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface LogViewerProps {
  logs: ParsedLogLine[];
  timezones: string[];
}

export function LogViewer({ logs, timezones }: LogViewerProps) {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedTimezone, setSelectedTimezone] = useState<string>(Intl.DateTimeFormat().resolvedOptions().timeZone);

  const filteredAndSortedLogs = useMemo(() => {
    let filtered = logs;

    if (startDate) {
      const start = new Date(startDate);
      filtered = filtered.filter(log => log.timestamp && log.timestamp >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      filtered = filtered.filter(log => log.timestamp && log.timestamp <= end);
    }

    return filtered.sort((a, b) => {
      if (!a.timestamp) return 1;
      if (!b.timestamp) return -1;
      return sortOrder === 'asc'
        ? a.timestamp.getTime() - b.timestamp.getTime()
        : b.timestamp.getTime() - a.timestamp.getTime();
    });
  }, [logs, sortOrder, startDate, endDate]);

  const formatTimestamp = (ts: Date | null) => {
    if (!ts) return 'No Timestamp'.padEnd(25);
    const zonedTime = toZonedTime(ts, selectedTimezone);
    return format(zonedTime, 'yyyy-MM-dd HH:mm:ss.SSS zzz', { timeZone: selectedTimezone });
  };
  
  const hasTimestamps = logs.some(log => log.timestamp);

  if (!hasTimestamps) {
    return (
      <pre className="whitespace-pre-wrap break-words bg-white dark:bg-gray-800 p-4 rounded-md text-sm">
        {logs.map((log, i) => (
          <div key={i}>{log.originalLine}</div>
        ))}
      </pre>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-md mb-4">
        <div className="flex items-center gap-2">
            <label htmlFor="start-date" className="text-sm font-medium">From</label>
            <Input id="start-date" type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
            <label htmlFor="end-date" className="text-sm font-medium">To</label>
            <Input id="end-date" type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </div>
        <Select value={selectedTimezone} onValueChange={setSelectedTimezone}>
            <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Select a timezone" />
            </SelectTrigger>
            <SelectContent>
                {timezones.map(tz => <SelectItem key={tz} value={tz}>{tz}</SelectItem>)}
            </SelectContent>
        </Select>
        <Button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
          Sort {sortOrder === 'asc' ? 'Descending' : 'Ascending'}
        </Button>
      </div>
      <pre className="whitespace-pre-wrap break-words bg-white dark:bg-gray-800 p-4 rounded-md text-sm">
        {filteredAndSortedLogs.map((log, i) => (
           <div key={i} className="flex">
             <span className="flex-shrink-0 w-64 text-gray-500 dark:text-gray-400">
                {formatTimestamp(log.timestamp)}
             </span>
             <span className="flex-grow">{log.content || log.originalLine}</span>
           </div>
        ))}
      </pre>
    </div>
  );
} 