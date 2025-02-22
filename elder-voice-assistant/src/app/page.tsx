'use client';

import { useState } from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { VoiceRecorder } from '@/components/VoiceRecorder';
import { ConversationDisplay } from '@/components/ConversationDisplay';
import { ProcessFlow } from '@/components/ProcessFlow';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStep, setCurrentStep] = useState<string>('start');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRecordingComplete = async (blob: Blob) => {
    try {
      setIsProcessing(true);
      setCurrentStep('voice');

      // 添加用户消息
      const userMessage: Message = {
        id: Date.now().toString(),
        content: '正在处理您的语音...',
        isUser: true,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMessage]);

      // TODO: 这里会集成 ElevenLabs 进行实际的语音转文字
      setCurrentStep('process');

      // 模拟AI响应
      setTimeout(() => {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: 'Understand, processing your request...',
          isUser: false,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
        setCurrentStep('complete');
        setIsProcessing(false);
      }, 2000);

    } catch (error) {
      console.error('Error processing voice:', error);
      alert('Processing Failed, please try again.');
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gray-50">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold">Voice Assistant</CardTitle>
            <SignedIn>
              <UserButton />
            </SignedIn>
            <SignedOut>
              <SignInButton />
            </SignedOut>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            <VoiceRecorder onRecordingComplete={handleRecordingComplete} />
            <ProcessFlow currentStep={currentStep} />
            <ConversationDisplay messages={messages} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}