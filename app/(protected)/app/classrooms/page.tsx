'use client';

import { useState } from "react";
import { Classroom } from "@/lib/types/classroom";
import { CreateClassroomModal } from "@/components/classrooms/create-classroom-modal";
import { Button } from "@/components/ui/button";
import { MapPin, Building, Monitor, Microscope, Box, Trash2, Edit, Users } from "lucide-react";

export default function ClassroomsPage() {
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);

    const handleAddClassroom = (classroom: Classroom) => {
        setClassrooms([...classrooms, classroom]);
    };

    const handleDeleteClassroom = (id: string) => {
        if (confirm("Удалить эту аудиторию?")) {
            setClassrooms(classrooms.filter(c => c.id !== id));
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'CLASSROOM': return <Building className="h-4 w-4" />;
            case 'LAB': return <Microscope className="h-4 w-4" />;
            case 'ONLINE': return <Monitor className="h-4 w-4" />;
            default: return <Box className="h-4 w-4" />;
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'CLASSROOM': return 'Кабинет';
            case 'LAB': return 'Лаборатория';
            case 'ONLINE': return 'Онлайн';
            default: return 'Другое';
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Аудитории</h1>
                    <p className="text-sm text-muted-foreground/70 mt-1">
                        Управление помещениями и ресурсами (необязательно)
                    </p>
                </div>
                {classrooms.length > 0 && (
                    <CreateClassroomModal onSave={handleAddClassroom} />
                )}
            </div>

            {/* Empty State */}
            {classrooms.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                    <div className="h-20 w-20 rounded-full bg-secondary/50 flex items-center justify-center mb-6">
                        <MapPin className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h2 className="text-xl font-semibold text-foreground mb-2">Аудитории не добавлены</h2>
                    <p className="text-sm text-muted-foreground/70 max-w-md mb-6">
                        Вы можете продолжать работу без аудиторий или добавить их при необходимости.
                        Аудитории помогают отслеживать занятость помещений в расписании.
                    </p>
                    <CreateClassroomModal onSave={handleAddClassroom} />
                </div>
            ) : (
                /* List State */
                <div className="grid grid-cols-1 md:grid-cols-2 laptop:grid-cols-3 gap-4">
                    {classrooms.map((classroom) => (
                        <div
                            key={classroom.id}
                            className="bg-card border border-border rounded-lg p-4 hover:border-border transition-colors group"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-md bg-background flex items-center justify-center border border-border">
                                        {getTypeIcon(classroom.type)}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground text-sm">{classroom.name}</h3>
                                        <p className="text-xs text-muted-foreground">{getTypeLabel(classroom.type)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-muted-foreground/70 hover:text-red-400"
                                        onClick={() => handleDeleteClassroom(classroom.id)}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>

                            {/* Metadata */}
                            <div className="space-y-1.5 text-xs">
                                {/* Building/Floor - only show if exists and not ONLINE */}
                                {classroom.type !== 'ONLINE' && (classroom.building || classroom.floor) && (
                                    <div className="text-muted-foreground/70 flex items-center gap-1.5">
                                        <Building className="h-3 w-3 opacity-70" />
                                        <span>
                                            {classroom.building && classroom.floor
                                                ? `${classroom.building} · ${classroom.floor} этаж`
                                                : classroom.building
                                                    ? classroom.building
                                                    : `${classroom.floor} этаж`
                                            }
                                        </span>
                                    </div>
                                )}
                                {classroom.capacity && (
                                    <div className="flex items-center gap-2 text-muted-foreground/70">
                                        <Users className="h-3 w-3 opacity-70" />
                                        <span>Вместимость: {classroom.capacity}</span>
                                    </div>
                                )}
                                {classroom.note && (
                                    <div className="text-muted-foreground truncate">
                                        {classroom.note}
                                    </div>
                                )}
                                <div className="pt-2">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${classroom.status === 'ACTIVE'
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                        : 'bg-secondary text-muted-foreground border border-border'
                                        }`}>
                                        {classroom.status === 'ACTIVE' ? 'Активна' : 'Отключена'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
