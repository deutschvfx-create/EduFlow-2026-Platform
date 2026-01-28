
"use client";

import { Clock, Users, ArrowRight } from "lucide-react";

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
                    <div key={item.id} className="group flex items-center justify-between p-3 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-indigo-500/30 transition-all cursor-pointer">
                        <div className="flex items-center gap-4">
                            <div className="flex flex-col items-center justify-center h-10 w-10 rounded-lg bg-zinc-950 font-mono text-[11px]">
                                <span className="text-indigo-400 font-bold">{item.time.split(':')[0]}</span>
                                <span className="text-zinc-600">:{item.time.split(':')[1]}</span>
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-zinc-200 group-hover:text-indigo-400 transition-colors">{item.name}</h4>
                                <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                                    <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {item.teacher}</span>
                                    <span>•</span>
                                    <span>{item.room}</span>
                                </div>
                            </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-zinc-700 group-hover:text-indigo-400 transform group-hover:translate-x-1 transition-all" />
                    </div>
                ))}
            </div>

            <button className="text-xs text-indigo-400/80 hover:text-indigo-400 font-medium px-1">
                Перейти в расписание →
            </button>
        </div>
    );
}
