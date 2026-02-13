"use client";

import { useState, useEffect } from "react";
import { OrganizationService, JoinRequest } from "@/lib/services/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Check, X, Clock, MessageCircle, UserPlus, Shield, Loader2, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface JoinRequestsManagerProps {
    organizationId: string;
}

export function JoinRequestsManager({ organizationId }: JoinRequestsManagerProps) {
    const [requests, setRequests] = useState<JoinRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const fetchRequests = async () => {
        if (!organizationId) return;
        setLoading(true);
        try {
            const data = await OrganizationService.getPendingRequests(organizationId);
            setRequests(data);
        } catch (error) {
            console.error("Failed to fetch requests:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [organizationId]);

    const handleAction = async (requestId: string, approve: boolean) => {
        setProcessingId(requestId);
        try {
            await OrganizationService.handleJoinRequest(requestId, approve);
            setRequests(prev => prev.filter(r => r.id !== requestId));
        } catch (error) {
            console.error("Failed to handle request:", error);
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
            </div>
        );
    }

    if (requests.length === 0) {
        return null; // Don't show anything if there are no requests
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-black text-[#0F3D4C] tracking-tight uppercase">Заявки на вступление</h3>
                </div>
                <Badge variant="secondary" className="bg-primary/10 text-primary font-black px-3 py-1 rounded-full">
                    {requests.length} новых
                </Badge>
            </div>

            <div className="grid grid-cols-1 gap-4">
                <AnimatePresence initial={false}>
                    {requests.map((request) => (
                        <motion.div
                            key={request.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            layout
                        >
                            <Card className="rounded-2xl border-[#DDE7EA] hover:shadow-md transition-all overflow-hidden bg-white group">
                                <CardContent className="p-4">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10 rounded-lg border-2 border-primary/20 bg-primary/5">
                                                <AvatarFallback className="text-primary font-black uppercase text-xs">
                                                    {request.userName.substring(0, 2)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="space-y-0.5">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-bold text-[#0F3D4C] text-sm">{request.userName}</p>
                                                    <Badge className={`text-[9px] px-1.5 h-4 ${request.role === 'teacher' ? 'bg-amber-500/10 text-amber-600' : 'bg-blue-500/10 text-blue-600'}`}>
                                                        {request.role === 'teacher' ? 'Учитель' : 'Ученик'}
                                                    </Badge>
                                                </div>
                                                <p className="text-[10px] text-[#0F3D4C]/40 font-medium">{request.userEmail}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 px-3 rounded-lg text-red-500 border-red-100 hover:bg-red-50 hover:text-red-600 font-bold text-[10px] gap-1.5"
                                                onClick={() => handleAction(request.id, false)}
                                                disabled={!!processingId}
                                            >
                                                <X className="h-3 w-3" />
                                                {processingId === request.id ? '...' : 'Отклонить'}
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="h-8 px-4 rounded-lg bg-primary hover:bg-primary/90 text-white font-bold text-[10px] gap-1.5 shadow-lg shadow-primary/10"
                                                onClick={() => handleAction(request.id, true)}
                                                disabled={!!processingId}
                                            >
                                                <Check className="h-3 w-3" />
                                                {processingId === request.id ? '...' : 'Одобрить'}
                                            </Button>
                                        </div>
                                    </div>
                                    {request.message && (
                                        <div className="mt-2 flex gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100 italic text-[11px] text-[#0F3D4C]/60">
                                            <MessageCircle className="h-3 w-3 shrink-0 text-primary mt-0.5" />
                                            <p>"{request.message}"</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
