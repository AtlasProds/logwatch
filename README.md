# LogWatch

**LogWatch** is an open-source web application for visualizing and managing PM2 application logs on Unix systems. It provides a modern, intuitive dashboard for monitoring, searching, and analyzing logs across all PM2-managed Node.js applications—no SSH or CLI required.

## Features

### 🔍 Log Discovery & Parsing
- **Auto-discovers** log files in `~/.pm2/logs/` (active and rotated logs)
- **Parses** filenames to extract application names and log types (stdout/stderr)
- **Groups** logs by application and type for easy navigation

### 🖥️ Dashboard Interface
- **Grid view** of all detected PM2 applications
- **Status indicators** for active logs (stdout and stderr)
- **File size display** for each log
- **Quick access** to log viewer for each log file

### 📖 Log Viewer
- **View log contents** for any log file (active or rotated)
- **Sidebar** to switch between rotated and active logs for the same app/type
- **Timestamp parsing**: Recognizes and displays ISO and bracketed timestamps
- **Timezone selection**: View timestamps in your preferred timezone
- **Date range filtering**: Filter logs by start/end date
- **Sort order**: Toggle ascending/descending by timestamp
- **Raw view fallback**: Handles logs without timestamps gracefully

### 🛠️ Technical Stack

- **Framework**: Next.js 14+ (App Router, React Server Components)
- **UI**: Tailwind CSS, custom React components, Radix UI primitives
- **Icons**: Lucide React
- **Date/Time**: date-fns, date-fns-tz
- **File Operations**: Node.js `fs/promises`, `os`, `path`
- **TypeScript**: End-to-end type safety

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

3. **Open your browser:**  
   Visit [http://localhost:3000](http://localhost:3000) to access the dashboard.

## Project Structure

```
logwatch/
├── src/
│   ├── app/
│   │   ├── page.tsx            # Dashboard homepage
│   │   └── logs/[logFile]/     # Dynamic log viewer pages
│   ├── components/             # UI components (Card, LogViewer, etc.)
│   ├── lib/                    # Log discovery and parsing logic
├── public/                     # Static assets
├── package.json
└── README.md
```

## How It Works

- **Log Discovery:**  
  On load, LogWatch scans `~/.pm2/logs/` for all log files matching PM2's naming conventions (including rotated logs).
- **Dashboard:**  
  Displays a card for each application, with quick links to view stdout and stderr logs.
- **Log Viewer:**  
  Lets you browse, filter, and sort log entries. Rotated logs are accessible via a sidebar.

## Security

- **Read-only** access to the PM2 logs directory
- **Path sanitization** to prevent directory traversal
- **Localhost-only** by default (see deployment for production security)

## Roadmap

- Real-time log streaming (WebSocket)
- Global search and regex filtering
- Error highlighting and statistics
- Multi-pane view for stdout/stderr comparison
- Authentication for production deployments

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/log-management/)

---

**LogWatch** is in active development. Feedback and contributions are welcome!
