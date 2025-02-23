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
  const recordingStartTime = useRef<number>(0);

  const initRecognition = () => {
    if (typeof window !== 'undefined' && !recognition.current) {
      // @ts-ignore
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognition.current = new SpeechRecognition();
        recognition.current.continuous = false;
        recognition.current.interimResults = true;
        recognition.current.lang = 'en-US';

        recognition.current.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0].transcript)
            .join(' ');
          setRecognizedText(transcript);
          
          // If this is a final result, trigger completion
          if (event.results[0].isFinal) {
            handleRecognitionComplete(transcript);
          }
        };

        recognition.current.onend = () => {
          // Only restart if we're still recording and it's been less than 10 seconds
          if (isRecording && Date.now() - recordingStartTime.current < 10000) {
            recognition.current.start();
          }
        };

        recognition.current.onerror = (event: any) => {
          console.error('Recognition error:', event.error);
          if (event.error === 'no-speech') {
            // Restart recognition if no speech was detected
            if (isRecording) {
              recognition.current.start();
            }
          }
        };
      }
    }
  };

  const handleRecognitionComplete = (text: string) => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
      recognition.current?.stop();
      setIsRecording(false);

      const blob = new Blob(chunks.current, { type: 'audio/wav' });
      onRecordingComplete(blob, text);
      chunks.current = [];
      setRecognizedText('');
    }
  };

  useEffect(() => {
    initRecognition();
    return () => {
      if (recognition.current) {
        recognition.current.stop();
      }
      if (mediaRecorder.current) {
        mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      setRecognizedText('');
      chunks.current = [];
      recordingStartTime.current = Date.now();

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);

      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.current.push(e.data);
        }
      };

      // Start recognition first
      recognition.current.start();
      // Then start recording
      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error starting recording:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      // If we have recognized text, use it immediately
      if (recognizedText) {
        handleRecognitionComplete(recognizedText);
      } else {
        // Otherwise, just stop everything
        mediaRecorder.current.stop();
        mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
        recognition.current?.stop();
        setIsRecording(false);
      }
    }
  };

  return (
    <div className="flex flex-col items-center">
      {recognizedText && (
        <div className="text-sm text-gray-600 mb-4 text-center">
          {recognizedText}
        </div>
      )}
      <button
        onClick={isRecording ? stopRecording : startRecording}
        className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
          isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
        } text-white`}
        disabled={disabled}
      >
        {isRecording ? <Square className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
      </button>
    </div>
  );
};