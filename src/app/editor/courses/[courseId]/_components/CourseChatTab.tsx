"use client";
import React, { useState, useRef, useEffect } from "react";
import { 
  Send, 
  MessageCircle,
  Users,
  Crown
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";

interface ChatMessage {
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
}

interface CourseChatTabProps {
  courseId: string;
  messages: ChatMessage[];
  currentUser: {
    id: string;
    name: string | null;
  };
  administrators: Array<{
    id: string;
    name: string | null;
  }>;
  onSendMessage: (message: string) => Promise<void>;
  isSending?: boolean;
}

const CourseChatTab: React.FC<CourseChatTabProps> = ({
  courseId,
  messages,
  currentUser,
  administrators,
  onSendMessage,
  isSending = false
}) => {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || isSending) return;

    const messageToSend = newMessage.trim();
    setNewMessage("");
    
    try {
      await onSendMessage(messageToSend);
      inputRef.current?.focus();
    } catch (error) {
      setNewMessage(messageToSend);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString('es-ES', {
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return date.toLocaleDateString('es-ES', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const getInitials = (name: string | null, userId: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return userId.slice(0, 2).toUpperCase();
  };

  const isAdmin = (userId: string) => {
    return administrators.some(admin => admin.id === userId);
  };

  const isCurrentUser = (userId: string) => {
    return userId === currentUser.id;
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <MessageCircle className="h-5 w-5 mr-2" />
            Chat del Curso
          </div>
          <Badge variant="outline" className="flex items-center">
            <Users className="h-3 w-3 mr-1" />
            {messages.length} mensajes
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay mensajes aún
              </h3>
              <p className="text-gray-600">
                Sé el primero en iniciar la conversación
              </p>
            </div>
          ) : (
            messages.map((message, index) => {
              const isOwn = isCurrentUser(message.userId);
              const isAdminUser = isAdmin(message.userId);
              
              return (
                <div
                  key={index}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-2 max-w-[70%] ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className={`text-xs ${isAdminUser ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                        {getInitials(message.userName, message.userId)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className={`${isOwn ? 'text-right' : 'text-left'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-sm font-medium ${isOwn ? 'order-2' : 'order-1'}`}>
                          {isOwn ? 'Tú' : message.userName}
                        </span>
                        {isAdminUser && (
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs px-1 py-0">
                            <Crown className="h-2 w-2 mr-1" />
                            Instructor
                          </Badge>
                        )}
                        <span className={`text-xs text-gray-500 ${isOwn ? 'order-1' : 'order-3'}`}>
                          {formatTimestamp(message.timestamp)}
                        </span>
                      </div>
                      
                      <div
                        className={`
                          inline-block px-3 py-2 rounded-lg text-sm
                          ${isOwn 
                            ? 'bg-blue-500 text-white' 
                            : isAdminUser 
                              ? 'bg-yellow-50 border border-yellow-200 text-gray-900'
                              : 'bg-gray-100 text-gray-900'
                          }
                        `}
                      >
                        {message.message}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="border-t p-4">
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <Input
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Escribe un mensaje..."
              disabled={isSending}
              className="flex-1"
            />
            <Button 
              type="submit" 
              disabled={!newMessage.trim() || isSending}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseChatTab;