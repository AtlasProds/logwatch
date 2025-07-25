
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { parseLogContent, ParsedLogLine } from './log-parser';

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


export async function getLogContent(
  logFileName: string,
  startDate?: Date,
  endDate?: Date
): Promise<ParsedLogLine[]> {
  const logDir = path.join(os.homedir(), '.pm2', 'logs');
  
  const activeMatch = logFileName.match(/(.+)-(out|error)\.log$/);
  const rotatedMatch = logFileName.match(/(.+)-(out|error)__(\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2})\.log$/);

  let appName: string;
  let logType: 'out' | 'error';

  if (activeMatch) {
    [, appName, logType] = activeMatch as [string, string, 'out' | 'error'];
  } else if (rotatedMatch) {
    [, appName, logType] = rotatedMatch as [string, string, 'out' | 'error'];
  } else {
    console.error(`Invalid log file name format: ${logFileName}`);
    return [];
  }

  const allFilesInDir = await fs.readdir(logDir);
  
  const appLogFiles: { filePath: string; timestamp?: Date }[] = [];
  const fileRegex = new RegExp(
    `^${appName.replace(/[^a-zA-Z0-9-]/g, '\\$&')}-${logType}((__\\d{4}-\\d{2}-\\d{2}_\\d{2}-\\d{2}-\\d{2})?)\\.log$`
  );

  for (const file of allFilesInDir) {
    if (fileRegex.test(file)) {
      const currentRotatedMatch = file.match(/.+__(\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2})\.log$/);
      let fileTimestamp: Date | undefined;
      if (currentRotatedMatch) {
        const tsString = currentRotatedMatch[1];
        const [datePart, timePart] = tsString.split('_');
        const [year, month, day] = datePart.split('-');
        const [hour, minute, second] = timePart.split('-');
        fileTimestamp = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second));
      }
      appLogFiles.push({ filePath: path.join(logDir, file), timestamp: fileTimestamp });
    }
  }

  let filesToRead = appLogFiles;
  if (startDate || endDate) {
      filesToRead = appLogFiles.filter(file => {
          if (!file.timestamp) return true; // Always include active log
          const startOk = !startDate || file.timestamp >= startDate;
          const endOk = !endDate || file.timestamp <= endDate;
          return startOk && endOk;
      });
  }

  let combinedContent = '';
  for (const { filePath } of filesToRead) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      combinedContent += content;
    } catch (e) {
      console.error(`Could not read file ${filePath}`, e);
    }
  }

  let allLines = parseLogContent(combinedContent);

  if (startDate || endDate) {
    allLines = allLines.filter(line => {
      if (!line.timestamp) return false;
      const startOk = !startDate || line.timestamp >= startDate;
      const endOk = !endDate || line.timestamp <= endDate;
      return startOk && endOk;
    });
  }

  allLines.sort((a, b) => {
    if (a.timestamp && b.timestamp) {
      return a.timestamp.getTime() - b.timestamp.getTime();
    }
    if (a.timestamp) return -1;
    if (b.timestamp) return 1;
    return 0;
  });

  return allLines;
}
