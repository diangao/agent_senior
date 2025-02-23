'use client';

import { useState, useCallback } from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { VoiceRecorder } from '@/components/VoiceRecorder';
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  actions?: Action[];
  status?: 'pending' | 'success' | 'error';
}

interface Action {
  label: string;
  handler: () => void;
  type?: 'primary' | 'secondary' | 'danger';
  response?: string;
  nextActions?: Action[];
}

let messageIdCounter = 0;
const getUniqueId = () => `msg_${Date.now()}_${messageIdCounter++}`;

const getEmergencyContacts = () => {
  const savedMembers = localStorage.getItem('familyMembers');
  if (savedMembers) {
    const members = JSON.parse(savedMembers);
    return members.filter((member: any) => member.isEmergencyContact);
  }
  return [];
};

const scenarios = {
  emergency: {
    text: "I'll help you connect with emergency services or notify your family members. What would you like me to do?",
    actions: [
      {
        label: "Connect with Emergency Services",
        type: "danger",
        response: "Emergency services have been notified. They are on their way.",
        nextActions: [
          {
            label: "Track Response Status",
            response: "Emergency response team is 5 minutes away..."
          }
        ]
      },
      {
        label: "Notify Family Members",
        response: "Family members have been notified. They will contact you shortly.",
        nextActions: [
          {
            label: "Send Status Update",
            response: "Sending status update to family members..."
          }
        ]
      }
    ]
  },
  health: {
    text: "I can help you with health monitoring. What would you like to do?",
    actions: [
      {
        label: "Connect Blood Pressure Monitor",
        response: "Blood pressure monitor connected successfully.",
        nextActions: [
          {
            label: "Start Measurement",
            response: "Starting blood pressure measurement..."
          },
          {
            label: "View Previous Readings",
            response: "Here are your recent readings: 120/80 (Yesterday), 118/79 (2 days ago)"
          }
        ]
      },
      {
        label: "Set Health Reminders",
        response: "What kind of reminder would you like to set?",
        nextActions: [
          {
            label: "Medication Reminder",
            response: "Medication reminder set for 9:00 AM daily"
          },
          {
            label: "Exercise Reminder",
            response: "Exercise reminder set for 3:00 PM daily"
          }
        ]
      }
    ]
  }
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();


  const handleAction = useCallback(async (action: Action) => {
    setIsProcessing(true);
    const actionMessage: Message = {
      id: getUniqueId(),
      content: `Processing: ${action.label}...`,
      isUser: false,
      timestamp: new Date(),
      status: 'pending'
    };
    setMessages(prev => [...prev, actionMessage]);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate processing

      let responseMessage = '';
      
      // Handle different action types
      if (action.label === "Notify Family Members") {
        const emergencyContacts = getEmergencyContacts();
        if (emergencyContacts.length > 0) {
          const contactsList = emergencyContacts
            .map((contact: any) => `${contact.name} (${contact.phone})`)
            .join(', ');
          responseMessage = `Notifying emergency contacts: ${contactsList}`;
        } else {
          responseMessage = "No emergency contacts found. Please add emergency contacts in your profile.";
        }
      } else {
        responseMessage = action.response || `${action.label} has been processed successfully.`;
      }

      const resultMessage: Message = {
        id: getUniqueId(),
        content: responseMessage,
        isUser: false,
        timestamp: new Date(),
        status: 'success'
      };

      setMessages(prev => prev.map(msg => 
        msg.id === actionMessage.id ? resultMessage : msg
      ));

      if (action.nextActions) {
        const nextActionMessage: Message = {
          id: getUniqueId(),
          content: "What would you like to do next?",
          isUser: false,
          timestamp: new Date(),
          actions: action.nextActions.map(nextAction => ({
            ...nextAction,
            handler: () => handleAction(nextAction)
          }))
        };
        setMessages(prev => [...prev, nextActionMessage]);
      }
    } catch (error) {
      console.error('Action execution error:', error);
      const errorMessage: Message = {
        id: getUniqueId(),
        content: 'Sorry, there was an error executing the action. Please try again.',
        isUser: false,
        timestamp: new Date(),
        status: 'error'
      };
      setMessages(prev => prev.map(msg => 
        msg.id === actionMessage.id ? errorMessage : msg
      ));
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleRecordingComplete = useCallback(async (blob: Blob, text: string) => {
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
      } else if (lowerText.includes('health') || lowerText.includes('monitor')) {
        scenario = scenarios.health;
      }

      if (scenario) {
        const aiMessage: Message = {
          id: getUniqueId(),
          content: scenario.text,
          isUser: false,
          timestamp: new Date(),
          actions: scenario.actions.map(action => ({
            ...action,
            handler: () => handleAction(action)
          }))
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        // Default response if no scenario matches
        const defaultMessage: Message = {
          id: getUniqueId(),
          content: "I'm not sure how to help with that. Could you please try rephrasing your request?",
          isUser: false,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, defaultMessage]);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [handleAction]);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-xl mx-auto">
        {/* Header with Profile Link */}
        <div className="flex justify-between items-center mb-4 p-4 bg-white rounded-lg shadow">
          <h1 className="text-xl font-bold">Voice Assistant</h1>
          <div className="flex items-center gap-4">
            <SignedIn>
              <Button variant="outline" onClick={() => router.push('/profile')}>
                Family Contacts
              </Button>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="outline">Sign In</Button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <SignedIn>
              <div className="space-y-6">
                <div className="space-y-4 mb-6 min-h-[300px] max-h-[600px] overflow-y-auto">
                  {messages.map((message) => (
                    <div key={message.id} className="space-y-2">
                      <div
                        className={`p-4 rounded-lg ${
                          message.isUser 
                            ? 'bg-blue-100 ml-auto max-w-[80%]' 
                            : 'bg-gray-100 mr-auto max-w-[80%]'
                        } ${
                          message.status === 'error' ? 'border-red-500 border' :
                          message.status === 'success' ? 'border-green-500 border' :
                          message.status === 'pending' ? 'border-yellow-500 border' : ''
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
                              variant={action.type === 'danger' ? 'destructive' : 'outline'}
                              disabled={isProcessing}
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