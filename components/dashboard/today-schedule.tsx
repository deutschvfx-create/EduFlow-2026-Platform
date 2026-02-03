import { Clock, Users, ArrowRight } from "lucide-react";
import Link from "next/link";

const schedule = [
    { id: 1, time: '10:00', name: 'Deutsch A1', room: 'Audit. 302', teacher: 'М. Иванова' },
    { id: 2, time: '12:30', name: 'Intensive B2', room: 'Online', teacher: 'П. Смирнов' },
    { id: 3, time: '15:00', name: 'Conversation Club', room: 'Audit. 101', teacher: 'L. Smith' },
];

export function TodaySchedule() {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Сегодня в школе</h3>
                <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full font-bold">LIVE</span>
            </div>

            <div className="space-y-2">
                {schedule.map((item) => (
                    <div key={item.id} className="group flex items-center justify-between p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-indigo-500/30 transition-all active:scale-[0.98] cursor-pointer">
                        <div className="flex items-center gap-4">
                            <div className="flex flex-col items-center justify-center h-12 w-12 rounded-xl bg-zinc-950 font-mono text-xs">
                                <span className="text-indigo-400 font-black">{item.time.split(':')[0]}</span>
                                <span className="text-zinc-600 font-bold">:{item.time.split(':')[1]}</span>
                            </div>
                            <div>
                                <h4 className="text-base font-black text-zinc-100 group-hover:text-indigo-400 transition-colors tracking-tight">{item.name}</h4>
                                <div className="flex items-center gap-2 text-xs text-zinc-500 font-bold">
                                    <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {item.teacher}</span>
                                    <span className="opacity-30">•</span>
                                    <span>{item.room}</span>
                                </div>
                            </div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-zinc-700 group-hover:text-indigo-400 transform group-hover:translate-x-1 transition-all" />
                    </div>
                ))}
            </div>

            <Link href="/app/schedule" className="text-xs text-indigo-400/80 hover:text-indigo-400 font-medium px-1 block w-fit">
                Перейти в расписание →
            </Link>
        </div>
    );
}
