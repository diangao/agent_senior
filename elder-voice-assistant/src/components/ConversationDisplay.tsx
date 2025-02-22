import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface ConversationDisplayProps {
  messages: Message[];
}

export const ConversationDisplay: React.FC<ConversationDisplayProps> = ({ messages }) => {
  return (
    <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto p-4">
      {messages.map((message) => (
        <Card
          key={message.id}
          className={`${
            message.isUser ? 'ml-auto bg-blue-50' : 'mr-auto bg-gray-50'
          } max-w-[80%]`}
        >
          <CardContent className="p-4">
            <div className="text-lg">
              {message.content}
            </div>
            <div className="text-sm text-gray-500 mt-2">
              {message.timestamp.toLocaleTimeString()}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};