import { parse, isValid } from 'date-fns';

export interface ParsedLogLine {
  originalLine: string;
  timestamp: Date | null;
  content: string;
}

const dateFormats = [
  // Format one: [2025-07-24 00:00:03.617]
  {
    regex: /^\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3})\]/,
    format: 'yyyy-MM-dd HH:mm:ss.SSS',
  },
  // Format two: 2025-07-21T03:45:49.395Z
  {
    regex: /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/,
    format: "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
  },
  // Format three: 2025-07-21T11:03:22+05:30
  {
    regex: /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2})/,
    format: "yyyy-MM-dd'T'HH:mm:ssXXX",
  },
];

export function parseLogLine(line: string): ParsedLogLine {
  for (const { regex, format } of dateFormats) {
    const match = line.match(regex);
    if (match) {
      const dateStr = match[1];
      const parsedDate = parse(dateStr, format, new Date());
      
      if (isValid(parsedDate)) {
        return {
          originalLine: line,
          timestamp: parsedDate,
          content: line.substring(match[0].length).trim(),
        };
      }
    }
  }

  // If no format matches, return the line without a timestamp
  return {
    originalLine: line,
    timestamp: null,
    content: line,
  };
}

export function parseLogContent(content: string): ParsedLogLine[] {
  return content.split('\n').map(parseLogLine);
} 
