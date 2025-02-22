'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square } from "lucide-react";

interface VoiceRecorderProps {
  onRecordingComplete: (blob: Blob, text: string) => void;
  disabled?: boolean;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onRecordingComplete, disabled }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const recognition = useRef<any>(null);
  const chunks = useRef<Blob[]>([]);
  const [isRecognitionReady, setIsRecognitionReady] = useState(false);

  // 初始化语音识别
  const initializeRecognition = () => {
    if (typeof window !== 'undefined') {
      // @ts-ignore
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition && !recognition.current) {
        recognition.current = new SpeechRecognition();
        recognition.current.continuous = true;
        recognition.current.interimResults = true;
        recognition.current.lang = 'en-US';

        recognition.current.onstart = () => {
          console.log('Speech recognition started');
          setIsRecognitionReady(true);
        };

        recognition.current.onend = () => {
          console.log('Speech recognition ended');
          // 如果还在录音但识别停止了，重新启动识别
          if (isRecording) {
            console.log('Restarting speech recognition');
            recognition.current.start();
          }
        };
        
        recognition.current.onresult = (event: any) => {
          let finalTranscript = '';
          let interimTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }

          const currentTranscript = finalTranscript || interimTranscript;
          setRecognizedText(currentTranscript);
          console.log('Recognized text:', currentTranscript);
        };

        recognition.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          // 如果是 'no-speech' 错误，不需要显示错误消息
          if (event.error !== 'no-speech') {
            alert('Speech recognition error: ' + event.error);
          }
        };

        setIsRecognitionReady(true);
      }
    }
  };

  useEffect(() => {
    initializeRecognition();
    return () => {
      if (recognition.current) {
        recognition.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      // 确保语音识别已初始化
      if (!recognition.current) {
        initializeRecognition();
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      chunks.current = [];

      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.current.push(e.data);
        }
      };

      mediaRecorder.current.onstop = () => {
        const blob = new Blob(chunks.current, { type: 'audio/wav' });
        onRecordingComplete(blob, recognizedText);
        chunks.current = [];
        setRecognizedText('');
      };

      // 先启动语音识别，等待一小段时间再开始录音
      await new Promise<void>((resolve) => {
        recognition.current.start();
        setTimeout(resolve, 500);
      });

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Unable to access microphone. Please ensure you have granted permission.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
      if (recognition.current) {
        recognition.current.stop();
      }
      setIsRecording(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-2xl font-bold mb-4">
        {isRecording ? 'Recording...' : 'Click to start speaking'}
      </div>
      {recognizedText && (
        <div className="text-lg text-gray-600 max-w-lg text-center mb-4">
          {recognizedText}
        </div>
      )}
      <button
        onClick={isRecording ? stopRecording : startRecording}
        className={`w-16 h-16 rounded-full flex items-center justify-center ${
          isRecording ? 'bg-red-500' : 'bg-blue-500'
        } text-white`}
        disabled={disabled || !isRecognitionReady}
      >
        {isRecording ? <Square className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
      </button>
    </div>
  );
};