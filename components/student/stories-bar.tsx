"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { announcementsRepo } from "@/lib/data/announcements.repo";
import { Announcement } from "@/lib/types/announcement";
import { useAuth } from "@/components/auth/auth-provider";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Megaphone, X } from "lucide-react";

export function StoriesBar() {
    const { userData } = useAuth();
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    useEffect(() => {
        if (userData?.organizationId) {
            announcementsRepo.getAll(userData.organizationId).then(setAnnouncements);
        }
    }, [userData?.organizationId]);

    const selectedStory = announcements.find(a => a.id === selectedId);

    if (announcements.length === 0) return null;

    return (
        <div className="w-full">
            <ScrollArea className="w-full whitespace-nowrap pb-4">
                <div className="flex w-max space-x-4 px-1">
                    {announcements.map((ann, index) => (
                        <motion.div
                            key={ann.id}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex flex-col items-center gap-1 cursor-pointer"
                            onClick={() => setSelectedId(ann.id)}
                        >
                            <div className="p-[3px] rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 shadow-lg active:scale-95 transition-transform">
                                <div className="p-[2px] rounded-full bg-background">
                                    <Avatar className="h-14 w-14 border-2 border-transparent">
                                        <AvatarFallback className="bg-primary/20 text-primary font-bold">
                                            {ann.authorName?.[0] || <Megaphone className="h-5 w-5" />}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                            </div>
                            <span className="text-[10px] font-medium text-muted-foreground truncate w-16 text-center">
                                {ann.authorName?.split(' ')[0] || "Школа"}
                            </span>
                        </motion.div>
                    ))}
                </div>
                <ScrollBar orientation="horizontal" className="hidden" />
            </ScrollArea>

            <AnimatePresence>
                {selectedStory && (
                    <Dialog open={!!selectedId} onOpenChange={(open) => !open && setSelectedId(null)}>
                        <DialogContent className="max-w-md bg-card/95 backdrop-blur-3xl border-border rounded-[2.5rem] p-0 overflow-hidden outline-none">
                            <div className="relative h-[80vh] flex flex-col">
                                {/* Top Progress Bars (Fake Instagram style) */}
                                <div className="absolute top-4 left-4 right-4 flex gap-1 z-50">
                                    <div className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: "100%" }}
                                            transition={{ duration: 5 }}
                                            onAnimationComplete={() => setSelectedId(null)}
                                            className="h-full bg-white"
                                        />
                                    </div>
                                </div>

                                {/* Header */}
                                <div className="p-6 pt-10 flex items-center gap-3">
                                    <Avatar className="h-10 w-10 border border-white/20">
                                        <AvatarFallback className="bg-primary text-white">
                                            {selectedStory.authorName?.[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <h3 className="text-white font-bold text-sm leading-tight">{selectedStory.authorName}</h3>
                                        <p className="text-white/60 text-[10px] font-medium uppercase tracking-widest">
                                            {format(new Date(selectedStory.createdAt), "HH:mm, d MMM", { locale: ru })}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setSelectedId(null)}
                                        className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-white"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>

                                {/* Content */}
                                <div className="flex-1 px-8 flex flex-col justify-center text-center space-y-4">
                                    <Badge className="w-fit mx-auto bg-primary/20 text-primary border-primary/30 uppercase text-[9px] font-black tracking-[0.2em]">
                                        {selectedStory.targetType}
                                    </Badge>
                                    <h2 className="text-3xl font-black text-white leading-[1.1] tracking-tight uppercase">
                                        {selectedStory.title}
                                    </h2>
                                    <p className="text-white/80 text-lg leading-relaxed font-medium">
                                        {selectedStory.content}
                                    </p>
                                </div>

                                {/* Bottom Decor */}
                                <div className="p-8 text-center">
                                    <div className="h-1 w-12 bg-white/20 rounded-full mx-auto" />
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </AnimatePresence>
        </div>
    );
}
