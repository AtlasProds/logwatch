'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ParsedLogLine } from '@/lib/log-parser';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface LogViewerProps {
  logs: ParsedLogLine[];
  logFile: string;
  totalPages: number;
  currentPage: number;
  timezone?: string;
}

export function LogViewer({ logs, logFile, totalPages, currentPage, timezone: initialTimezone }: LogViewerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');

  // Timezone logic
  const commonTimezones = [
    'local',
    'UTC',
    'America/New_York',
    'Europe/London',
    'Asia/Kolkata',
    'Asia/Tokyo',
    'Australia/Sydney',
  ];
  const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  const urlTimezone = searchParams.get('timezone') || initialTimezone || 'local';
  const [timezone, setTimezone] = useState(urlTimezone === 'local' ? browserTz : urlTimezone);

  useEffect(() => {
    // Sync state with URL param
    setTimezone(urlTimezone === 'local' ? browserTz : urlTimezone);
  }, [urlTimezone, browserTz]);

  const handleTimezoneChange = (tz: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('timezone', tz);
    router.push(`/logs/${encodeURIComponent(logFile)}?${params.toString()}`);
    setTimezone(tz);
  };

  const filteredLogs = useMemo(() => {
    if (!searchTerm) return logs;
    return logs.filter(log => log.originalLine.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [logs, searchTerm]);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    router.push(`/logs/${encodeURIComponent(logFile)}?${params.toString()}`);
  };

  const handleDateChange = (type: 'startDate' | 'endDate', value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(type, new Date(value).toISOString());
    } else {
      params.delete(type);
    }
    params.set('page', '1'); // Reset to first page
    router.push(`/logs/${encodeURIComponent(logFile)}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="p-4 border-b dark:border-gray-800">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{logFile}</h1>
          <div className="flex items-center space-x-2">
            <Input
              type="datetime-local"
              onChange={e => handleDateChange('startDate', e.target.value)}
              className="bg-white dark:bg-gray-800"
            />
            <Input
              type="datetime-local"
              onChange={e => handleDateChange('endDate', e.target.value)}
              className="bg-white dark:bg-gray-800"
            />
            <Select value={timezone} onValueChange={handleTimezoneChange}>
              <SelectTrigger className="w-48 bg-white dark:bg-gray-800">
                <SelectValue>{timezone === 'local' ? `${browserTz} (Local)` : timezone}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="local">{browserTz} (Local)</SelectItem>
                {commonTimezones.filter(tz => tz !== 'local').map(tz => (
                  <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-4">
          <Input
            placeholder="Search logs..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-gray-800"
          />
        </div>
      </header>
      <main className="flex-1 overflow-y-auto p-4 font-mono text-sm">
        {filteredLogs.map((log, index) => (
          <div key={index} className="flex">
            <div className="w-48 text-gray-500 dark:text-gray-400">
              {log.timestamp
                ? log.timestamp.toLocaleString('en-GB', { timeZone: timezone === 'local' ? browserTz : timezone })
                : '-'}
            </div>
            <div className="flex-1 whitespace-pre-wrap">{log.content}</div>
          </div>
        ))}
      </main>
      <footer className="p-4 border-t dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={() => handlePageChange(1)} disabled={currentPage === 1} variant="outline" size="icon">
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} variant="outline" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} variant="outline" size="icon">
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} variant="outline" size="icon">
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}