import { Course, CourseStatus, CourseType } from "@/lib/types/course";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Info, GraduationCap, Users, Hash, Save, Loader2, Plus, Clock, BookOpen, Trash2, CheckCircle2, LayoutDashboard, FileText, Calendar, List, UserMinus, UserPlus, Link, ExternalLink, Users2, Wallet, UserCog, X, Search, Archive, MoreVertical, Trash } from "lucide-react";
import { LinkGroupsModal } from "./link-groups-modal";
import { ArchiveCourseModal } from "./archive-course-modal";
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { useOrganization } from "@/hooks/use-organization";
import { Group } from "@/lib/types/group";
import { Faculty } from "@/lib/types/faculty";
import { Department } from "@/lib/types/department";
import { Teacher } from "@/lib/types/teacher";
import { TeacherCompactCard } from "@/components/teachers/teacher-compact-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { AssignTeachersModal } from "./assign-teachers-modal";
import { useModules } from "@/hooks/use-modules";
import { useRole } from "@/hooks/use-role";
import { TeacherAssignment } from "@/lib/types/course";
import { DeleteCourseModal } from "./delete-course-modal";
import { TeacherPassportModal } from "@/components/teachers/teacher-passport";

interface CourseDetailPanelProps {
    course: Course | null;
    onUpdate: (id: string, updates: Partial<Course>) => void;
    onDelete?: (id: string) => void;
}

export function CourseDetailPanel({ course, onUpdate, onDelete }: CourseDetailPanelProps) {
    const { currentOrganizationId } = useOrganization();
    const { userData } = useAuth();
    const { modules } = useModules();
    const { isTeacher } = useRole();
    const [loading, setLoading] = useState(false);
    const [linkedGroups, setLinkedGroups] = useState<Group[]>([]);
    const [fetchingGroups, setFetchingGroups] = useState(false);
    const [isLinkGroupsModalOpen, setIsLinkGroupsModalOpen] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    // Selection state
    const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [passportTeacher, setPassportTeacher] = useState<Teacher | null>(null);
    const [isPassportModalOpen, setIsPassportModalOpen] = useState(false);

    // Search state
    const [searchQuery, setSearchQuery] = useState("");

    // ... (rest of the file until the return)


    const [formData, setFormData] = useState({
        name: "",
        code: "",
        facultyId: "",
        departmentId: "",
        level: "",
        description: "",
        objective: "",
        type: "MANDATORY" as CourseType,
        status: "ACTIVE" as CourseStatus,
        basePrice: "",
        currency: "RUB" as 'RUB' | 'USD' | 'EUR' | 'TJS',
        format: "OFFLINE" as "ONLINE" | "OFFLINE" | "HYBRID",
        grouping: "GROUP" as "INDIVIDUAL" | "GROUP",
        hoursPerWeek: "",
        teacherIds: [] as string[],
        teachers: [] as TeacherAssignment[],
        groupIds: [] as string[]
    });

    // Data constraints
    const [faculties, setFaculties] = useState<Faculty[]>([]);
    const [allDepartments, setAllDepartments] = useState<Department[]>([]);
    const [allTeachers, setAllTeachers] = useState<Teacher[]>([]);

    useEffect(() => {
        if (currentOrganizationId) {
            Promise.all([
                import("@/lib/data/faculties.repo").then(m => m.facultiesRepo.getAll(currentOrganizationId)),
                import("@/lib/data/departments.repo").then(m => m.departmentsRepo.getAll(currentOrganizationId)),
                import("@/lib/data/teachers.repo").then(m => m.teachersRepo.getAll(currentOrganizationId))
            ]).then(([f, d, t]) => {
                setFaculties(f);
                setAllDepartments(d);
                setAllTeachers(t);
            });
        }
    }, [currentOrganizationId]);

    useEffect(() => {
        if (course) {
            setFormData({
                name: course.name,
                code: course.code,
                level: course.level || "",
                facultyId: course.facultyId || "",
                departmentId: course.departmentId || "",
                objective: course.objective || "",
                description: course.description || "",
                type: course.type,
                status: course.status,
                basePrice: course.basePrice?.toString() || "0",
                currency: course.currency || 'RUB',
                format: course.format || 'OFFLINE',
                grouping: course.grouping || 'GROUP',
                hoursPerWeek: course.workload?.hoursPerWeek?.toString() || "0",
                teacherIds: course.teacherIds || [],
                teachers: course.teachers || [],
                groupIds: course.groupIds || []
            });
            setHasChanges(false);
            if (course.teacherIds?.length > 0 && !selectedTeacherId) {
                setSelectedTeacherId(course.teacherIds[0]);
            }
        }
    }, [course]);

    useEffect(() => {
        const fetchLinkedGroups = async () => {
            if (formData.groupIds?.length > 0 && currentOrganizationId) {
                setFetchingGroups(true);
                try {
                    const { groupsRepo } = await import("@/lib/data/groups.repo");
                    const groups = await groupsRepo.getAll(currentOrganizationId, { groupIds: formData.groupIds });
                    setLinkedGroups(groups);
                } catch (e) {
                    console.error("Failed to fetch linked groups", e);
                } finally {
                    setFetchingGroups(false);
                }
            } else {
                setLinkedGroups([]);
            }
        };

        fetchLinkedGroups();
    }, [formData.groupIds, currentOrganizationId]);

    const handleChange = (field: keyof typeof formData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setHasChanges(true);
    };

    const handleSave = async () => {
        if (!course) return;
        setLoading(true);
        try {
            const hours = parseInt(formData.hoursPerWeek) || 0;

            await onUpdate(course.id, {
                ...formData,
                basePrice: parseInt(formData.basePrice) || 0,
                workload: {
                    hoursPerWeek: hours,
                    hoursPerSemester: hours * 16,
                    hoursPerYear: hours * 32
                },
                teachers: formData.teachers,
                teacherIds: formData.teachers.map(t => t.userId)
            });
            setHasChanges(false);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (!course) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8 border rounded-[24px] bg-white border-dashed border-[#E5E7EB]">
                <LayoutDashboard className="h-12 w-12 mb-4 opacity-20" />
                <p className="font-medium">Выберите курс для просмотра</p>
                <p className="text-sm">Нажмите на курс в списке слева</p>
            </div>
        );
    }

    const departments = allDepartments.filter(d => d.facultyId === formData.facultyId);

    // Define tabs here 
    const tabs = [
        { id: 'info', icon: Info, label: 'Информация' },
        { id: 'teachers', icon: GraduationCap, label: 'Преподаватели' },
        { id: 'groups', icon: Users, label: 'Группы' },
    ];

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-white rounded-[24px] border border-[#E5E7EB] shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            <Tabs defaultValue="info" className="flex-1 flex flex-col min-h-0">
                {/* Header / Tabs */}
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
                        {!isTeacher && (
                            <div className="flex items-center gap-2 mr-2 pr-2 border-r border-[#E5E7EB]">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsArchiveModalOpen(true)}
                                    className="h-8 w-8 rounded-full text-[#64748B] hover:text-amber-600 hover:bg-amber-50 transition-all"
                                    title="Архивировать курс"
                                >
                                    <Archive className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsDeleteModalOpen(true)}
                                    className="h-8 w-8 rounded-full text-[#64748B] hover:text-red-600 hover:bg-red-50 transition-all"
                                    title="Удалить курс"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        )}

                        {hasChanges && !isTeacher && (
                            <Button
                                onClick={handleSave}
                                disabled={loading}
                                className="h-8 pl-3 pr-4 bg-[#2563EB] hover:bg-[#2563EB]/90 text-white font-bold text-[12px] rounded-full shadow-lg shadow-[#2563EB]/20 transition-all flex items-center gap-1.5 active:scale-95"
                            >
                                {loading && <Loader2 className="h-3 w-3 animate-spin" />}
                                <Save className="h-3 w-3" />
                                Сохранить
                            </Button>
                        )}
                    </div>
                </div>

                <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                    <TabsContent value="info" className="flex-1 overflow-y-auto no-scrollbar m-0 p-5 space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex flex-col lg:flex-row gap-5 items-start">
                            {/* LEFT SIDEBAR Like Student Panel */}
                            <div className="w-full lg:w-[240px] shrink-0 space-y-4">
                                {/* Course "Passport" / Meta */}
                                <div className="space-y-2">
                                    <h4 className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest flex items-center gap-1.5">
                                        <Hash className="h-3 w-3" />
                                        Код и Статус
                                    </h4>
                                    <div className="p-3 bg-[#F8FAFC] rounded-[16px] border border-[#E2E8F0] space-y-3">
                                        <div className="flex flex-col items-center justify-center p-3 bg-white border border-[#E2E8F0] rounded-[12px] shadow-sm">
                                            <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider mb-0.5">Код курса</span>
                                            <span className="text-xl font-black text-[#0F172A] font-mono tracking-tight">{formData.code || "---"}</span>
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[10px] font-bold text-[#64748B] ml-1">Код (ID)</Label>
                                            <Input
                                                value={formData.code}
                                                readOnly={isTeacher}
                                                onChange={e => handleChange('code', e.target.value.toUpperCase())}
                                                className="h-8 px-2 border-[#E2E8F0] bg-white text-[12px] font-bold text-[#0F172A] rounded-[10px] text-center uppercase font-mono"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[10px] font-bold text-[#64748B] ml-1">Статус</Label>
                                            <Select value={formData.status} onValueChange={v => handleChange('status', v)} disabled={isTeacher}>
                                                <SelectTrigger className="h-8 w-full border-[#E2E8F0] bg-white text-[12px] font-medium text-[#0F172A] rounded-[10px]">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl border-[#E2E8F0] shadow-lg">
                                                    <SelectItem value="ACTIVE">Активен</SelectItem>
                                                    <SelectItem value="INACTIVE">Неактивен</SelectItem>
                                                    <SelectItem value="ARCHIVED">Архив</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                {!isTeacher && (
                                    <div className="space-y-2">
                                        <h4 className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest flex items-center gap-1.5">
                                            <Wallet className="h-3 w-3" />
                                            Финансы и Нагрузка
                                        </h4>
                                        <div className="p-3 bg-[#F8FAFC] rounded-[16px] border border-[#E2E8F0] space-y-2">
                                            <div className="space-y-1">
                                                <Label className="text-[10px] font-bold text-[#64748B] ml-1">Стоимость</Label>
                                                <Input
                                                    type="number"
                                                    value={formData.basePrice}
                                                    onChange={e => handleChange('basePrice', e.target.value)}
                                                    className="h-8 px-2 border-[#E2E8F0] bg-white text-[12px] font-medium text-[#0F172A] rounded-[10px]"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[10px] font-bold text-[#64748B] ml-1">Валюта</Label>
                                                <Select value={formData.currency} onValueChange={v => handleChange('currency', v)}>
                                                    <SelectTrigger className="h-8 w-full border-[#E2E8F0] bg-white text-[12px] font-medium text-[#0F172A] rounded-[10px]">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-xl border-[#E2E8F0] shadow-lg">
                                                        <SelectItem value="TJS">TJS (смн)</SelectItem>
                                                        <SelectItem value="RUB">RUB (₽)</SelectItem>
                                                        <SelectItem value="USD">USD ($)</SelectItem>
                                                        <SelectItem value="EUR">EUR (€)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-1 pt-1">
                                                <Label className="text-[10px] font-bold text-[#64748B] ml-1">Часы в неделю</Label>
                                                <Input
                                                    type="number"
                                                    value={formData.hoursPerWeek}
                                                    onChange={e => handleChange('hoursPerWeek', e.target.value)}
                                                    className="h-8 px-2 border-[#E2E8F0] bg-white text-[12px] font-medium text-[#0F172A] rounded-[10px]"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* RIGHT MAIN CONTENT */}
                            <div className="flex-1 space-y-4 w-full lg:mt-0">
                                <div className="space-y-2">
                                    <h4 className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest flex items-center gap-1.5">
                                        <BookOpen className="h-3 w-3" />
                                        Основные данные
                                    </h4>
                                    <div className="p-5 bg-[#F8FAFC] rounded-[20px] border border-[#E2E8F0] space-y-4">
                                        <div className="space-y-1">
                                            <Label className="text-[11px] font-bold text-[#64748B] ml-1.5">Название курса</Label>
                                            <Input
                                                value={formData.name}
                                                readOnly={isTeacher}
                                                onChange={e => handleChange('name', e.target.value)}
                                                className="h-9 px-3.5 border-[#E2E8F0] bg-white text-[13px] font-medium text-[#0F172A] rounded-full focus:ring-4 focus:ring-[#2563EB]/5 focus:border-[#2563EB]"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <Label className="text-[11px] font-bold text-[#64748B] ml-1.5">Формат</Label>
                                                <Select value={formData.format} onValueChange={v => handleChange('format', v)} disabled={isTeacher}>
                                                    <SelectTrigger className="h-9 w-full px-3.5 border-[#E2E8F0] bg-white text-[13px] font-medium text-[#0F172A] rounded-full focus:ring-4 focus:ring-[#2563EB]/5 focus:border-[#2563EB]">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-[16px] border-[#E2E8F0] shadow-xl">
                                                        <SelectItem value="OFFLINE">🏛 Офлайн</SelectItem>
                                                        <SelectItem value="ONLINE">💻 Онлайн</SelectItem>
                                                        <SelectItem value="HYBRID">🔄 Гибрид</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[11px] font-bold text-[#64748B] ml-1.5">Тип группы</Label>
                                                <Select value={formData.grouping} onValueChange={v => handleChange('grouping', v)} disabled={isTeacher}>
                                                    <SelectTrigger className="h-9 w-full px-3.5 border-[#E2E8F0] bg-white text-[13px] font-medium text-[#0F172A] rounded-full focus:ring-4 focus:ring-[#2563EB]/5 focus:border-[#2563EB]">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-[16px] border-[#E2E8F0] shadow-xl">
                                                        <SelectItem value="GROUP">👥 Группа</SelectItem>
                                                        <SelectItem value="INDIVIDUAL">👤 Индивидуально</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <Label className="text-[11px] font-bold text-[#64748B] ml-1.5">Тип курса</Label>
                                                <Select value={formData.type} onValueChange={v => handleChange('type', v)} disabled={isTeacher}>
                                                    <SelectTrigger className="h-9 w-full px-3.5 border-[#E2E8F0] bg-white text-[13px] font-medium text-[#0F172A] rounded-full focus:ring-4 focus:ring-[#2563EB]/5 focus:border-[#2563EB]">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-[16px] border-[#E2E8F0] shadow-xl">
                                                        <SelectItem value="MANDATORY">Основной курс</SelectItem>
                                                        <SelectItem value="ELECTIVE">Спецкурс / По выбору</SelectItem>
                                                        <SelectItem value="OPTIONAL">Факультатив (кружок)</SelectItem>
                                                        <SelectItem value="INTENSIVE">Интенсив / Мастер-класс</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[11px] font-bold text-[#64748B] ml-1.5">Уровень</Label>
                                                <Select value={formData.level} onValueChange={v => handleChange('level', v)} disabled={isTeacher}>
                                                    <SelectTrigger className="h-9 w-full px-3.5 border-[#E2E8F0] bg-white text-[13px] font-medium text-[#0F172A] rounded-full focus:ring-4 focus:ring-[#2563EB]/5 focus:border-[#2563EB]">
                                                        <SelectValue placeholder="Выберите уровень" />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-[16px] border-[#E2E8F0] shadow-xl max-h-[200px]">
                                                        <SelectItem value="A1.1">A1.1 (Beginner 1)</SelectItem>
                                                        <SelectItem value="A1.2">A1.2 (Beginner 2)</SelectItem>
                                                        <SelectItem value="A2.1">A2.1 (Elementary 1)</SelectItem>
                                                        <SelectItem value="A2.2">A2.2 (Elementary 2)</SelectItem>
                                                        <SelectItem value="B1.1">B1.1 (Pre-Intermediate 1)</SelectItem>
                                                        <SelectItem value="B1.2">B1.2 (Pre-Intermediate 2)</SelectItem>
                                                        <SelectItem value="B2.1">B2.1 (Intermediate 1)</SelectItem>
                                                        <SelectItem value="B2.2">B2.2 (Intermediate 2)</SelectItem>
                                                        <SelectItem value="C1.1">C1.1 (Upper-Intermediate 1)</SelectItem>
                                                        <SelectItem value="C1.2">C1.2 (Upper-Intermediate 2)</SelectItem>
                                                        <SelectItem value="C2">C2 (Proficiency)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        {(modules.faculties || modules.departments) && (
                                            <div className="space-y-1">
                                                <Label className="text-[11px] font-bold text-[#64748B] ml-1.5">Структура</Label>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {modules.faculties && (
                                                        <Select value={formData.facultyId} onValueChange={v => {
                                                            handleChange('facultyId', v);
                                                            setFormData(prev => ({ ...prev, departmentId: "" }));
                                                        }} disabled={isTeacher}>
                                                            <SelectTrigger className="h-9 w-full px-3.5 border-[#E2E8F0] bg-white text-[13px] font-medium text-[#0F172A] rounded-full focus:ring-4 focus:ring-[#2563EB]/5 focus:border-[#2563EB]">
                                                                <SelectValue placeholder="Факультет" />
                                                            </SelectTrigger>
                                                            <SelectContent className="rounded-[16px] border-[#E2E8F0] shadow-xl">
                                                                {faculties.map(f => (
                                                                    <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    )}

                                                    {modules.departments && (
                                                        <Select value={formData.departmentId} onValueChange={v => handleChange('departmentId', v)} disabled={!formData.facultyId || isTeacher}>
                                                            <SelectTrigger className="h-9 w-full px-3.5 border-[#E2E8F0] bg-white text-[13px] font-medium text-[#0F172A] rounded-full focus:ring-4 focus:ring-[#2563EB]/5 focus:border-[#2563EB]">
                                                                <SelectValue placeholder="Кафедра" />
                                                            </SelectTrigger>
                                                            <SelectContent className="rounded-[16px] border-[#E2E8F0] shadow-xl">
                                                                {departments.map(d => (
                                                                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        <div className="space-y-1">
                                            <Label className="text-[11px] font-bold text-[#64748B] ml-1.5">Цель обучения</Label>
                                            <Textarea
                                                value={formData.objective}
                                                readOnly={isTeacher}
                                                onChange={e => handleChange('objective', e.target.value)}
                                                className="min-h-[80px] p-3 rounded-[16px] border-[#E2E8F0] bg-white focus:ring-4 focus:ring-[#2563EB]/5 focus:border-[#2563EB] resize-none text-[13px] font-medium"
                                                placeholder="Чему научатся студенты..."
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <Label className="text-[11px] font-bold text-[#64748B] ml-1.5">Описание</Label>
                                            <Textarea
                                                value={formData.description}
                                                readOnly={isTeacher}
                                                onChange={e => handleChange('description', e.target.value)}
                                                className="min-h-[100px] p-3 rounded-[16px] border-[#E2E8F0] bg-white focus:ring-4 focus:ring-[#2563EB]/5 focus:border-[#2563EB] resize-none text-[13px] font-medium"
                                                placeholder="Краткое описание курса..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="teachers" className="flex-1 m-0 p-5 pb-2 overflow-hidden data-[state=active]:flex data-[state=active]:flex-col animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
                            {/* LEFT SIDE: LIST OF ASSIGNED TEACHERS */}
                            <div className="w-full lg:w-[280px] flex flex-col gap-4 shrink-0">
                                <div className="flex items-center justify-between px-1">
                                    <h4 className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest flex items-center gap-1.5">
                                        <GraduationCap className="h-3 w-3" />
                                        Преподаватели ({formData.teachers.length})
                                    </h4>
                                    {!isTeacher && (
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => setIsAssignModalOpen(true)}
                                            className="h-7 w-7 rounded-full bg-indigo-50 border-indigo-100 text-indigo-600 shadow-sm hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all active:scale-90"
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>

                                <ScrollArea className="flex-1 pr-2">
                                    <div className="space-y-2">
                                        {formData.teachers.length === 0 ? (
                                            <div className="p-8 border-2 border-dashed border-[#E2E8F0] rounded-[20px] flex flex-col items-center justify-center text-center bg-[#F8FAFC]">
                                                <GraduationCap className="h-8 w-8 text-[#94A3B8] mb-2 opacity-50" />
                                                <p className="text-[11px] font-medium text-[#64748B]">Нет назначений</p>
                                            </div>
                                        ) : (
                                            formData.teachers.map(assignment => {
                                                const teacher = allTeachers.find(t => t.id === assignment.userId);
                                                if (!teacher) return null;
                                                const isSelected = selectedTeacherId === assignment.userId;

                                                return (
                                                    <div
                                                        key={assignment.userId}
                                                        onClick={() => setSelectedTeacherId(assignment.userId)}
                                                        className={cn(
                                                            "group relative flex items-center gap-3 p-2.5 rounded-[16px] cursor-pointer transition-all border",
                                                            isSelected
                                                                ? "bg-white border-[#2563EB] shadow-md shadow-[#2563EB]/5"
                                                                : "bg-[#F8FAFC] border-transparent hover:border-[#E2E8F0] hover:bg-white"
                                                        )}
                                                    >
                                                        <Avatar
                                                            className="h-9 w-9 rounded-[10px] border border-[#E5E7EB] shrink-0 cursor-zoom-in hover:opacity-80 transition-opacity"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setPassportTeacher(teacher);
                                                                setIsPassportModalOpen(true);
                                                            }}
                                                        >
                                                            <AvatarImage src={teacher.passportPhotoUrl} className="object-cover object-top" />
                                                            <AvatarFallback className="text-[10px] font-black text-[#64748B] bg-white">
                                                                {teacher.firstName[0]}{teacher.lastName[0]}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="min-w-0 pr-6">
                                                            <div className="text-[12px] font-bold text-[#0F172A] truncate">
                                                                {teacher.firstName} {teacher.lastName}
                                                            </div>
                                                            <div className="text-[10px] font-medium text-[#64748B] truncate opacity-70 uppercase tracking-tighter flex items-center gap-1.5">
                                                                <span>{assignment.role === 'PRIMARY' ? 'Основной' : assignment.role === 'ASSISTANT' ? 'Ассистент' : 'Замена'}</span>
                                                                <div className="flex items-center gap-1 ml-1.5 flex-wrap max-w-[60px]">
                                                                    {assignment.permissions?.manageGrades && <BookOpen className="h-2.5 w-2.5 text-[#2563EB]" />}
                                                                    {assignment.permissions?.manageAttendance && <CheckCircle2 className="h-2.5 w-2.5 text-[#22C55E]" />}
                                                                    {assignment.permissions?.manageGroups && <Users className="h-2.5 w-2.5 text-[#7C3AED]" />}
                                                                    {assignment.permissions?.manageMaterials && <FileText className="h-2.5 w-2.5 text-[#F59E0B]" />}
                                                                    {assignment.permissions?.manageEvents && <Calendar className="h-2.5 w-2.5 text-[#EF4444]" />}
                                                                    {assignment.permissions?.manageModules && <List className="h-2.5 w-2.5 text-[#10B981]" />}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {!isTeacher && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    const newTeachers = formData.teachers.filter(t => t.userId !== assignment.userId);
                                                                    handleChange('teachers', newTeachers);
                                                                    if (selectedTeacherId === assignment.userId) {
                                                                        setSelectedTeacherId(newTeachers[0]?.userId || null);
                                                                    }
                                                                }}
                                                                className="absolute right-2 h-6 w-6 rounded-full text-[#94A3B8] hover:text-[#EF4444] hover:bg-[#FEF2F2] opacity-0 group-hover:opacity-100 transition-all"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </ScrollArea>
                            </div>

                            {/* RIGHT SIDE: PERMISSIONS & ROLE EDITOR */}
                            <div className="flex-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[24px] overflow-hidden flex flex-col">
                                {selectedTeacherId && formData.teachers.find(t => t.userId === selectedTeacherId) ? (
                                    <ScrollArea className="flex-1">
                                        <div className="p-6 space-y-6">
                                            {/* Selection Info */}
                                            {(() => {
                                                const assignment = formData.teachers.find(t => t.userId === selectedTeacherId)!;
                                                const teacher = allTeachers.find(t => t.id === selectedTeacherId);
                                                if (!teacher) return null;

                                                return (
                                                    <>
                                                        <div className="flex items-center gap-4 pb-6 border-b border-[#E2E8F0]">
                                                            <Avatar
                                                                className="h-12 w-12 rounded-[14px] border border-[#E5E7EB] shadow-sm shrink-0 cursor-zoom-in hover:opacity-80 transition-opacity"
                                                                onClick={() => {
                                                                    setPassportTeacher(teacher);
                                                                    setIsPassportModalOpen(true);
                                                                }}
                                                            >
                                                                <AvatarImage src={teacher.passportPhotoUrl} className="object-cover object-top" />
                                                                <AvatarFallback className="text-[14px] font-black text-[#64748B] bg-white">
                                                                    {teacher.firstName[0]}{teacher.lastName[0]}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <h3 className="text-[16px] font-black text-[#0F172A] tracking-tight leading-tight">
                                                                    {teacher.firstName} {teacher.lastName}
                                                                </h3>
                                                                <p className="text-[12px] font-medium text-[#64748B]">{teacher.specialization}</p>
                                                            </div>
                                                        </div>

                                                        {/* Role Selection */}
                                                        <div className="space-y-3">
                                                            <h4 className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest flex items-center gap-1.5">
                                                                <UserCog className="h-3 w-3" />
                                                                Роль в курсе
                                                            </h4>
                                                            <div className="grid grid-cols-3 gap-2">
                                                                {[
                                                                    { id: 'PRIMARY', label: 'Основной', icon: Save, color: '#2563EB' },
                                                                    { id: 'ASSISTANT', label: 'Ассистент', icon: Users, color: '#0EA5E9' },
                                                                    { id: 'SUBSTITUTE', label: 'Замена', icon: X, color: '#64748B' }
                                                                ].map(role => (
                                                                    <button
                                                                        key={role.id}
                                                                        disabled={isTeacher}
                                                                        onClick={() => {
                                                                            const presets = {
                                                                                PRIMARY: { manageGrades: true, manageAttendance: true, manageGroups: true, manageMaterials: true, manageEvents: true, manageModules: true },
                                                                                ASSISTANT: { manageGrades: true, manageAttendance: true, manageGroups: false, manageMaterials: true, manageEvents: true, manageModules: false },
                                                                                SUBSTITUTE: { manageGrades: false, manageAttendance: true, manageGroups: false, manageMaterials: false, manageEvents: false, manageModules: false },
                                                                            };
                                                                            const newTeachers = formData.teachers.map(t =>
                                                                                t.userId === selectedTeacherId ? {
                                                                                    ...t,
                                                                                    role: role.id as any,
                                                                                    permissions: presets[role.id as keyof typeof presets]
                                                                                } : t
                                                                            );
                                                                            handleChange('teachers', newTeachers);
                                                                        }}
                                                                        className={cn(
                                                                            "flex flex-col items-center gap-1.5 p-3 rounded-[16px] border transition-all",
                                                                            assignment.role === role.id
                                                                                ? "bg-white border-[#2563EB] shadow-sm"
                                                                                : "bg-transparent border-[#E2E8F0] hover:border-[#CBD5E1]"
                                                                        )}
                                                                    >
                                                                        <div
                                                                            className="h-7 w-7 rounded-full flex items-center justify-center mb-0.5"
                                                                            style={{ backgroundColor: assignment.role === role.id ? `${role.color}15` : '#F1F5F9' }}
                                                                        >
                                                                            <role.icon className="h-3.5 w-3.5" style={{ color: assignment.role === role.id ? role.color : '#94A3B8' }} />
                                                                        </div>
                                                                        <span className={cn(
                                                                            "text-[10px] font-bold",
                                                                            assignment.role === role.id ? "text-[#0F172A]" : "text-[#64748B]"
                                                                        )}>
                                                                            {role.label}
                                                                        </span>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Permissions Checklist */}
                                                        <div className="space-y-3">
                                                            <div className="flex items-center justify-between">
                                                                <h4 className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest flex items-center gap-1.5">
                                                                    <LayoutDashboard className="h-3 w-3" />
                                                                    Разрешения (Доступы)
                                                                </h4>
                                                                <div className="flex items-center gap-2 px-2 py-1 bg-white rounded-lg border border-[#E2E8F0] shadow-sm">
                                                                    <span className="text-[9px] font-black uppercase text-[#64748B] tracking-tighter">Все</span>
                                                                    <Switch
                                                                        className="scale-75 origin-right"
                                                                        checked={Object.values(assignment.permissions || {}).every(v => v === true)}
                                                                        onCheckedChange={(checked) => {
                                                                            const newTeachers = formData.teachers.map(t =>
                                                                                t.userId === selectedTeacherId ? {
                                                                                    ...t,
                                                                                    permissions: {
                                                                                        manageGrades: checked,
                                                                                        manageAttendance: checked,
                                                                                        manageGroups: checked,
                                                                                        manageMaterials: checked,
                                                                                        manageEvents: checked,
                                                                                        manageModules: checked
                                                                                    }
                                                                                } : t
                                                                            );
                                                                            handleChange('teachers', newTeachers);
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="grid grid-cols-1 gap-1.5">
                                                                {[
                                                                    { id: 'manageGrades', label: 'Управление оценками', desc: 'Баллы и результаты обучения' },
                                                                    { id: 'manageAttendance', label: 'Учет посещаемости', desc: 'Журнал присутствия и опозданий' },
                                                                    { id: 'manageGroups', label: 'Управление группами', desc: 'Настройки и расписание групп' },
                                                                    { id: 'manageMaterials', label: 'Материалы курса', desc: 'Учебные пособия, файлы и ссылки' },
                                                                    { id: 'manageEvents', label: 'События и тесты', desc: 'Планирование экзаменов и контрольных' },
                                                                    { id: 'manageModules', label: 'Программа обучения', desc: 'Редактирование тем и модулей' },
                                                                ].map(perm => (
                                                                    <div
                                                                        key={perm.id}
                                                                        className="flex items-center justify-between p-2.5 bg-white rounded-[14px] border border-[#E2E8F0] shadow-sm transition-all hover:border-[#CBD5E1]"
                                                                    >
                                                                        <div className="space-y-0 pr-3">
                                                                            <p className="text-[12px] font-bold text-[#0F172A] leading-tight">{perm.label}</p>
                                                                            <p className="text-[9px] font-medium text-[#64748B] opacity-60 leading-tight">{perm.desc}</p>
                                                                        </div>
                                                                        <Switch
                                                                            className="scale-75 origin-right"
                                                                            disabled={isTeacher}
                                                                            checked={assignment.permissions?.[perm.id as keyof typeof assignment.permissions] ?? false}
                                                                            onCheckedChange={(checked) => {
                                                                                const newTeachers = formData.teachers.map(t =>
                                                                                    t.userId === selectedTeacherId ? {
                                                                                        ...t,
                                                                                        permissions: { ...t.permissions, [perm.id]: checked }
                                                                                    } : t
                                                                                );
                                                                                handleChange('teachers', newTeachers);
                                                                            }}
                                                                        />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    </ScrollArea>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                                        <div className="h-16 w-16 rounded-full bg-white border border-[#E2E8F0] flex items-center justify-center mb-4 shadow-sm">
                                            <UserCog className="h-8 w-8 text-[#94A3B8] opacity-30" />
                                        </div>
                                        <h3 className="text-[14px] font-bold text-[#0F172A] mb-1">Настройки преподавателя</h3>
                                        <p className="text-[11px] text-[#64748B] max-w-[200px]">Выберите преподавателя слева для настройки прав и ролей в этом курсе</p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </TabsContent>

                    <TabsContent value="groups" className="flex-1 m-0 p-5 pb-2 overflow-hidden data-[state=active]:flex data-[state=active]:flex-col animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex-1 flex flex-col gap-6 overflow-hidden">
                            {/* Header for Groups */}
                            <div className="flex items-center justify-between px-1">
                                <h4 className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest flex items-center gap-1.5">
                                    <Users2 className="h-3 w-3" />
                                    Привязанные группы ({formData.groupIds?.length || 0})
                                </h4>
                                {!isTeacher && (
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => setIsLinkGroupsModalOpen(true)}
                                        className="h-7 w-7 rounded-full bg-emerald-50 border-emerald-100 text-emerald-600 shadow-sm hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all active:scale-90"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>

                            {/* Groups List */}
                            <ScrollArea className="flex-1 -mx-5 px-5">
                                {fetchingGroups ? (
                                    <div className="flex flex-col items-center justify-center py-20">
                                        <Loader2 className="h-6 w-6 text-[#2563EB] animate-spin mb-2" />
                                        <p className="text-[12px] font-medium text-[#64748B]">Загрузка групп...</p>
                                    </div>
                                ) : formData.groupIds?.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 bg-[#F8FAFC] rounded-[24px] border border-dashed border-[#E2E8F0] m-1">
                                        <div className="w-16 h-16 rounded-[20px] bg-white border border-[#E2E8F0] shadow-sm flex items-center justify-center mb-4">
                                            <Users2 className="h-6 w-6 text-[#CBD5E1]" />
                                        </div>
                                        <p className="text-[14px] font-bold text-[#0F172A] mb-1">Группы не привязаны</p>
                                        <p className="text-[11px] text-[#64748B] text-center max-w-[180px] leading-relaxed">
                                            Привяжите группы, чтобы студенты могли начать обучение по этому курсу
                                        </p>
                                        {!isTeacher && (
                                            <Button
                                                variant="outline"
                                                onClick={() => setIsLinkGroupsModalOpen(true)}
                                                className="mt-6 h-8 px-4 rounded-full border-[#2563EB] text-[#2563EB] text-[11px] font-bold hover:bg-[#2563EB] hover:text-white transition-all active:scale-95"
                                            >
                                                Привязать группу
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pb-6">
                                        {formData.groupIds.map(id => {
                                            const group = linkedGroups.find(g => g.id === id);
                                            return (
                                                <div
                                                    key={id}
                                                    className="group relative bg-white border border-[#E2E8F0] p-4 rounded-[20px] shadow-sm hover:border-[#2563EB]/40 hover:shadow-md transition-all flex flex-col gap-3"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-[14px] bg-[#F1F5F9] group-hover:bg-[#2563EB]/10 flex items-center justify-center transition-colors">
                                                            <Users2 className="h-5 w-5 text-[#64748B] group-hover:text-[#2563EB]" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h5 className="text-[14px] font-bold text-[#0F172A] truncate leading-tight">
                                                                {group?.name || "Загрузка..."}
                                                            </h5>
                                                            <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                                                                {group?.code || "---"}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-2 mt-1">
                                                        <div className="px-2.5 py-1.5 bg-[#F8FAFC] rounded-[10px] flex items-center gap-1.5">
                                                            <GraduationCap className="h-3 w-3 text-[#2563EB]" />
                                                            <span className="text-[11px] font-bold text-[#0F172A]">{group?.studentsCount || 0} уч.</span>
                                                        </div>
                                                        <div className="px-2.5 py-1.5 bg-[#F8FAFC] rounded-[10px] flex items-center gap-1.5">
                                                            <Hash className="h-3 w-3 text-[#10B981]" />
                                                            <span className="text-[11px] font-bold text-[#0F172A]">{group?.level || "---"}</span>
                                                        </div>
                                                    </div>

                                                    {!isTeacher && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => {
                                                                const newIds = formData.groupIds.filter(gid => gid !== id);
                                                                handleChange('groupIds', newIds);
                                                            }}
                                                            className="absolute top-2 right-2 h-7 w-7 rounded-full text-[#EF4444] hover:bg-[#EF4444]/10 opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                                                        >
                                                            <UserMinus className="h-3.5 w-3.5" />
                                                        </Button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </ScrollArea>
                        </div>

                    </TabsContent>
                </div>
            </Tabs>

            <AssignTeachersModal
                course={course}
                open={isAssignModalOpen}
                onOpenChange={setIsAssignModalOpen}
                onSave={(id, teacherIds, teachers) => {
                    if (teachers) {
                        const combined = [...formData.teachers, ...teachers.filter(t => !formData.teachers.some(ft => ft.userId === t.userId))];
                        handleChange('teachers', combined);
                        if (!selectedTeacherId && combined.length > 0) {
                            setSelectedTeacherId(combined[0].userId);
                        }
                    }
                }}
            />

            <LinkGroupsModal
                course={course}
                open={isLinkGroupsModalOpen}
                onOpenChange={setIsLinkGroupsModalOpen}
                onSave={(id: string, groupIds: string[]) => {
                    handleChange('groupIds', groupIds);
                }}
            />

            <ArchiveCourseModal
                course={course}
                open={isArchiveModalOpen}
                onOpenChange={setIsArchiveModalOpen}
                onArchive={async (id, reason, notes) => {
                    await onUpdate(id, {
                        status: 'ARCHIVED',
                        archiveInfo: {
                            reason,
                            notes,
                            archivedAt: new Date().toISOString(),
                            archivedByUid: userData?.uid || "system"
                        }
                    });
                }}
            />

            <DeleteCourseModal
                courseName={course.name}
                open={isDeleteModalOpen}
                onOpenChange={setIsDeleteModalOpen}
                onConfirm={async () => {
                    if (onDelete) onDelete(course.id);
                }}
            />

            <TeacherPassportModal
                teacher={passportTeacher}
                open={isPassportModalOpen}
                onOpenChange={setIsPassportModalOpen}
            />
        </div>
    );
}
