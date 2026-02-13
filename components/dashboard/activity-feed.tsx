import { motion } from "framer-motion";
import { Circle, UserPlus, FileText, CheckCircle2, MessageSquare, Megaphone } from "lucide-react";
import Link from "next/link";

const activities = [
    { id: 1, type: 'ADD', user: 'Иван Петров', item: 'Группа A1', time: '10 мин. назад', icon: UserPlus, color: 'text-primary' },
    { id: 2, type: 'PAYMENT', user: 'Мария Сидорова', item: 'Курс Немецкого', time: '1 час назад', icon: CheckCircle2, color: 'text-emerald-400' },
    { id: 3, type: 'ANNOUNCE', user: 'Система', item: 'Новое расписание', time: '3 часа назад', icon: Megaphone, color: 'text-amber-400' },
    { id: 4, type: 'CHAT', user: 'Алексей Л.', item: 'Сообщение в чат', time: '5 часов назад', icon: MessageSquare, color: 'text-blue-400' },
];

export function ActivityFeed() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#0F3D4C]/60">Лента событий</h3>
                <div className="h-2 w-2 rounded-full bg-[#2EC4C6] animate-pulse shadow-[0_0_8px_rgba(46,196,198,0.5)]" />
            </div>

            <div className="relative space-y-6 before:absolute before:inset-0 before:ml-2.5 before:h-full before:w-0.5 before:-translate-x-px before:bg-[#DDE7EA]">
                {activities.map((item, idx) => (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={item.id}
                        className="relative flex items-start gap-4"
                    >
                        <div className="absolute left-0 mt-1 h-5 w-5 rounded-full bg-white border-2 border-[#DDE7EA] flex items-center justify-center z-10">
                            <item.icon className={`h-2.5 w-2.5 ${item.color}`} />
                        </div>

                        <div className="pl-8">
                            <div className="text-[13px] text-[#0F3D4C]">
                                <span className="font-bold text-[#0F3D4C]">{item.user}</span>
                                <span className="text-[#0F3D4C]/40 mx-1">—</span>
                                <span className="text-[#0F3D4C]/70">{item.item}</span>
                            </div>
                            <div className="text-[11px] text-[#0F3D4C]/40 mt-1 font-medium">{item.time}</div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <Link href="/app/announcements" className="block w-full py-2.5 text-xs font-bold text-[#0F3D4C]/60 hover:text-primary transition-colors border border-dashed border-[#DDE7EA] rounded-lg hover:border-primary/50 text-center uppercase tracking-widest">
                Показать все события
            </Link>
        </div>
    );
}
