
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

export interface LogFile {
  appName: string;
  logType: 'out' | 'error';
  filePath: string;
  size: number;
  lastModified: Date;
  isRotated: boolean;
  timestamp?: Date;
}

export async function getLogFiles(): Promise<LogFile[]> {
  const logDir = path.join(os.homedir(), '.pm2', 'logs');
  try {
    const files = await fs.readdir(logDir);
    const logFiles: LogFile[] = [];

    for (const file of files) {
      const filePath = path.join(logDir, file);
      const stats = await fs.stat(filePath);

      const rotatedMatch = file.match(/(.+)-(out|error)__(\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2})\.log$/);
      const activeMatch = file.match(/(.+)-(out|error)\.log$/);

      if (rotatedMatch) {
        const [, appName, logType, timestampStr] = rotatedMatch;
        // Parse timestamp string in format YYYY-MM-DD_HH-mm-ss
        let timestamp: Date | undefined = undefined;
        if (/^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}$/.test(timestampStr)) {
          // Convert to ISO string: 'YYYY-MM-DDTHH:mm:ss'
          const iso = timestampStr.replace('_', 'T').replace(/-/g, ':').replace('T', 'T').replace(/:(\d{2}):(\d{2})$/, ':$1:$2');
          // Actually, just split and join for safety
          const [date, time] = timestampStr.split('_');
          const [year, month, day] = date.split('-');
          const [hour, min, sec] = time.split('-');
          timestamp = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(min), Number(sec));
        }
        logFiles.push({
          appName,
          logType: logType as 'out' | 'error',
          filePath,
          size: stats.size,
          lastModified: stats.mtime,
          isRotated: true,
          timestamp,
        });
      } else if (activeMatch) {
        const [, appName, logType] = activeMatch;
        logFiles.push({
          appName,
          logType: logType as 'out' | 'error',
          filePath,
          size: stats.size,
          lastModified: stats.mtime,
          isRotated: false,
        });
      }
    }
    return logFiles.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());
  } catch (error) {
    console.error('Error reading log directory:', error);
    return [];
  }
}
