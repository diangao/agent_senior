'use client';

import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Mic, Square } from "lucide-react";

interface VoiceRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  const startRecording = async () => {
    console.log('Starting recording...'); // 调试日志
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true,
        video: false 
      });
      
      mediaRecorder.current = new MediaRecorder(stream);
      chunks.current = [];

      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.current.push(e.data);
        }
      };

      mediaRecorder.current.onstop = () => {
        const blob = new Blob(chunks.current, { type: 'audio/wav' });
        onRecordingComplete(blob);
        chunks.current = [];
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Cannot access microphone, please check your permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <h2 className="text-3xl font-bold">
        {isRecording ? 'Recording...' : 'Click to Record'}
      </h2>
      
      {/* 主录音按钮 */}
      <Button
        onClick={isRecording ? stopRecording : startRecording}
        variant={isRecording ? "destructive" : "default"}
        className="h-24 w-24 rounded-full shadow-lg hover:shadow-xl transition-all"
      >
        {isRecording ? (
          <Square className="h-12 w-12" />
        ) : (
          <Mic className="h-12 w-12" />
        )}
      </Button>

      {/* 状态提示 */}
      <p className="text-gray-600 text-lg">
        {isRecording ? 'Click to process recording' : 'Reday'}
      </p>
    </div>
  );
};