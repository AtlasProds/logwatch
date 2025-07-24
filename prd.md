# LogWatch - PM2 Logs Visualizer
## Product Requirements Document

### Overview
LogWatch is an open-source React-based web application that provides real-time visualization and management of PM2 application logs on Unix machines. It runs as a PM2-managed service and offers an intuitive web interface for monitoring, searching, and analyzing logs across all PM2 processes.

### Problem Statement
PM2 generates extensive log files that become difficult to manage and analyze, especially with logrotate creating timestamped archive files. Developers need a unified interface to view, search, and monitor logs across multiple applications without SSH access or command-line tools.

### Target Users
- DevOps engineers managing PM2 deployments
- Node.js developers monitoring application health
- System administrators overseeing multiple services
- Teams requiring centralized log monitoring

### Core Features

#### 1. Log Discovery & Parsing
- **Auto-discovery**: Scan `~/.pm2/logs/` directory for all log files
- **File Pattern Recognition**: Parse both active logs (`app-out.log`, `app-error.log`) and rotated logs (`app-out__YYYY-MM-DD_HH-mm-ss.log`)
- **Process Mapping**: Extract application names, ports, and log types from filenames
- **Real-time Monitoring**: Watch for new log files and changes using filesystem events

#### 2. Dashboard Interface
- **Process Overview**: Grid view showing all PM2 applications with status indicators
- **Log Type Segregation**: Separate views for stdout and stderr logs
- **File Size Indicators**: Visual representation of log file sizes and growth
- **Last Updated Timestamps**: Show when each log was last modified

#### 3. Log Viewer
- **Real-time Streaming**: Live tail functionality for active log files
- **Historical Browse**: Navigate through rotated log files by date
- **Multi-pane View**: Side-by-side comparison of stdout/stderr
- **Auto-scroll Control**: Toggle between following live logs and static viewing
- **Line Numbers**: Optional line numbering for reference

#### 4. Search & Filtering
- **Global Search**: Search across all applications and log types
- **Application-specific Filtering**: Focus on individual processes
- **Date Range Selection**: Filter logs by time periods
- **Log Level Filtering**: Filter by INFO, WARN, ERROR levels (when structured)
- **Regex Support**: Advanced pattern matching capabilities

#### 5. Log Analysis
- **Error Highlighting**: Automatic detection and highlighting of error patterns
- **Timestamp Parsing**: Parse and display ISO timestamps in readable format
- **JSON Log Support**: Pretty-print JSON-formatted log entries
- **Statistics Panel**: Show error counts, log volume metrics
- **Trend Visualization**: Simple charts showing log activity over time

### Technical Architecture

#### Next.js Full-Stack Application
- **Server Actions**: Handle file system operations, log reading, and search functionality
- **API Routes**: WebSocket endpoints for real-time log streaming
- **File System Monitoring**: Server-side `fs.watch()` and `chokidar` for log changes
- **Streaming Responses**: Next.js streaming for efficient log delivery
- **React Server Components**: Server-side rendering for better performance

#### Frontend (Next.js Client)
- **Component Architecture**: Modular React components with server/client separation
- **State Management**: React hooks and Context API for client state
- **Real-time Updates**: WebSocket integration for live log streaming
- **Virtual Scrolling**: Efficient rendering of large log datasets
- **Responsive Design**: Tailwind CSS for mobile-friendly interface

#### Key Libraries
- **Framework**: Next.js 14+ (App Router)
- **File Monitoring**: chokidar, fast-glob
- **WebSocket**: ws or Socket.io for real-time streaming
- **UI**: Tailwind CSS, React Virtual, Lucide React icons
- **Utilities**: date-fns for timestamp parsing

### PM2 Log Structure Understanding

Based on research, PM2 maintains logs as follows:

#### Standard Log Files
- **Output logs**: `{app-name}-out.log` - stdout from applications
- **Error logs**: `{app-name}-error.log` - stderr from applications  
- **Process-specific**: Include port numbers when specified (e.g., `app-3000-out.log`)

#### Logrotate Integration
When `pm2-logrotate` is active:
- **Rotation Pattern**: `{app-name}-{type}__{YYYY-MM-DD}_{HH-mm-ss}.log`
- **Size-based Rotation**: Default 10MB max size before rotation
- **Retention**: Configurable number of archived files to keep
- **Compression**: Optional gzip compression of rotated files

#### File Location
- **Default Path**: `~/.pm2/logs/`
- **Structure**: Flat directory with descriptive filenames
- **Permissions**: Readable by PM2 user

### Installation & Deployment

#### Package Structure
```
logwatch/
├── package.json
├── ecosystem.config.js    # PM2 configuration
├── next.config.js         # Next.js configuration
├── app/                   # Next.js app router
│   ├── page.tsx          # Dashboard homepage
│   ├── logs/             # Log viewer pages
│   ├── api/              # API routes for WebSocket
│   └── actions/          # Server actions for file operations
├── components/           # Reusable React components
├── lib/                 # Utilities and server-side logic
├── public/              # Static assets
├── scripts/
│   ├── install.sh       # Installation script
│   └── uninstall.sh     # Cleanup script
└── README.md
```

#### Installation Flow
1. **Clone Repository**: `git clone https://github.com/user/logwatch`
2. **Install Dependencies**: `npm install`
3. **Build Application**: `npm run build`
4. **PM2 Setup**: `pm2 start ecosystem.config.js`
5. **Access Interface**: Open browser to `http://localhost:3001`

#### PM2 Configuration
```javascript
module.exports = {
  apps: [{
    name: 'logwatch',
    script: 'npm',
    args: 'start',
    instances: 1,
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
      PM2_HOME: process.env.PM2_HOME || `${process.env.HOME}/.pm2`
    }
  }]
}
```

### Security Considerations
- **File Access**: Read-only access to PM2 logs directory
- **Network Binding**: Default localhost-only access
- **Authentication**: Optional basic authentication for production
- **Path Traversal**: Sanitize file path inputs to prevent directory traversal

### Performance Requirements
- **Startup Time**: < 3 seconds to first meaningful paint
- **Log Streaming**: Handle 1000+ lines/second real-time streaming
- **Search Performance**: < 2 seconds for searches across 100MB+ logs
- **Memory Usage**: < 100MB RAM footprint
- **CPU Usage**: < 5% CPU during normal operation

