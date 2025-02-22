'use client';

import { useState, useEffect } from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { VoiceRecorder } from '@/components/VoiceRecorder';
import { ConversationDisplay } from '@/components/ConversationDisplay';
import { ProcessFlow } from '@/components/ProcessFlow';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { speechToText, textToSpeech } from '@/lib/elevenlabs';
import { processAIResponse } from '@/lib/ai';
import { workflows } from '@/lib/make';
import { analytics, EventTypes } from '@/lib/posthog';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export default function Home() {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStep, setCurrentStep] = useState<string>('start');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      analytics.setUserProperties({
        user_id: user.id,
        email: user.primaryEmailAddress?.emailAddress,
      });
    }
  }, [user]);

  const handleRecordingComplete = async (blob: Blob) => {
    const processId = Date.now().toString();
    setError(null);
    
    try {
      setIsProcessing(true);
      analytics.startProcess(processId, 'voice_processing');

      // 1. 语音转文字
      setCurrentStep('voice');
      analytics.trackEvent(EventTypes.VOICE_RECORDING_COMPLETE);
      const text = await speechToText(blob);

      const userMessage: Message = {
        id: Date.now().toString(),
        content: text,
        isUser: true,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMessage]);

      // 2. AI 处理
      setCurrentStep('process');
      const aiResponse = await processAIResponse(text);
      analytics.trackEvent(EventTypes.AI_RESPONSE_RECEIVED, { 
        response_type: aiResponse.action?.type 
      });

      // 3. 执行自动化工作流
      if (aiResponse.action) {
        setCurrentStep('automation');
        const workflowResult = await workflows.executeWorkflow(
          aiResponse.action.type,
          {
            userId: user?.id,
            ...aiResponse.action.params
          }
        );
        analytics.trackEvent(EventTypes.WORKFLOW_EXECUTED, { 
          workflow_type: aiResponse.action.type,
          result: workflowResult
        });
      }

      // 4. 语音回复
      const audioBuffer = await textToSpeech(aiResponse.text);
      const audioBlob = new Blob([audioBuffer]);
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      await audio.play();

      const aiMessage: Message = {
        id: Date.now().toString(),
        content: aiResponse.text,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);

      setCurrentStep('complete');
      analytics.completeProcess(processId, 'voice_processing', { success: true });

    } catch (error) {
      console.error('Error processing voice:', error);
      analytics.trackError(error as Error, { process_id: processId });
      setError((error as Error).message || '处理失败，请重试');
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
            <CardTitle className="text-2xl font-bold">语音助手</CardTitle>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg">
                  登录
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