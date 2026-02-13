'use client';

import { useState, useRef, useEffect } from "react";
import { Send, Smile, Paperclip, MoreVertical, Search, Phone, Video, Users, ArrowLeft, FileIcon, Image as ImageIcon, Download, X, Mic, Square, Play, Pause, Volume2, CheckCheck, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ChatRoomProps {
    selectedGroup: any;
    allGroups: any[];
    onGroupSelect: (id: string) => void;
    onBack?: () => void;
}

export function ChatRoom({ selectedGroup, allGroups, onGroupSelect, onBack }: ChatRoomProps) {
    const [newMessage, setNewMessage] = useState("");
    const [messages, setMessages] = useState<any[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const handleSendMessage = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!newMessage.trim()) return;

        const msg = {
            id: Date.now().toString(),
            content: newMessage,
            senderId: 'current-user',
            senderName: 'Me',
            timestamp: new Date().toISOString()
        };

        setMessages([...messages, msg]);
        setNewMessage("");
    };

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div className="flex flex-col h-full bg-[hsl(var(--background))] text-foreground overflow-hidden relative shadow-2xl">
            {/* WhatsApp Background Pattern - Softened */}
            <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[url('https://static.whatsapp.net/rsrc.php/v3/yP/r/UosS85N2v3I.png')] bg-repeat z-0" />

            {/* Chat Header - Glassmorphism */}
            <div className="h-16 bg-[hsl(var(--secondary))]/80 backdrop-blur-md flex items-center justify-between px-4 border-l border-border z-20 shadow-lg">
                <div className="flex items-center gap-3">
                    {onBack && (
                        <Button variant="ghost" size="icon" onClick={onBack} className="laptop:hidden text-muted-foreground">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    )}
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedGroup.name}`} />
                        <AvatarFallback>{selectedGroup.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <h3 className="text-[16px] font-normal text-[hsl(var(--foreground))]">{selectedGroup.name}</h3>
                        <p className="text-[12px] text-[hsl(var(--muted-foreground))]">в сети</p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5">
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-secondary/50 rounded-full">
                        <Video className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-secondary/50 rounded-full">
                        <Phone className="h-5 w-5" />
                    </Button>
                    <div className="w-[1px] h-6 bg-white/10 mx-1" />
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-secondary/50 rounded-full">
                        <Search className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-secondary/50 rounded-full">
                        <MoreVertical className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Messages Area - Glassy Scroll */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
                {/* Tactical texture overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[hsl(var(--background))]/50 to-[hsl(var(--background))] z-10 pointer-events-none" />

                <div className="flex flex-col gap-3 p-6 min-h-full relative z-0">
                    {messages.map((m, index) => (
                        <motion.div
                            key={m.id}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className={cn(
                                "flex flex-col max-w-[65%] p-3 rounded-2xl relative shadow-[0_4px_15px_rgba(0,0,0,0.2)] group",
                                m.senderId === 'current-user'
                                    ? "self-end bg-[hsl(var(--primary))] text-[hsl(var(--foreground))] rounded-tr-none"
                                    : "self-start bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] rounded-tl-none border border-border"
                            )}
                        >
                            <p className="text-[14.5px] leading-relaxed pr-12 font-medium">{m.content}</p>
                            <div className="absolute bottom-1.5 right-3 flex items-center gap-1 opacity-60">
                                <span className="text-[10px] font-bold">
                                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                {m.senderId === 'current-user' && <CheckCheck className="h-3.5 w-3.5 text-[hsl(var(--primary))]" />}
                            </div>

                            {/* Refined tail design */}
                            <div className={cn(
                                "absolute top-0 w-2.5 h-3",
                                m.senderId === 'current-user' ? "-right-2 bg-[hsl(var(--primary))]" : "-left-2 bg-[hsl(var(--secondary))]"
                            )} style={{ clipPath: m.senderId === 'current-user' ? 'polygon(0 0, 0 100%, 100% 0)' : 'polygon(100% 0, 100% 100%, 0 0)' }} />
                        </motion.div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* WhatsApp Input */}
            <div className="p-2.5 bg-[hsl(var(--secondary))] flex items-center gap-2 z-10">
                <div className="flex items-center">
                    <Button variant="ghost" size="icon" className="text-[hsl(var(--muted-foreground))] hover:bg-secondary/50 rounded-full">
                        <Smile className="h-6 w-6" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-[hsl(var(--muted-foreground))] hover:bg-secondary/50 rounded-full">
                        <Plus className="h-6 w-6" />
                    </Button>
                </div>

                <form onSubmit={handleSendMessage} className="flex-1">
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Введите сообщение"
                        className="bg-[hsl(var(--secondary))] border-none text-[15px] h-10 rounded-lg focus-visible:ring-0 placeholder:text-[hsl(var(--muted-foreground))]"
                    />
                </form>

                <Button variant="ghost" size="icon" onClick={handleSendMessage} className="text-[hsl(var(--muted-foreground))] hover:bg-secondary/50 rounded-full">
                    {newMessage.trim() ? <Send className="h-5 w-5" /> : <Mic className="h-6 w-6" />}
                </Button>
            </div>
        </div>
    );
}
