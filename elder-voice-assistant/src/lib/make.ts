// src/lib/make.ts
import axios from 'axios';

const MAKE_WEBHOOK_URL = process.env.NEXT_PUBLIC_MAKE_WEBHOOK_URL;

interface WorkflowResult {
  success: boolean;
  message: string;
  data?: any;
}

export async function executeWorkflow(type: string, params: Record<string, any>): Promise<WorkflowResult> {
  try {
    const response = await axios.post(MAKE_WEBHOOK_URL!, {
      action: type,
      params,
      timestamp: new Date().toISOString()
    });

    return {
      success: true,
      message: '操作执行成功',
      data: response.data
    };
  } catch (error) {
    console.error('Workflow execution error:', error);
    throw new Error('自动化流程执行失败');
  }
}

// 预定义的工作流
export const workflows = {
  // 连接设备工作流
  async connectDevice(deviceType: string, userId: string) {
    return executeWorkflow('CONNECT_DEVICE', { deviceType, userId });
  },

  // 注册应用工作流
  async registerApp(appType: string, userId: string, userInfo: any) {
    return executeWorkflow('REGISTER_APP', { appType, userId, userInfo });
  },

  // 通知家人工作流
  async notifyFamily(userId: string, message: string) {
    return executeWorkflow('NOTIFY_FAMILY', { userId, message });
  }
};