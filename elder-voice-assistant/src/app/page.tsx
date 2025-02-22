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
        content: 'Recorded Audio Processing',
        isUser: true,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMessage]);

      // TODO: 实际处理语音的逻辑将在这里添加
      // 现在用延时模拟处理过程
      await new Promise(resolve => setTimeout(resolve, 1500));
      setCurrentStep('process');

      // 模拟 AI 响应
      setTimeout(() => {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: 'Understand, let me process your request.',
          isUser: false,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
        setCurrentStep('complete');
        setIsProcessing(false);
      }, 1500);

    } catch (error) {
      console.error('Error processing voice:', error);
      alert('Process failed, please try again.'); 
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4">
        <Card className="w-full">
          <CardHeader className="border-b">
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold">Voice Assistant</CardTitle>
              <SignedIn>
                <UserButton afterSignOutUrl="/"/>
              </SignedIn>
              <SignedOut>
                <SignInButton mode="modal" />
              </SignedOut>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-8">
            {/* 语音录制组件 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <VoiceRecorder onRecordingComplete={handleRecordingComplete} />
            </div>
            
            {/* 流程图组件 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <ProcessFlow currentStep={currentStep} />
            </div>
            
            {/* 对话显示组件 */}
            {messages.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <ConversationDisplay messages={messages} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}