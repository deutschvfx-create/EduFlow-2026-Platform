"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { Send, Bot, User, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Mascot } from '@/components/shared/mascot'; // Reusing the mascot component
import { motion, AnimatePresence } from 'framer-motion';

export function BotChat() {
    const [input, setInput] = useState('');
    const { messages, sendMessage, status, error, setMessages } = useChat({
        api: '/api/chat',
        initialMessages: [
            {
                id: 'welcome',
                role: 'assistant',
                parts: [{ type: 'text', text: 'Привет! Я Edu-Bot. Чем я могу помочь тебе сегодня? Ты можешь спросить меня о функциях системы или попросить совета по управлению школой. 🚀' }]
            }
        ]
    });

    const isLoading = status === 'streaming' || status === 'submitted';
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        if (scrollRef.current) {
            const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
        }
    }, [messages, status]);

    const clearChat = () => {
        setMessages([
            {
                id: 'welcome',
                role: 'assistant',
                parts: [{ type: 'text', text: 'Чат очищен. Чем еще я могу помочь? 😊' }]
            }
        ]);
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const currentInput = input;
        setInput('');
        await sendMessage(currentInput);
    };

    return (
        <div className="flex flex-col h-full bg-zinc-950/50 rounded-3xl border border-zinc-900 overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-4 border-b border-zinc-900 bg-zinc-900/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="absolute inset-0 bg-indigo-500/20 blur-md rounded-full" />
                        <Mascot status={isLoading ? "thinking" : "idle"} className="w-8 h-8 relative z-10" />
                    </div>
                    <div>
                        <h3 className="text-xs font-black text-white uppercase tracking-wider">AI Ассистент</h3>
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter">На связи</span>
                        </div>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={clearChat}
                    className="h-8 w-8 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </Button>
            </div>

            {/* Chat Area */}
            <ScrollArea ref={scrollRef} className="flex-1 p-4">
                <div className="space-y-4 pb-4">
                    <AnimatePresence initial={false}>
                        {messages.map((m) => (
                            <motion.div
                                key={m.id}
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
                            >
                                <div className={`flex-none w-8 h-8 rounded-full flex items-center justify-center border shadow-sm ${m.role === 'user'
                                    ? 'bg-zinc-800 border-zinc-700 text-zinc-300'
                                    : 'bg-indigo-950/50 border-indigo-500/30 text-indigo-400'
                                    }`}>
                                    {m.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                                </div>
                                <div className={`flex flex-col gap-1.5 max-w-[80%] ${m.role === 'user' ? 'items-end' : ''}`}>
                                    <div className={`p-3 rounded-2xl text-[13px] leading-relaxed shadow-sm ${m.role === 'user'
                                        ? 'bg-indigo-600 text-white rounded-tr-none'
                                        : 'bg-zinc-900/80 text-zinc-200 border border-zinc-800/50 rounded-tl-none'
                                        }`}>
                                        {m.parts.map((part, i) => (
                                            part.type === 'text' ? <React.Fragment key={i}>{part.text}</React.Fragment> : null
                                        ))}
                                    </div>
                                    <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest px-1">
                                        {m.role === 'user' ? 'Вы' : 'Edu-Bot'}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {isLoading && (
                        <div className="flex gap-3">
                            <div className="flex-none w-8 h-8 rounded-full bg-indigo-950/50 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                                <Loader2 className="h-4 w-4 animate-spin" />
                            </div>
                            <div className="bg-zinc-900/80 border border-zinc-800/50 rounded-2xl rounded-tl-none p-3 shadow-sm">
                                <div className="flex gap-1">
                                    <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                    <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                    <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce" />
                                </div>
                            </div>
                        </div>
                    )}
                    {error && (
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
                            Ошибка: Не удалось получить ответ. Проверьте API ключ.
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 bg-zinc-950 border-t border-zinc-900">
                <form onSubmit={handleFormSubmit} className="flex gap-2">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Задайте вопрос..."
                        className="flex-1 h-11 bg-zinc-900 border-zinc-800 text-sm rounded-xl focus-visible:ring-indigo-500/50 transition-all"
                        disabled={isLoading}
                    />
                    <Button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="h-11 w-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 flex-none"
                    >
                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    </Button>
                </form>
                <p className="text-[9px] text-zinc-600 text-center mt-3 font-medium uppercase tracking-[0.1em]">
                    Работает на базе Gemini 1.5 Flash
                </p>
            </div>
        </div>
    );
}
