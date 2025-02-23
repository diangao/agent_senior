'use client';

import { useState } from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { VoiceRecorder } from '@/components/VoiceRecorder';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Add a message counter for unique IDs
let messageIdCounter = 0;
const getUniqueId = () => `msg_${Date.now()}_${messageIdCounter++}`;

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  actions?: Action[];
}

interface Action {
  label: string;
  handler: () => void;
}

const scenarios = {
  emergency: {
    text: "I'll help you connect with emergency services or notify your family members.",
    actions: [
      {
        label: "Connect with Emergency Services",
        response: "Connecting you to emergency services... Please stay on the line."
      },
      {
        label: "Notify Family Members",
        response: "I'm notifying your emergency contacts. They will be contacted immediately."
      }
    ]
  },
  bloodPressure: {
    text: "I can help you with your blood pressure monitor. What would you like to do?",
    actions: [
      {
        label: "Connect New Device",
        response: "Let's connect your blood pressure monitor. First, please ensure Bluetooth is enabled."
      },
      {
        label: "View Previous Readings",
        response: "Here are your recent blood pressure readings..."
      }
    ]
  },
  medication: {
    text: "I can help you with medication management. What would you like to do?",
    actions: [
      {
        label: "Set Medication Reminder",
        response: "Let's set up a reminder for your medication. What time would you like to be reminded?"
      },
      {
        label: "View Medication Schedule",
        response: "Here is your current medication schedule..."
      }
    ]
  }
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAction = (actionResponse: string) => {
    const aiMessage: Message = {
      id: getUniqueId(),
      content: actionResponse,
      isUser: false,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, aiMessage]);
  };

  const handleRecordingComplete = async (blob: Blob, text: string) => {
    if (!text.trim()) return;

    try {
      setIsProcessing(true);

      // Add user message
      const userMessage: Message = {
        id: getUniqueId(),
        content: text,
        isUser: true,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMessage]);

      // Determine scenario based on keywords
      let scenario;
      const lowerText = text.toLowerCase();
      if (lowerText.includes('emergency') || lowerText.includes('help')) {
        scenario = scenarios.emergency;
      } else if (lowerText.includes('blood') || lowerText.includes('pressure')) {
        scenario = scenarios.bloodPressure;
      } else if (lowerText.includes('medicine') || lowerText.includes('medication')) {
        scenario = scenarios.medication;
      }

      if (scenario) {
        const aiMessage: Message = {
          id: getUniqueId(),
          content: scenario.text,
          isUser: false,
          timestamp: new Date(),
          actions: scenario.actions.map(action => ({
            label: action.label,
            handler: () => handleAction(action.response)
          }))
        };
        setMessages(prev => [...prev, aiMessage]);
      }

    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-xl mx-auto">
        <div className="flex justify-between items-center mb-4 p-4 bg-white rounded-lg shadow">
          <h1 className="text-xl font-bold">Voice Assistant</h1>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="outline">Sign In</Button>
            </SignInButton>
          </SignedOut>
        </div>

        <Card>
          <CardContent className="p-6">
            <SignedIn>
              <div className="space-y-6">
                <div className="space-y-4 mb-6 min-h-[300px]">
                  {messages.map((message) => (
                    <div key={message.id} className="space-y-2">
                      <div
                        className={`p-4 rounded-lg ${
                          message.isUser 
                            ? 'bg-blue-100 ml-auto max-w-[80%]' 
                            : 'bg-gray-100 mr-auto max-w-[80%]'
                        }`}
                      >
                        <p className="text-gray-800">{message.content}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                      {message.actions && (
                        <div className="mt-2 space-y-2">
                          {message.actions.map((action, index) => (
                            <Button
                              key={`${message.id}_action_${index}`}
                              onClick={action.handler}
                              className="w-full"
                              variant="outline"
                            >
                              {action.label}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="sticky bottom-0 bg-white p-4 rounded-lg shadow">
                  <VoiceRecorder 
                    onRecordingComplete={handleRecordingComplete}
                    disabled={isProcessing} 
                  />
                </div>
              </div>
            </SignedIn>
            <SignedOut>
              <div className="text-center py-10">
                <h2 className="text-xl font-semibold mb-4">
                  Please sign in to use the Voice Assistant
                </h2>
                <SignInButton mode="modal">
                  <Button size="lg">
                    Sign In to Continue
                  </Button>
                </SignInButton>
              </div>
            </SignedOut>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}