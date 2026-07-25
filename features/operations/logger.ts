import 'server-only';

type LogContext = Record<
  string,
  boolean | number | string | null | undefined
>;

function writeLog(
  level: 'error' | 'info' | 'warn',
  message: string,
  context: LogContext = {},
) {
  const record = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context,
  });

  if (level === 'error') {
    console.error(record);
    return;
  }

  if (level === 'warn') {
    console.warn(record);
    return;
  }

  console.info(record);
}

export const logger = {
  error: (message: string, context?: LogContext) =>
    writeLog('error', message, context),
  info: (message: string, context?: LogContext) =>
    writeLog('info', message, context),
  warn: (message: string, context?: LogContext) =>
    writeLog('warn', message, context),
};
