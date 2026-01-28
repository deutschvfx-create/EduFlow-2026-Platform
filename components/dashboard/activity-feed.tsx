import { motion } from "framer-motion";
import { Circle, UserPlus, FileText, CheckCircle2, MessageSquare, Megaphone } from "lucide-react";
import Link from "next/link";

const activities = [
    { id: 1, type: 'ADD', user: 'Иван Петров', item: 'Группа A1', time: '10 мин. назад', icon: UserPlus, color: 'text-indigo-400' },
    { id: 2, type: 'PAYMENT', user: 'Мария Сидорова', item: 'Курс Немецкого', time: '1 час назад', icon: CheckCircle2, color: 'text-emerald-400' },
    { id: 3, type: 'ANNOUNCE', user: 'Система', item: 'Новое расписание', time: '3 часа назад', icon: Megaphone, color: 'text-amber-400' },
    { id: 4, type: 'CHAT', user: 'Алексей Л.', item: 'Сообщение в чат', time: '5 часов назад', icon: MessageSquare, color: 'text-blue-400' },
];

export function ActivityFeed() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Лента событий</h3>
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <div className="relative space-y-6 before:absolute before:inset-0 before:ml-2.5 before:h-full before:w-0.5 before:-translate-x-px before:bg-gradient-to-b before:from-zinc-800 before:via-zinc-800 before:to-transparent">
                {activities.map((item, idx) => (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={item.id}
                        className="relative flex items-start gap-4"
                    >
                        <div className="absolute left-0 mt-1 h-5 w-5 rounded-full bg-zinc-900 border-2 border-zinc-800 flex items-center justify-center z-10">
                            <item.icon className={`h-2.5 w-2.5 ${item.color}`} />
                        </div>

                        <div className="pl-8">
                            <div className="text-[13px] text-zinc-200">
                                <span className="font-semibold text-white">{item.user}</span>
                                <span className="text-zinc-500 mx-1">—</span>
                                <span className="text-zinc-400">{item.item}</span>
                            </div>
                            <div className="text-[11px] text-zinc-600 mt-1">{item.time}</div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <Link href="/app/announcements" className="block w-full py-2 text-xs font-medium text-zinc-500 hover:text-indigo-400 transition-colors border border-dashed border-zinc-800 rounded-lg hover:border-indigo-500/30 text-center">
                Показать все события
            </Link>
        </div>
    );
}
