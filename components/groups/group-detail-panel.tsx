'use client';

import { useState, useMemo, useEffect } from "react";
import { Group } from "@/lib/types/group";
import { useStudents } from "@/hooks/use-students";
import { useTeachers } from "@/hooks/use-teachers";
import { useFaculties } from "@/hooks/use-faculties";
import { useDepartments } from "@/hooks/use-departments";
import { useModules } from "@/hooks/use-modules";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Search,
    Mail,
    Phone,
    GraduationCap,
    Info,
    Users,
    Save,
    Loader2,
    Hash,
    BookOpen,
    Trash2,
    LayoutDashboard,
    Wallet,
    CheckCircle2,
    Contact,
    MoreVertical,
    Archive,
    UserMinus,
    ExternalLink
} from "lucide-react";
import { AddStudentModal } from "./add-student-modal";
import { RemoveStudentModal } from "./remove-student-modal";
import { StudentPassportModal } from "./student-passport-modal";
import { ActionGuard } from "@/components/auth/action-guard";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface GroupDetailPanelProps {
    group: Group | null;
    onUpdate: (id: string, updates: Partial<Group>) => Promise<void>;
    onDelete?: (id: string) => void;
    onArchive?: () => void;
}

export function GroupDetailPanel({ group, onUpdate, onDelete, onArchive }: GroupDetailPanelProps) {
    const { students, loading: studentsLoading } = useStudents();
    const { teachers } = useTeachers();
    const { faculties } = useFaculties();
    const { departments: allDepartments } = useDepartments();
    const { modules } = useModules();

    const [search, setSearch] = useState("");
    const [formData, setFormData] = useState<Partial<Group>>({});
    const [hasChanges, setHasChanges] = useState(false);
    const [saving, setSaving] = useState(false);

    // Student specific modal states
    const [selectedStudentForPassport, setSelectedStudentForPassport] = useState<any>(null);
    const [isStudentPassportOpen, setIsStudentPassportOpen] = useState(false);
    const [selectedStudentForRemoval, setSelectedStudentForRemoval] = useState<any>(null);
    const [isRemoveStudentModalOpen, setIsRemoveStudentModalOpen] = useState(false);

    useEffect(() => {
        if (group) {
            setFormData({
                name: group.name,
                code: group.code,
                facultyId: group.facultyId,
                departmentId: group.departmentId,
                level: group.level || "",
                paymentType: group.paymentType || "FREE",
                curatorTeacherId: group.curatorTeacherId || "",
                maxStudents: group.maxStudents,
                status: group.status
            });
            setHasChanges(false);
        }
    }, [group]);

    const handleChange = (field: keyof Group, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setHasChanges(true);
    };

    const handleSave = async () => {
        if (!group || !hasChanges) return;
        setSaving(true);
        try {
            await onUpdate(group.id, formData);
            setHasChanges(false);
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    const filteredDepartments = useMemo(() => {
        return allDepartments.filter(d => d.facultyId === formData.facultyId);
    }, [allDepartments, formData.facultyId]);

    const groupStudents = useMemo(() => {
        return group ? students.filter(s => s.groupIds?.includes(group.id)) : [];
    }, [students, group]);

    const filteredStudents = useMemo(() => {
        return groupStudents.filter(s =>
            `${s.firstName} ${s.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
            s.email?.toLowerCase().includes(search.toLowerCase())
        );
    }, [groupStudents, search]);

    const handleRemoveStudentConfirm = async () => {
        if (!group || !selectedStudentForRemoval) return;

        try {
            const { studentsRepo } = await import("@/lib/data/students.repo");
            const { groupsRepo } = await import("@/lib/data/groups.repo");

            const student = selectedStudentForRemoval;
            const newGroupIds = (student.groupIds || []).filter((id: string) => id !== group.id);

            await studentsRepo.update(student.organizationId, student.id, { groupIds: newGroupIds });

            await groupsRepo.update(student.organizationId, group.id, {
                studentsCount: Math.max((group.studentsCount || 0) - 1, 0)
            });

            setIsRemoveStudentModalOpen(false);
            window.location.reload();
        } catch (e) {
            console.error(e);
            alert("Ошибка при исключении студента");
        }
    };

    if (!group) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-[#64748B] p-12 bg-white rounded-[24px] border border-[#E5E7EB] shadow-sm font-inter">
                <div className="w-20 h-20 rounded-[24px] bg-[#F5F6F8] flex items-center justify-center mb-6">
                    <Users className="h-8 w-8 opacity-20" />
                </div>
                <h2 className="text-[18px] font-black text-[#0F172A] mb-2 tracking-tight uppercase">Выберите группу</h2>
                <p className="text-[14px] text-[#64748B] font-medium max-w-[280px] text-center leading-relaxed">
                    Выберите группу из списка слева для просмотра состава и редактирования информации
                </p>
            </div>
        );
    }

    const tabs = [
        { id: 'info', icon: Info, label: 'Информация' },
        { id: 'students', icon: Users, label: 'Студенты' },
    ];

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-white rounded-[24px] border border-[#E5E7EB] shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-300 font-inter">
            <Tabs defaultValue="info" className="flex-1 flex flex-col min-h-0">
                {/* Header / Tabs - MATCHES COURSE PANEL PIXEL PERFECT */}
                <div className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur-md border-b border-[#E5E7EB] px-6 py-3 flex items-center justify-between">
                    <TabsList className="h-[40px] bg-transparent p-0 gap-1 flex-nowrap rounded-none border-none">
                        {tabs.map(tab => (
                            <TabsTrigger
                                key={tab.id}
                                value={tab.id}
                                className={cn(
                                    "h-[32px] px-3 rounded-full text-[11px] font-bold uppercase tracking-tight transition-all flex items-center gap-1.5",
                                    "text-[#64748B] hover:text-[#0F172A] hover:bg-[#F5F6F8]",
                                    "data-[state=active]:text-[#2563EB] data-[state=active]:bg-[#2563EB]/10 data-[state=active]:shadow-none"
                                )}
                            >
                                <tab.icon className="h-3.5 w-3.5" />
                                {tab.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    <div className="flex items-center gap-2">
                        {(onDelete || onArchive) && (
                            <div className="flex items-center gap-2 mr-2 pr-2 border-r border-[#E5E7EB]">
                                {onArchive && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={onArchive}
                                        className="h-8 w-8 rounded-full text-[#64748B] hover:text-amber-600 hover:bg-amber-50 transition-all"
                                        title="Архивировать группу"
                                    >
                                        <Archive className="h-4 w-4" />
                                    </Button>
                                )}
                                {onDelete && (
                                    <ActionGuard actionLabel="Удаление доступно только владельцам">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onDelete(group.id)}
                                            className="h-8 w-8 rounded-full text-[#64748B] hover:text-red-600 hover:bg-red-50 transition-all"
                                            title="Удалить группу"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </ActionGuard>
                                )}
                            </div>
                        )}

                        {hasChanges && (
                            <ActionGuard actionLabel="Сохранение доступно после регистрации">
                                <Button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="h-8 pl-3 pr-4 bg-[#2563EB] hover:bg-[#2563EB]/90 text-white font-bold text-[12px] rounded-full shadow-lg shadow-[#2563EB]/20 transition-all flex items-center gap-1.5 active:scale-95"
                                >
                                    {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                                    Сохранить
                                </Button>
                            </ActionGuard>
                        )}
                    </div>
                </div>

                <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                    <TabsContent value="info" className="flex-1 overflow-y-auto no-scrollbar m-0 p-5 space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex flex-col lg:flex-row gap-5 items-start">
                            {/* LEFT SIDEBAR: Code and Status */}
                            <div className="w-full lg:w-[240px] shrink-0 space-y-4">
                                <div className="space-y-2">
                                    <h4 className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest flex items-center gap-1.5 ml-1">
                                        <Hash className="h-3 w-3" />
                                        Код и Статус
                                    </h4>
                                    <div className="p-3 bg-[#F8FAFC] rounded-[16px] border border-[#E2E8F0] space-y-3">
                                        <div className="flex flex-col items-center justify-center p-3 bg-white border border-[#E2E8F0] rounded-[12px] shadow-sm">
                                            <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider mb-0.5 opacity-50">Код потока</span>
                                            <span className="text-xl font-black text-[#0F172A] font-mono tracking-tight">{formData.code || "---"}</span>
                                        </div>

                                        <div className="space-y-1">
                                            <Label className="text-[10px] font-bold text-[#64748B] ml-1">Код (ID)</Label>
                                            <Input
                                                value={formData.code}
                                                onChange={e => handleChange('code', e.target.value.toUpperCase())}
                                                className="h-8 px-2 border-[#E2E8F0] bg-white text-[12px] font-bold text-[#0F172A] rounded-[10px] text-center uppercase font-mono"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <Label className="text-[10px] font-bold text-[#64748B] ml-1">Статус</Label>
                                            <Select value={formData.status} onValueChange={v => handleChange('status', v)}>
                                                <SelectTrigger className="h-8 w-full border-[#E2E8F0] bg-white text-[12px] font-medium text-[#0F172A] rounded-[10px]">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl border-[#E2E8F0] shadow-lg">
                                                    <SelectItem value="ACTIVE" className="text-[12px] font-medium">Активна</SelectItem>
                                                    <SelectItem value="INACTIVE" className="text-[12px] font-medium">Неактивна</SelectItem>
                                                    <SelectItem value="ARCHIVED" className="text-[12px] font-medium">Архив</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest flex items-center gap-1.5 ml-1">
                                        <Wallet className="h-3 w-3" />
                                        Финансы и Нагрузка
                                    </h4>
                                    <div className="p-3 bg-[#F8FAFC] rounded-[16px] border border-[#E2E8F0] space-y-2">
                                        <div className="space-y-1">
                                            <Label className="text-[10px] font-bold text-[#64748B] ml-1">Тип обучения</Label>
                                            <Select value={formData.paymentType} onValueChange={v => handleChange('paymentType', v)}>
                                                <SelectTrigger className="h-8 w-full border-[#E2E8F0] bg-white text-[12px] font-medium text-[#0F172A] rounded-[10px]">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl border-[#E2E8F0] shadow-lg">
                                                    <SelectItem value="FREE" className="text-[12px] font-medium">Бюджет</SelectItem>
                                                    <SelectItem value="PAID" className="text-[12px] font-medium">Контракт</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[10px] font-bold text-[#64748B] ml-1">Лимит мест</Label>
                                            <Input
                                                type="number"
                                                value={formData.maxStudents}
                                                onChange={e => handleChange('maxStudents', parseInt(e.target.value))}
                                                className="h-8 px-2 border-[#E2E8F0] bg-white text-[12px] font-medium text-[#0F172A] rounded-[10px]"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT MAIN CONTENT: Info and Structure */}
                            <div className="flex-1 space-y-4 w-full lg:mt-0">
                                <div className="space-y-2">
                                    <h4 className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest flex items-center gap-1.5 ml-1">
                                        <LayoutDashboard className="h-3 w-3" />
                                        Основные данные
                                    </h4>
                                    <div className="p-5 bg-[#F8FAFC] rounded-[20px] border border-[#E2E8F0] space-y-4">
                                        <div className="space-y-1">
                                            <Label className="text-[11px] font-bold text-[#64748B] ml-1.5">Название группы</Label>
                                            <Input
                                                value={formData.name}
                                                onChange={e => handleChange('name', e.target.value)}
                                                className="h-9 px-3.5 border-[#E2E8F0] bg-white text-[13px] font-medium text-[#0F172A] rounded-full focus:ring-4 focus:ring-[#2563EB]/5 focus:border-[#2563EB]"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <Label className="text-[11px] font-bold text-[#64748B] ml-1.5">Уровень</Label>
                                                <Select value={formData.level} onValueChange={v => handleChange('level', v)}>
                                                    <SelectTrigger className="h-9 w-full px-3.5 border-[#E2E8F0] bg-white text-[13px] font-medium text-[#0F172A] rounded-full focus:ring-4 focus:ring-[#2563EB]/5 focus:border-[#2563EB]">
                                                        <SelectValue placeholder="Выберите уровень" />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-[16px] border-[#E2E8F0] shadow-xl max-h-[200px]">
                                                        {['A1', 'A2', 'B1', 'B2', 'C1', '1 курс', '2 курс', '3 курс', '4 курс'].map(l => (
                                                            <SelectItem key={l} value={l} className="text-[12px] font-medium">{l}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[11px] font-bold text-[#64748B] ml-1.5">Куратор</Label>
                                                <Select value={formData.curatorTeacherId} onValueChange={v => handleChange('curatorTeacherId', v)}>
                                                    <SelectTrigger className="h-9 w-full px-3.5 border-[#E2E8F0] bg-white text-[13px] font-medium text-[#0F172A] rounded-full focus:ring-4 focus:ring-[#2563EB]/5 focus:border-[#2563EB]">
                                                        <SelectValue placeholder="Выберите куратора" />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-[16px] border-[#E2E8F0] shadow-xl">
                                                        {teachers.map(t => (
                                                            <SelectItem key={t.id} value={t.id} className="text-[12px] font-medium truncate">
                                                                {t.firstName} {t.lastName}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        {(modules.faculties || modules.departments) && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                                                {modules.faculties && (
                                                    <div className="space-y-1">
                                                        <Label className="text-[11px] font-bold text-[#64748B] ml-1.5">Факультет</Label>
                                                        <Select value={formData.facultyId} onValueChange={v => {
                                                            handleChange('facultyId', v);
                                                            handleChange('departmentId', "");
                                                        }}>
                                                            <SelectTrigger className="h-9 w-full px-3.5 border-[#E2E8F0] bg-white text-[13px] font-medium text-[#0F172A] rounded-full focus:ring-4 focus:ring-[#2563EB]/5 focus:border-[#2563EB]">
                                                                <SelectValue placeholder="Факультет" />
                                                            </SelectTrigger>
                                                            <SelectContent className="rounded-[16px] border-[#E2E8F0] shadow-xl">
                                                                {faculties.map(f => (
                                                                    <SelectItem key={f.id} value={f.id} className="text-[12px] font-medium">{f.name}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                )}
                                                {modules.departments && (
                                                    <div className="space-y-1">
                                                        <Label className="text-[11px] font-bold text-[#64748B] ml-1.5">Кафедра</Label>
                                                        <Select value={formData.departmentId} onValueChange={v => handleChange('departmentId', v)} disabled={!formData.facultyId}>
                                                            <SelectTrigger className="h-9 w-full px-3.5 border-[#E2E8F0] bg-white text-[13px] font-medium text-[#0F172A] rounded-full focus:ring-4 focus:ring-[#2563EB]/5 focus:border-[#2563EB]">
                                                                <SelectValue placeholder="Кафедра" />
                                                            </SelectTrigger>
                                                            <SelectContent className="rounded-[16px] border-[#E2E8F0] shadow-xl">
                                                                {filteredDepartments.map(d => (
                                                                    <SelectItem key={d.id} value={d.id} className="text-[12px] font-medium">{d.name}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="students" className="flex-1 m-0 p-0 overflow-hidden data-[state=active]:flex data-[state=active]:flex-col animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="p-6 border-b border-[#E5E7EB] space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest flex items-center gap-1.5">
                                    <Users className="h-3.5 w-3.5" />
                                    Список студентов ({groupStudents.length})
                                </h4>
                                <AddStudentModal group={group} />
                            </div>

                            <div className="relative group/search">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B] group-focus-within/search:text-[#2563EB] transition-colors" />
                                <Input
                                    placeholder="Поиск по имени или почте..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="h-10 pl-11 bg-[#F1F5F9] border-transparent rounded-full text-[12px] font-medium placeholder:text-[#94A3B8] focus:bg-white focus:ring-4 focus:ring-[#2563EB]/5 focus:border-[#2563EB] transition-all font-inter shadow-none"
                                />
                            </div>
                        </div>

                        <ScrollArea className="flex-1">
                            <div className="p-6">
                                {studentsLoading ? (
                                    <div className="py-20 flex flex-col items-center justify-center gap-3">
                                        <Loader2 className="h-6 w-6 text-[#2563EB] animate-spin" />
                                        <p className="text-[11px] font-bold uppercase tracking-widest text-[#64748B]">Загрузка состава...</p>
                                    </div>
                                ) : filteredStudents.length === 0 ? (
                                    <div className="py-20 text-center space-y-4 flex flex-col items-center justify-center bg-[#F8FAFC]/50 rounded-[20px] border border-[#E2E8F0] border-dashed">
                                        <div className="w-16 h-16 bg-white rounded-[18px] shadow-sm flex items-center justify-center border border-[#E2E8F0]">
                                            <GraduationCap className="h-7 w-7 text-[#CBD5E1]" />
                                        </div>
                                        <p className="text-[13px] font-bold text-[#0F172A]">
                                            {search ? "Студенты не найдены" : "В группе пока нет студентов"}
                                        </p>
                                        <p className="text-[11px] text-[#64748B] max-w-[200px] leading-relaxed">
                                            {search ? "Попробуйте изменить поисковый запрос" : "Добавьте первого студента в список участников"}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                        <AnimatePresence mode="popLayout">
                                            {filteredStudents.map((student, idx) => (
                                                <motion.div
                                                    key={student.id}
                                                    initial={{ opacity: 0, scale: 0.98 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.98 }}
                                                    transition={{ delay: idx * 0.02 }}
                                                    className="group p-3 rounded-[16px] bg-white border border-[#E2E8F0] hover:border-[#2563EB] hover:shadow-md transition-all flex items-center gap-3 cursor-pointer"
                                                >
                                                    <Avatar className="h-10 w-10 rounded-[12px] border border-[#E2E8F0] shrink-0 overflow-hidden">
                                                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.firstName}${student.lastName}`} className="object-cover" />
                                                        <AvatarFallback className="bg-[#F8FAFC] text-[#0F172A] font-black text-[10px] uppercase">
                                                            {student.firstName[0]}{student.lastName[0]}
                                                        </AvatarFallback>
                                                    </Avatar>

                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-bold text-[13px] text-[#0F172A] truncate group-hover:text-[#2563EB] transition-colors">
                                                            {student.firstName} {student.lastName}
                                                        </h4>
                                                        <div className="flex items-center gap-1.5 opacity-60">
                                                            <Mail className="h-2.5 w-2.5" />
                                                            <span className="text-[10px] truncate">{student.email}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedStudentForPassport(student);
                                                                setIsStudentPassportOpen(true);
                                                            }}
                                                            className="h-8 w-8 rounded-full text-[#64748B] hover:text-[#2563EB] hover:bg-[#2563EB]/10"
                                                            title="Посмотреть паспорт"
                                                        >
                                                            <ExternalLink className="h-3.5 w-3.5" />
                                                        </Button>
                                                        <ActionGuard actionLabel="Исключение студента доступно после регистрации">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedStudentForRemoval(student);
                                                                    setIsRemoveStudentModalOpen(true);
                                                                }}
                                                                className="h-8 w-8 rounded-full text-[#64748B] hover:text-red-600 hover:bg-red-50"
                                                                title="Исключить из группы"
                                                            >
                                                                <UserMinus className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </ActionGuard>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </TabsContent>
                </div>
            </Tabs>

            {/* Student Actions Modals */}
            <StudentPassportModal
                student={selectedStudentForPassport}
                open={isStudentPassportOpen}
                onOpenChange={setIsStudentPassportOpen}
            />

            <RemoveStudentModal
                studentName={selectedStudentForRemoval ? `${selectedStudentForRemoval.firstName} ${selectedStudentForRemoval.lastName}` : ""}
                groupName={group.name}
                open={isRemoveStudentModalOpen}
                onOpenChange={setIsRemoveStudentModalOpen}
                onConfirm={handleRemoveStudentConfirm}
            />
        </div>
    );
}
