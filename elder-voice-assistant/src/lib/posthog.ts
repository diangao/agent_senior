// src/lib/posthog.ts
import posthog from 'posthog-js';

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST;

// 初始化 PostHog
if (typeof window !== 'undefined') {
  posthog.init(POSTHOG_KEY!, {
    api_host: POSTHOG_HOST || 'https://app.posthog.com',
  });
}

// 定义事件类型
export const EventTypes = {
  VOICE_RECORDING_START: 'voice_recording_start',
  VOICE_RECORDING_COMPLETE: 'voice_recording_complete',
  VOICE_PROCESSING_ERROR: 'voice_processing_error',
  AI_RESPONSE_RECEIVED: 'ai_response_received',
  WORKFLOW_EXECUTED: 'workflow_executed',
  WORKFLOW_ERROR: 'workflow_error',
} as const;

// 事件追踪函数
export const analytics = {
  trackEvent(eventName: string, properties?: Record<string, any>) {
    posthog.capture(eventName, {
      ...properties,
      timestamp: new Date().toISOString(),
    });
  },

  // 追踪错误
  trackError(error: Error, context?: Record<string, any>) {
    posthog.capture('error', {
      error_message: error.message,
      error_stack: error.stack,
      ...context,
      timestamp: new Date().toISOString(),
    });
  },

  // 设置用户属性
  setUserProperties(properties: Record<string, any>) {
    posthog.people.set(properties);
  },

  // 开始追踪流程
  startProcess(processId: string, processType: string) {
    posthog.capture('process_started', {
      process_id: processId,
      process_type: processType,
      timestamp: new Date().toISOString(),
    });
  },

  // 完成流程
  completeProcess(processId: string, processType: string, result: any) {
    posthog.capture('process_completed', {
      process_id: processId,
      process_type: processType,
      result,
      timestamp: new Date().toISOString(),
    });
  },
};