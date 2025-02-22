// src/lib/ai.ts
import axios from 'axios';

const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

console.log('API Key loaded:', OPENAI_API_KEY ? 'YES' : 'NO'); // Debug log

interface AIResponse {
  text: string;
  action?: {
    type: 'CONNECT_DEVICE' | 'REGISTER_APP' | 'NOTIFY_FAMILY';
    params?: Record<string, any>;
  };
}

export async function processAIResponse(userInput: string): Promise<AIResponse> {
  // For testing, just return a mock response
  return {
    text: 'Understood, please make sure your device is turned on and within range.',
    action: {
      type: 'CONNECT_DEVICE',
      params: {
        deviceType: 'bloodPressure'
      }
    }
  };


  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant for elderly users, providing support for health management and device setup.'
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

    const aiText = response.data.choices[0].message.content;
    const action = parseActionFromText(aiText);

    return {
      text: aiText,
      action
    };
  } catch (error) {
    console.error('AI processing error:', error);
    return {
      text: '抱歉，我现在遇到了一些问题。请稍后再试。',
    };
  }
  
}

function parseActionFromText(text: string): AIResponse['action'] | undefined {
  if (text.includes('Connect Device') || text.includes('Pair Device')) {
    return {
      type: 'CONNECT_DEVICE',
      params: {
        deviceType: 'bloodPressure'
      }
    };
  }
  
  if (text.includes('register') || text.includes('account')) {
    return {
      type: 'REGISTER_APP',
      params: {
        appType: 'health'
      }
    };
  }

  if (text.includes('Notify familt') || text.includes('contact family')) {
    return {
      type: 'NOTIFY_FAMILY'
    };
  }

  return undefined;
}