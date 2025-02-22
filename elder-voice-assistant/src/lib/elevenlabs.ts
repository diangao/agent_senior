// src/lib/elevenlabs.ts
import axios from 'axios';

const ELEVENLABS_API_KEY = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
const API_BASE_URL = 'https://api.elevenlabs.io/v1';

// 语音转文字（使用临时的模拟实现，因为 ElevenLabs 目前不提供 STT 服务）
export async function speechToText(audioBlob: Blob): Promise<string> {
  try {
    // 创建临时的音频URL用于调试
    const audioUrl = URL.createObjectURL(audioBlob);
    console.log('Audio URL created:', audioUrl);

    // 由于 ElevenLabs 不直接提供 STT，这里先返回模拟数据
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('您好，我需要帮助设置我的智能设备。');
      }, 1000);
    });
  } catch (error) {
    console.error('Speech to text error:', error);
    throw new Error('语音识别失败，请重试');
  }
}

// 文字转语音
export async function textToSpeech(text: string): Promise<ArrayBuffer> {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/text-to-speech/21m00Tcm4TlvDq8ikWAM`,
      {
        text,
        voice_settings: {
          stability: 0.75,
          similarity_boost: 0.75,
        },
      },
      {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        responseType: 'arraybuffer',
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Text to speech error:', error);
    throw new Error('语音合成失败，请重试');
  }
}