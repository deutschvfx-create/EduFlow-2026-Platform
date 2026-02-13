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
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#0F3D4C]/60">Сегодня в школе</h3>
                <span className="text-[10px] bg-[#2EC4C6]/15 text-[#2EC4C6] px-2 py-0.5 rounded-full font-bold">LIVE</span>
            </div>

            <div className="space-y-3">
                {schedule.map((item) => (
                    <div key={item.id} className="group flex items-center justify-between p-4 rounded-[14px] bg-white border border-[#DDE7EA] hover:border-primary/30 transition-all active:scale-[0.98] cursor-pointer shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="flex flex-col items-center justify-center h-12 w-12 rounded-xl bg-[#FAFAF2] font-mono text-xs">
                                <span className="text-primary font-black">{item.time.split(':')[0]}</span>
                                <span className="text-[#0F3D4C]/50 font-bold">:{item.time.split(':')[1]}</span>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-[#0F3D4C] group-hover:text-primary transition-colors tracking-tight">{item.name}</h4>
                                <div className="flex items-center gap-2 text-[11px] text-[#0F3D4C]/60 font-medium">
                                    <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {item.teacher}</span>
                                    <span className="opacity-40">•</span>
                                    <span>{item.room}</span>
                                </div>
                            </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-[#0F3D4C]/30 group-hover:text-primary transform group-hover:translate-x-1 transition-all" />
                    </div>
                ))}
            </div>

            <Link href="/app/schedule" className="text-xs text-primary/80 hover:text-primary font-bold px-1 block w-fit transition-colors">
                Перейти в расписание →
            </Link>
        </div>
    );
}
