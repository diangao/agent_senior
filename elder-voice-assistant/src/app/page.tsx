'use client';

import { useState } from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { VoiceRecorder } from '@/components/VoiceRecorder';
import { ConversationDisplay } from '@/components/ConversationDisplay';
import { ProcessFlow } from '@/components/ProcessFlow';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { processAIResponse } from '@/lib/ai';

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
  const [error, setError] = useState<string | null>(null);

  const handleRecordingComplete = async (blob: Blob, text: string) => {
    try {
      setIsProcessing(true);
      setError(null);
      setCurrentStep('voice');

      // 使用实际识别的文字，如果没有识别到则提示用户重试
      if (!text.trim()) {
        setError('未能识别到语音，请重新尝试');
        return;
      }

      // 添加用户消息，使用实际识别的文本
      const userMessage: Message = {
        id: Date.now().toString(),
        content: text,  // 直接使用识别的文本
        isUser: true,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMessage]);

      // 处理 AI 响应
      setCurrentStep('process');
      const aiResponse = await processAIResponse(text);  // 使用识别的文本

      // 添加 AI 响应消息
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse.text,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);

      setCurrentStep('complete');
    } catch (error) {
      console.error('Error:', error);
      setError('Error while processing, please try again.');
      setCurrentStep('start');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gray-50">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold">Voice Assistant</CardTitle>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg">
                  Login
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <VoiceRecorder 
              onRecordingComplete={handleRecordingComplete}
              disabled={isProcessing} 
            />
            <ProcessFlow currentStep={currentStep} />
            <ConversationDisplay messages={messages} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}