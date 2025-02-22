// src/lib/ai.ts
import axios from 'axios';

const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

interface AIResponse {
  text: string;
  action?: {
    type: 'CONNECT_DEVICE' | 'REGISTER_APP' | 'NOTIFY_FAMILY';
    params?: Record<string, any>;
  };
}

export async function processAIResponse(userInput: string): Promise<AIResponse> {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: '你是一个专门帮助老年人使用智能设备的助手。请用简单、清晰的语言回答。'
          },
          {
            role: 'user',
            content: userInput
          }
        ],
        temperature: 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        }
      }
    );

    // 解析 AI 响应，识别可能的操作指令
    const aiText = response.data.choices[0].message.content;
    const action = parseActionFromText(aiText);

    return {
      text: aiText,
      action
    };
  } catch (error) {
    console.error('AI processing error:', error);
    throw new Error('AI处理失败，请重试');
  }
}

function parseActionFromText(text: string): AIResponse['action'] | undefined {
  // 根据关键词识别可能的操作
  if (text.includes('连接设备') || text.includes('配对')) {
    return {
      type: 'CONNECT_DEVICE',
      params: {
        deviceType: 'bloodPressure'  // 可以根据具体对话内容识别设备类型
      }
    };
  }
  
  if (text.includes('注册') || text.includes('账号')) {
    return {
      type: 'REGISTER_APP',
      params: {
        appType: 'health'
      }
    };
  }

  if (text.includes('通知家人') || text.includes('联系家属')) {
    return {
      type: 'NOTIFY_FAMILY'
    };
  }

  return undefined;
}