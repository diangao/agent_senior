// src/lib/elevenlabs.ts
import axios from 'axios';

const ELEVENLABS_API_KEY = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
const API_BASE_URL = 'https://api.elevenlabs.io/v1';

// 语音转文字
export async function speechToText(audioBlob: Blob): Promise<string> {
  const formData = new FormData();
  formData.append('audio', audioBlob);
  formData.append('model_id', 'whisper-1');

  try {
    const response = await axios.post(
      `${API_BASE_URL}/speech-to-text`,
      formData,
      {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    return response.data.text;
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