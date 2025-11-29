import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Sanitize sessionId to prevent path traversal attacks
function sanitizeSessionId(sessionId: string): string {
  // Remove any path traversal characters and limit to alphanumeric, dashes, and underscores
  return sessionId.replace(/[^a-zA-Z0-9\-_]/g, '').substring(0, 50);
}

export async function POST(request: NextRequest) {
  try {
    const logData = await request.json();

    // Create log entry with sanitized sessionId
    const logEntry = {
      timestamp: logData.timestamp,
      taskId: logData.taskId,
      passed: logData.passed,
      executionTime: logData.executionTime,
      error: logData.error,
      description: logData.description,
      cartItemCount: logData.cartItemCount,
      currentStore: logData.currentStore,
      userAgent: logData.userAgent,
      url: logData.url,
      sessionId: sanitizeSessionId(
        logData.sessionId || generateSessionId(logData.userAgent, logData.timestamp)
      ),
    };

    // Create logs directory if it doesn't exist
    const logsDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    // Create log file path with session ID and date
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const logFilePath = path.join(logsDir, `session-${logEntry.sessionId}-${today}.log`);

    // Format log entry for file
    const logLine = `${logEntry.timestamp} | ${logEntry.taskId} | ${logEntry.passed ? 'PASS' : 'FAIL'} | ${logEntry.executionTime}ms | ${logEntry.currentStore} | ${logEntry.cartItemCount} items${logEntry.error ? ` | ERROR: ${logEntry.error}` : ''}\n`;

    // Append to session-specific log file
    fs.appendFileSync(logFilePath, logLine, 'utf8');

    // Also maintain a JSON log for structured data per session
    const jsonLogPath = path.join(logsDir, `session-${logEntry.sessionId}-${today}.json`);
    let jsonLogs = [];

    if (fs.existsSync(jsonLogPath)) {
      try {
        const existingData = fs.readFileSync(jsonLogPath, 'utf8');
        jsonLogs = JSON.parse(existingData);
      } catch (_parseError) {
        console.warn('Failed to parse existing JSON log, starting fresh');
        jsonLogs = [];
      }
    }

    jsonLogs.push(logEntry);
    fs.writeFileSync(jsonLogPath, JSON.stringify(jsonLogs, null, 2), 'utf8');

    // Also maintain a master log that tracks all sessions
    const masterLogPath = path.join(logsDir, `all-sessions-${today}.log`);
    const masterLogLine = `${logEntry.timestamp} | ${logEntry.sessionId} | ${logEntry.taskId} | ${logEntry.passed ? 'PASS' : 'FAIL'} | ${logEntry.executionTime}ms | ${logEntry.currentStore} | ${logEntry.cartItemCount} items${logEntry.error ? ` | ERROR: ${logEntry.error}` : ''}\n`;
    fs.appendFileSync(masterLogPath, masterLogLine, 'utf8');

    return NextResponse.json({ success: true, logged: true });
  } catch (error) {
    console.error('Failed to log execution:', error);
    return NextResponse.json({ success: false, error: 'Failed to log execution' }, { status: 500 });
  }
}

// Generate a secure session ID using crypto.randomUUID()
function generateSessionId(userAgent: string, timestamp: string): string {
  // Use crypto.randomUUID() for cryptographically secure randomness
  const uuid = crypto.randomUUID();
  const timeHash = new Date(timestamp).getTime().toString().slice(-6);
  return `session-${uuid.split('-')[0]}-${timeHash}`;
}
