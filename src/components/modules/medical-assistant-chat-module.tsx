
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ModuleCardWrapper } from '@/components/common/module-card-wrapper';
import { useClinicalData } from '@/contexts/clinical-data-context';
import { useHistoryStore } from '@/hooks/use-history-store';
import { medicalAssistantChatFlow } from '@/ai/flows/medical-assistant-chat-flow'; // Ensure this flow exists
import type { ChatMessage } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Bot, Send, Eraser, Save, User, AlertCircle } from 'lucide-react';
import { cn, getTextSummary } from '@/lib/utils';

interface MedicalAssistantChatModuleProps {
  id?: string;
}

export function MedicalAssistantChatModule({ id }: MedicalAssistantChatModuleProps) {
  const {
    chatMessages,
    addChatMessage,
    setChatMessages,
    isChatResponding,
    setIsChatResponding,
    chatError,
    setChatError,
    clearChatModule: clearChatContext, // Renamed to avoid conflict
  } = useClinicalData();

  const [currentUserInput, setCurrentUserInput] = useState('');
  const { addHistoryEntry, isAutoSaveEnabled } = useHistoryStore();
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const moduleRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (scrollViewport) {
        scrollViewport.scrollTop = scrollViewport.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSendMessage = async () => {
    const trimmedInput = currentUserInput.trim();
    if (!trimmedInput) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmedInput,
      timestamp: Date.now(),
    };
    addChatMessage(userMessage);
    setCurrentUserInput('');
    setIsChatResponding(true);
    setChatError(null);

    try {
      const response = await medicalAssistantChatFlow({ userInput: trimmedInput });
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: response.assistantResponse,
        timestamp: Date.now(),
      };
      addChatMessage(aiMessage);

      if (isAutoSaveEnabled) {
        // Save chat history after AI responds
        await saveChatToHistory([...chatMessages, userMessage, aiMessage], null);
      }
    } catch (error: any) {
      console.error("Error in chat flow:", error);
      const errorMessage = error.message || "Ocurrió un error desconocido.";
      setChatError(errorMessage);
      const errorAiMessage: ChatMessage = {
        id: `ai-error-${Date.now()}`,
        sender: 'ai',
        text: `Lo siento, ocurrió un error: ${errorMessage}`,
        timestamp: Date.now(),
        error: true,
      };
      addChatMessage(errorAiMessage);
      toast({ title: "Error del Asistente", description: errorMessage, variant: "destructive" });
      if (isAutoSaveEnabled) {
        await saveChatToHistory([...chatMessages, userMessage, errorAiMessage], errorMessage);
      }
    } finally {
      setIsChatResponding(false);
      setTimeout(scrollToBottom, 0); // Ensure scroll after state update
    }
  };
  
  const saveChatToHistory = async (messagesToSave: ChatMessage[], errorMsg: string | null) => {
    const status = errorMsg ? 'error' : 'completed';
    let outputSummary = 'Error en el chat';
    if (!errorMsg && messagesToSave.length > 0) {
        const lastAiMessage = messagesToSave.filter(m => m.sender === 'ai' && !m.error).pop();
        outputSummary = lastAiMessage ? getTextSummary(lastAiMessage.text, 70) : `${messagesToSave.length} mensajes`;
    }

    await addHistoryEntry({
      module: 'MedicalAssistantChat',
      inputType: 'chat',
      inputSummary: `${messagesToSave.filter(m => m.sender === 'user').length} entradas de usuario`,
      outputSummary: outputSummary,
      fullInput: messagesToSave.filter(m => m.sender === 'user').map(m => m.text).join('\n---\n'), // Or a more structured representation
      fullOutput: { messages: messagesToSave, error: errorMsg }, // Store all messages
      status: status,
      errorDetails: errorMsg || undefined,
    });
  };


  const handleClearChat = () => {
    clearChatContext(); // Use the renamed context clear function
    toast({ title: "Chat Limpiado", description: "Se ha limpiado la conversación." });
  };

  const handleSaveManually = () => {
    if (chatMessages.length === 0 && !chatError) {
      toast({ title: "Nada que Guardar", description: "Inicie una conversación primero.", variant: "default" });
      return;
    }
    saveChatToHistory(chatMessages, chatError);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <ModuleCardWrapper
      ref={moduleRef}
      id={id}
      title="Asistente Médico IA"
      description="Consulte dudas médicas. El asistente se basa en evidencia clínica y cita fuentes cuando es posible."
      icon={Bot}
      isLoading={isChatResponding}
      contentClassName="flex flex-col h-[500px]" // Fixed height for chat
    >
      <ScrollArea className="flex-grow p-4 border rounded-md mb-4 bg-muted/20" ref={scrollAreaRef}>
        <div className="space-y-4">
          {chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex items-start space-x-3 p-3 rounded-lg max-w-[85%]",
                msg.sender === 'user' ? 'ml-auto bg-primary text-primary-foreground flex-row-reverse space-x-reverse' : 'mr-auto bg-card text-card-foreground border',
                msg.error && msg.sender === 'ai' ? 'bg-destructive/20 border-destructive text-destructive-foreground' : ''
              )}
            >
              {msg.sender === 'ai' && (
                msg.error ? <AlertCircle className="h-6 w-6 text-destructive shrink-0" /> : <Bot className="h-6 w-6 text-primary shrink-0" />
              )}
              {msg.sender === 'user' && <User className="h-6 w-6 shrink-0" />}
              <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
            </div>
          ))}
          {isChatResponding && chatMessages.length > 0 && chatMessages[chatMessages.length-1].sender === 'user' && (
            <div className="flex items-start space-x-3 p-3 rounded-lg max-w-[85%] mr-auto bg-card text-card-foreground border">
              <Bot className="h-6 w-6 text-primary shrink-0" />
              <div className="flex items-center space-x-1">
                <span className="text-sm">Escribiendo</span>
                <span className="animate-pulse text-xl">.</span>
                <span className="animate-pulse delay-150 text-xl">.</span>
                <span className="animate-pulse delay-300 text-xl">.</span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      
      {chatError && !isChatResponding && (
        <p className="text-sm text-destructive mb-2 px-1">Error: {chatError}</p>
      )}

      <div className="flex items-center space-x-2 mt-auto border-t pt-4">
        <Input
          type="text"
          placeholder="Escriba su pregunta aquí..."
          value={currentUserInput}
          onChange={(e) => setCurrentUserInput(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isChatResponding}
          className="flex-grow"
        />
        <Button onClick={handleSendMessage} disabled={isChatResponding || !currentUserInput.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
      <div className="mt-3 flex justify-between items-center">
        <Button onClick={handleClearChat} variant="outline" size="sm" disabled={isChatResponding}>
          <Eraser className="mr-2 h-4 w-4" />
          Limpiar Chat
        </Button>
        {!isAutoSaveEnabled && (chatMessages.length > 0 || chatError) && (
          <Button onClick={handleSaveManually} variant="secondary" size="sm" disabled={isChatResponding}>
            <Save className="mr-2 h-4 w-4" /> Guardar en Historial
          </Button>
        )}
      </div>
    </ModuleCardWrapper>
  );
}
      