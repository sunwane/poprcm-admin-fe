/**
 * Utility functions để hỗ trợ debugging và monitoring việc sử dụng StatisticsService
 */

export interface ServiceUsageLog {
  timestamp: Date;
  service: string;
  method: string;
  useStatistics: boolean;
  source: 'statistics' | 'direct-api' | 'mock';
  duration: number;
  success: boolean;
  error?: string;
}

class StatisticsDebugger {
  private static logs: ServiceUsageLog[] = [];
  private static readonly MAX_LOGS = 100;

  /**
   * Log sử dụng service
   */
  static logServiceUsage(log: Omit<ServiceUsageLog, 'timestamp'>): void {
    this.logs.unshift({
      ...log,
      timestamp: new Date()
    });

    // Giữ chỉ MAX_LOGS entries
    if (this.logs.length > this.MAX_LOGS) {
      this.logs = this.logs.slice(0, this.MAX_LOGS);
    }

    // Console log cho development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${log.service}] ${log.method}: ${log.source} (${log.duration}ms)`, 
        log.success ? '✓' : '✗', log.error || '');
    }
  }

  /**
   * Lấy logs gần đây
   */
  static getRecentLogs(limit: number = 20): ServiceUsageLog[] {
    return this.logs.slice(0, limit);
  }

  /**
   * Lấy thống kê sử dụng
   */
  static getUsageStats(): {
    totalCalls: number;
    statisticsUsage: number;
    directApiUsage: number;
    mockUsage: number;
    avgDuration: number;
    successRate: number;
  } {
    const total = this.logs.length;
    if (total === 0) {
      return {
        totalCalls: 0,
        statisticsUsage: 0,
        directApiUsage: 0,
        mockUsage: 0,
        avgDuration: 0,
        successRate: 0
      };
    }

    const statisticsCount = this.logs.filter(log => log.source === 'statistics').length;
    const directApiCount = this.logs.filter(log => log.source === 'direct-api').length;
    const mockCount = this.logs.filter(log => log.source === 'mock').length;
    const successCount = this.logs.filter(log => log.success).length;
    const totalDuration = this.logs.reduce((sum, log) => sum + log.duration, 0);

    return {
      totalCalls: total,
      statisticsUsage: (statisticsCount / total) * 100,
      directApiUsage: (directApiCount / total) * 100,
      mockUsage: (mockCount / total) * 100,
      avgDuration: totalDuration / total,
      successRate: (successCount / total) * 100
    };
  }

  /**
   * Clear logs
   */
  static clearLogs(): void {
    this.logs = [];
  }

  /**
   * Export logs as JSON
   */
  static exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

/**
 * Wrapper function để track thời gian thực hiện và log kết quả
 */
export async function trackServiceCall<T>(
  service: string,
  method: string,
  useStatistics: boolean,
  asyncOperation: () => Promise<T>,
  getSource: (result: T, error?: Error) => 'statistics' | 'direct-api' | 'mock'
): Promise<T> {
  const startTime = performance.now();
  let result: T;
  let error: Error | undefined;
  let success = false;

  try {
    result = await asyncOperation();
    success = true;
    return result;
  } catch (err) {
    error = err instanceof Error ? err : new Error(String(err));
    throw error;
  } finally {
    const duration = Math.round(performance.now() - startTime);
    const source = error ? 'mock' : getSource(result!, error);

    StatisticsDebugger.logServiceUsage({
      service,
      method,
      useStatistics,
      source,
      duration,
      success,
      error: error?.message
    });
  }
}

export { StatisticsDebugger };