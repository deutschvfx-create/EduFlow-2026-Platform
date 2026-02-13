import { Student } from "@/lib/types/student";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
    User, Users, Wallet, ShieldCheck,
    Save, Ban, Trash2, Mail, Phone, MapPin, Search,
    MoreVertical, Info, AlertTriangle, X, Printer, Download, CreditCard, Settings,
    BookOpen, Zap, CheckCircle2, Camera, RotateCcw, Loader2, Calendar as CalendarIcon
} from "lucide-react";
import { StudentCardHorizontal } from "@/components/students/student-card-horizontal";
import { useOrganization } from "@/hooks/use-organization";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { ActionGuard } from "@/components/auth/action-guard";
import { useRole } from "@/hooks/use-role";
import { PassportPhotoEditor } from "./passport-photo-editor";
import { useState, useRef, useEffect } from "react";
import { studentsRepo } from "@/lib/data/students.repo";
import heic2any from "heic2any";
import { Calendar } from "@/components/ui/calendar";
import { attendanceRepo } from "@/lib/data/attendance.repo";
import { AttendanceRecord } from "@/lib/types/attendance";
import { ru } from "date-fns/locale";
import { Course } from "@/lib/types/course";

interface StudentDetailPanelProps {
    student: Student | null;
    onAction: (action: string, id: string) => Promise<void>;
    onClose?: () => void;
    onPreviewChange?: (student: Partial<Student>) => void;
}

// NOTE HELPERS
const getNoteField = (notes: string | undefined, prefix: string) => {
    if (!notes) return "";
    const regex = new RegExp(`${prefix}:(.*)(\\n|$)`);
    const match = notes.match(regex);
    return match ? match[1].trim() : "";
};

const updateNoteField = (notes: string | undefined, prefix: string, value: string) => {
    const lines = (notes || "").split('\n').filter(l => !l.trim().startsWith(`${prefix}:`));
    if (value) lines.push(`${prefix}:${value}`);
    return lines.join('\n').trim();
};

export function StudentDetailPanel({
    student,
    onAction,
    onClose,
    onPreviewChange
}: StudentDetailPanelProps) {
    const { currentOrganizationId } = useOrganization();
    const { role, isOwner } = useRole();
    const isAdmin = isOwner || role === ('admin' as any); // Cast because UserRole is owner|teacher|student but logic might want admin

    // Mock Toast matching other components
    const toast = { success: (m: string) => alert(m), error: (m: string) => alert(m) };

    const [isEditingPhoto, setIsEditingPhoto] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isProcessingFile, setIsProcessingFile] = useState(false);
    const [pendingImage, setPendingImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form states
    const [formData, setFormData] = useState({
        firstName: student?.firstName || "",
        lastName: student?.lastName || "",
        email: student?.email || "",
        phone: student?.phone || "",
        birthYear: student?.birthDate ? new Date(student.birthDate).toLocaleDateString('ru-RU') : "",
        gender: student?.gender || "",
        citizenship: getNoteField(student?.notes, 'CITZ'),
        nativeLanguage: getNoteField(student?.notes, 'LANG'),
        adminComment: getNoteField(student?.notes, 'ADMIN'),
        address: getNoteField(student?.notes, 'ADDR'),
        startLevel: student?.academicProgress?.startLevel || "Start",
        currentLevel: student?.academicProgress?.currentLevel || student?.level || "Start",
        teacherRecommendation: student?.academicProgress?.teacherRecommendation || "",
        academicComment: student?.academicProgress?.academicComment || "",
        publicSettings: student?.publicSettings || {
            showPhoto: true,
            showGender: true,
            showLevel: true,
            showGroup: true
        }
    });

    const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
    const [selectedDetailRecord, setSelectedDetailRecord] = useState<AttendanceRecord | null>(null);
    const [showHistory, setShowHistory] = useState(false);
    const [isTopUpOpen, setIsTopUpOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Mock Finance Data (Language School Specific)
    const [financeData, setFinanceData] = useState({
        courseType: 'individual' as 'individual' | 'group',
        format: 'Online',
        totalPrice: 45000,
        paidSoFar: 32000,
        deadlineDate: '2026-03-15T00:00:00Z',
        remainingLessons: 12,
        activeCourse: "General English B2+",
        currency: 'RUB' as 'RUB' | 'USD' | 'EUR' | 'TJS'
    });

    const [transactions, setTransactions] = useState([
        { date: '12.01.24', label: 'Оплата за обучение', sub: 'GENERAL ENGLISH', amount: 3200, status: 'plus' },
        { date: '08.01.24', label: 'Списание за занятие', sub: 'LESSON SKIP', amount: -600, status: 'minus' }, // -1200 / 2 (example logic)
        { date: '01.01.24', label: 'Пополнение баланса', sub: 'CARD *4421', amount: 10000, status: 'plus' },
    ]);

    // Financial Settings State
    // Financial Settings State
    const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
    const [tempSettings, setTempSettings] = useState({
        activeCourse: financeData.activeCourse,
        courseType: financeData.courseType,
        totalPrice: financeData.totalPrice,
        currency: financeData.currency,
        deadlineDate: financeData.deadlineDate
    });

    useEffect(() => {
        if (isSettingsOpen) {
            // Reset temp settings to current finance data when opening
            setTempSettings({
                activeCourse: financeData.activeCourse,
                courseType: financeData.courseType,
                totalPrice: financeData.totalPrice,
                currency: financeData.currency,
                deadlineDate: financeData.deadlineDate
            });

            if (currentOrganizationId) {
                import("@/lib/data/courses.repo").then(m => {
                    m.coursesRepo.getAll(currentOrganizationId).then(courses => {
                        setAvailableCourses(courses.filter(c => c.status === 'ACTIVE'));
                    });
                });
            }
        }
    }, [isSettingsOpen, currentOrganizationId, financeData]);

    // Helper: Currency Symbol
    const getCurrencySymbol = (currency: string) => {
        switch (currency) {
            case 'USD': return '$';
            case 'EUR': return '€';
            case 'TJS': return 'смн';
            default: return '₽';
        }
    };

    // Helper: Calculate Countdown
    const getCountdown = (deadline: string) => {
        const now = new Date();
        const diff = new Date(deadline).getTime() - now.getTime();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return {
            days,
            isOverdue: diff < 0,
            status: days > 7 ? 'good' : days > 0 ? 'warning' : 'danger'
        };
    };

    useEffect(() => {
        if (student?.id && currentOrganizationId) {
            attendanceRepo.getAll(currentOrganizationId, undefined, { studentId: student.id })
                .then(records => {
                    // Add mock data for demonstration with enriched details
                    const mockData: AttendanceRecord[] = [
                        {
                            id: 'mock-1', studentId: student.id, date: new Date('2026-02-07').toISOString(),
                            status: 'PRESENT' as any, organizationId: currentOrganizationId, scheduleId: 'mock-s1',
                            note: JSON.stringify({
                                teacher: "Анна Смирнова",
                                time: "14:00 - 15:30",
                                group: "Level Course B2",
                                audit: {
                                    created: { by: "Admin (Ольга)", at: "2026-02-07 14:00:12" },
                                    updated: { by: "Teacher (Анна)", at: "2026-02-07 15:32:45" }
                                }
                            })
                        },
                        {
                            id: 'mock-2', studentId: student.id, date: new Date('2026-02-06').toISOString(),
                            status: 'LATE' as any, organizationId: currentOrganizationId, scheduleId: 'mock-s2',
                            note: JSON.stringify({
                                teacher: "Иван Петров",
                                time: "10:00 - 11:30",
                                group: "Fast Track A1",
                                audit: {
                                    created: { by: "Admin (Ольга)", at: "2026-02-06 10:02:05" },
                                    updated: { by: "Admin (Ольга)", at: "2026-02-06 10:15:33" }
                                }
                            })
                        },
                        {
                            id: 'mock-3', studentId: student.id, date: new Date('2026-02-05').toISOString(),
                            status: 'ABSENT' as any, organizationId: currentOrganizationId, scheduleId: 'mock-s3',
                            note: JSON.stringify({
                                teacher: "Елена Соколова",
                                time: "18:00 - 19:30",
                                group: "Evening Group C1",
                                audit: {
                                    created: { by: "System", at: "2026-02-05 18:00:00" },
                                    updated: { by: "Teacher (Елена)", at: "2026-02-05 19:45:10" }
                                }
                            })
                        },
                    ];
                    setAttendanceRecords([...mockData, ...records]);
                })
                .catch(console.error);
        }
    }, [student?.id, currentOrganizationId]);

    // Notify parent of changes for real-time preview
    useEffect(() => {
        if (!onPreviewChange || !student) return;

        // Convert birthYear (DD.MM.YYYY) back to YYYY-MM-DD for preview
        let birthDate = student.birthDate;
        if (formData.birthYear && formData.birthYear.length === 10) {
            const [day, month, year] = formData.birthYear.split('.');
            if (day && month && year) {
                birthDate = `${year}-${month}-${day}`;
            }
        }

        onPreviewChange({
            firstName: formData.firstName,
            lastName: formData.lastName,
            gender: formData.gender as any,
            birthDate: birthDate,
            level: formData.currentLevel, // Update preview with edited level
            // Add other fields if they are visualized in the passport
        });
    }, [formData, onPreviewChange, student]);

    const handleReset = () => {
        if (!student) return;
        setFormData({
            firstName: student.firstName || "",
            lastName: student.lastName || "",
            email: student.email || "",
            phone: student.phone || "",
            birthYear: student.birthDate ? new Date(student.birthDate).toLocaleDateString('ru-RU') : "",
            gender: student.gender || "",
            citizenship: getNoteField(student.notes, 'CITZ'),
            nativeLanguage: getNoteField(student.notes, 'LANG'),
            adminComment: getNoteField(student.notes, 'ADMIN'),
            address: getNoteField(student.notes, 'ADDR'),
            startLevel: student.academicProgress?.startLevel || "Start",
            currentLevel: student.academicProgress?.currentLevel || student.level || "Start",
            teacherRecommendation: student.academicProgress?.teacherRecommendation || "",
            academicComment: student.academicProgress?.academicComment || "",
            publicSettings: student.publicSettings || {
                showPhoto: true,
                showGender: true,
                showLevel: true,
                showGroup: true
            }
        });
        toast.success("Данные сброшены");
    };

    const handleSaveProfile = async () => {
        if (!currentOrganizationId || !student || !isAdmin) return;
        setIsSaving(true);
        try {
            // Reconstruct birthDate from DD.MM.YYYY to YYYY-MM-DD
            const [day, month, year] = formData.birthYear.split('.');
            const birthDate = `${year}-${month}-${day}`;

            // Prepare notes with metadata
            let n = student.notes || "";
            n = updateNoteField(n, 'ADDR', formData.address);
            n = updateNoteField(n, 'CITZ', formData.citizenship);
            n = updateNoteField(n, 'LANG', formData.nativeLanguage);
            n = updateNoteField(n, 'ADMIN', formData.adminComment);

            await studentsRepo.update(currentOrganizationId, student.id, {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                gender: formData.gender as any,
                birthDate,
                notes: n,
                publicSettings: formData.publicSettings
            });
            toast.success("Профиль успешно обновлен");
            await onAction('refresh', student.id);
        } catch (err) {
            console.error(err);
            toast.error("Ошибка при сохранении");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSavePhoto = async (dataUrl: string) => {
        if (!currentOrganizationId || !student || !isAdmin) return;
        setIsSaving(true);
        try {
            await studentsRepo.update(currentOrganizationId, student.id, {
                passportPhotoUrl: dataUrl
            });
            toast.success("Фото сохранено");
            setIsEditingPhoto(false);
            setPendingImage(null);
            await onAction('refresh', student.id);
        } catch (err) {
            console.error(err);
            toast.error("Ошибка при сохранении фото");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveProgress = async () => {
        if (!currentOrganizationId || !student || !isAdmin) return;
        setIsSaving(true);
        try {
            await studentsRepo.update(currentOrganizationId, student.id, {
                // Ensure level is updated at root if needed by legacy systems, 
                // but primarily update academicProgress
                level: formData.currentLevel,
                academicProgress: {
                    startLevel: formData.startLevel,
                    currentLevel: formData.currentLevel,
                    teacherRecommendation: formData.teacherRecommendation,
                    academicComment: formData.academicComment
                }
            });
            toast.success("Прогресс сохранен");
            await onAction('refresh', student.id);
        } catch (err) {
            console.error(err);
            toast.error("Ошибка при сохранении прогресса");
        } finally {
            setIsSaving(false);
        }
    };

    const handleFilePickerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];

            if (file.size > 5 * 1024 * 1024) {
                toast.error("Файл слишком большой (макс. 5MB)");
                return;
            }

            setIsProcessingFile(true);
            try {
                let processedFile = file;
                if (file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic')) {
                    const convertedBlob = await heic2any({
                        blob: file,
                        toType: "image/jpeg",
                        quality: 0.8
                    });
                    processedFile = new File([Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob],
                        file.name.replace(/\.heic$/i, '.jpg'), { type: "image/jpeg" });
                }

                const reader = new FileReader();
                reader.onload = () => {
                    setPendingImage(reader.result as string);
                    setIsEditingPhoto(true);
                    setIsProcessingFile(false);
                };
                reader.readAsDataURL(processedFile);
            } catch (err) {
                console.error(err);
                toast.error("Ошибка при обработке файла");
                setIsProcessingFile(false);
            }
        }
    };

    const handleOpenEditor = () => {
        if (student?.passportPhotoUrl) {
            setPendingImage(null); // Use existing
            setIsEditingPhoto(true);
        } else {
            fileInputRef.current?.click();
        }
    };

    const handleDeletePhoto = async () => {
        if (!currentOrganizationId || !student || !isAdmin) return;
        setIsSaving(true);
        try {
            await studentsRepo.update(currentOrganizationId, student.id, {
                passportPhotoUrl: ""
            });
            toast.success("Фото удалено");
            setIsEditingPhoto(false);
            await onAction('refresh', student.id);
        } catch (err) {
            console.error(err);
            toast.error("Ошибка при удалении фото");
        } finally {
            setIsSaving(false);
        }
    };

    if (!student) return null;

    const groups = [
        {
            label: 'Основные', tabs: [
                { id: 'profile', icon: User, label: 'Профиль' },
                { id: 'notes', icon: Info, label: 'Заметки' }
            ]
        },
        {
            label: 'Обучение', tabs: [
                { id: 'groups', icon: Users, label: 'Группы' },
                { id: 'progress', icon: Zap, label: 'Прогресс' },
                { id: 'attendance', icon: CalendarIcon, label: 'Посещаемость' }
            ]
        },
        {
            label: 'Финансы', tabs: [
                { id: 'payments', icon: Wallet, label: 'Финансы' }
            ]
        },
        {
            label: 'Система', tabs: [
                { id: 'access', icon: ShieldCheck, label: 'Доступ' },
                { id: 'audit', icon: Search, label: 'Лог' }
            ]
        }
    ];

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-white rounded-[24px] border border-[#E5E7EB] shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            <Tabs defaultValue="profile" className="flex-1 flex flex-col min-h-0">
                {/* Tabs Navigation Zone */}
                <div className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur-md border-b border-[#E5E7EB] px-4">
                    <div className="flex items-center shrink-0 overflow-x-auto no-scrollbar gap-2">
                        {groups.map((group, gIdx) => (
                            <div key={group.label} className="flex items-center gap-2">
                                <TabsList className="h-[48px] bg-transparent p-0 gap-0.5 flex-nowrap rounded-none border-none no-scrollbar items-center">
                                    {group.tabs.map(tab => (
                                        <TabsTrigger
                                            key={tab.id}
                                            value={tab.id}
                                            className={cn(
                                                "h-[28px] px-2 rounded-full text-[10px] font-bold uppercase tracking-tight transition-all relative font-inter flex items-center gap-1 shrink-0",
                                                "text-[#64748B] hover:text-[#0F172A] hover:bg-[#F5F6F8]",
                                                "data-[state=active]:text-[#2563EB] data-[state=active]:bg-[#2563EB]/10 data-[state=active]:shadow-none"
                                            )}
                                        >
                                            <tab.icon className="h-3 w-3" />
                                            <span className="hidden sm:inline">{tab.label}</span>
                                            <span className="sm:hidden">{tab.label.slice(0, 3)}</span>
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                                {gIdx < groups.length - 1 && <div className="w-px h-2.5 bg-[#E5E7EB] mt-0.5" />}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto no-scrollbar pl-5 pr-8 py-8">
                    <TabsContent value="profile" className="m-0 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {/* 1. TOP SECTION: PHOTO & PERSONAL DATA - TWO COLUMN LAYOUT */}
                        <div className="flex flex-col lg:flex-row gap-5 items-start">
                            {/* LEFT COLUMN: SIDEBAR (PHOTO & COMPACT ADMIN NOTES) */}
                            <div className="w-full lg:w-[240px] shrink-0 space-y-6">
                                <div className="space-y-4">
                                    <h4 className="text-[11px] font-bold text-[#64748B] uppercase tracking-widest flex items-center gap-2 font-inter">
                                        <Camera className="h-3.5 w-3.5" />
                                        Фото для паспорта
                                    </h4>
                                    <div className="p-4 bg-[#F8FAFC] rounded-[24px] border border-[#E2E8F0] flex justify-center">
                                        <button
                                            onClick={handleOpenEditor}
                                            disabled={isProcessingFile || !isAdmin}
                                            className={cn(
                                                "relative w-24 h-32 rounded-[16px] bg-white border border-[#E2E8F0] overflow-hidden shadow-sm shrink-0 transition-all group flex flex-col items-center justify-center",
                                                isAdmin && "hover:border-[#2563EB] hover:shadow-md cursor-pointer active:scale-95"
                                            )}
                                        >
                                            <ActionGuard actionLabel="Редактирование фото доступно после регистрации">
                                                <div className="absolute inset-0 z-10" />
                                            </ActionGuard>
                                            {student.passportPhotoUrl ? (
                                                <>
                                                    <img src={student.passportPhotoUrl} alt="Passport" className="w-full h-full object-cover" />
                                                    {isAdmin && (
                                                        <div className="absolute inset-0 bg-[#0F172A]/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                                                            <Camera className="h-5 w-5 text-white" />
                                                            <span className="text-[8px] font-black text-white uppercase tracking-widest">Изменить</span>
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <div className="flex flex-col items-center gap-1.5 p-2 text-center">
                                                    <div className="w-8 h-8 rounded-full bg-[#F1F5F9] flex items-center justify-center group-hover:bg-[#2563EB]/10 transition-colors">
                                                        <Camera className="h-4 w-4 text-[#94A3B8] group-hover:text-[#2563EB] transition-colors" />
                                                    </div>
                                                    <span className="text-[9px] font-bold text-[#94A3B8] uppercase tracking-tighter group-hover:text-[#2563EB] transition-colors leading-tight">Добавить<br />фото</span>
                                                </div>
                                            )}

                                            {isProcessingFile && (
                                                <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center">
                                                    <div className="w-5 h-5 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
                                                </div>
                                            )}
                                        </button>
                                        {isAdmin && (
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                className="hidden"
                                                accept="image/*,.heic"
                                                onChange={handleFilePickerChange}
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* SIDEBAR ADMIN COMMENT (Compact) */}
                                {isAdmin && (
                                    <div className="space-y-4">
                                        <h4 className="text-[11px] font-bold text-[#64748B] uppercase tracking-widest flex items-center gap-2 font-inter">
                                            <ShieldCheck className="h-3.5 w-3.5 text-[#2563EB]" />
                                            Админ. заметка
                                        </h4>
                                        <div className="p-2.5 bg-[#2563EB]/5 rounded-[20px] border border-[#2563EB]/10 border-dashed space-y-2">
                                            <div className="space-y-1.5">
                                                <div className="flex items-center justify-between ml-1 text-[10px] font-bold text-[#2563EB]/60 uppercase tracking-tight">
                                                    Внутреннее
                                                </div>
                                                <Textarea
                                                    value={formData.adminComment}
                                                    onChange={(e) => setFormData({ ...formData, adminComment: e.target.value })}
                                                    placeholder="Заметки..."
                                                    className="min-h-[80px] p-3.5 border-[#2563EB]/10 bg-white/50 text-[13px] font-medium text-[#0F172A] rounded-[14px] focus:ring-4 focus:ring-[#2563EB]/5 focus:border-[#2563EB]/30 transition-all font-inter resize-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* RIGHT COLUMN: PERSONAL DATA */}
                            <div className="flex-1 space-y-4 w-full lg:mt-0">
                                <h4 className="text-[11px] font-bold text-[#64748B] uppercase tracking-widest flex items-center gap-2 font-inter">
                                    <User className="h-3.5 w-3.5" />
                                    Персональные данные
                                </h4>
                                <div className="p-6 bg-[#F8FAFC] rounded-[24px] border border-[#E2E8F0] space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-[12px] font-bold text-[#64748B] ml-1 font-inter">Имя</Label>
                                            <Input
                                                value={formData.firstName}
                                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                                disabled={!isAdmin}
                                                className="h-10 px-4 border-[#E2E8F0] bg-white text-[14px] font-medium text-[#0F172A] rounded-full focus:ring-4 focus:ring-[#2563EB]/5 focus:border-[#2563EB] transition-all font-inter"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[12px] font-bold text-[#64748B] ml-1 font-inter">Фамилия</Label>
                                            <Input
                                                value={formData.lastName}
                                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                                disabled={!isAdmin}
                                                className="h-10 px-4 border-[#E2E8F0] bg-white text-[14px] font-medium text-[#0F172A] rounded-full focus:ring-4 focus:ring-[#2563EB]/5 focus:border-[#2563EB] transition-all font-inter"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                        <div className="md:col-span-2 space-y-1.5">
                                            <Label className="text-[12px] font-bold text-[#64748B] ml-1 font-inter">Телефон</Label>
                                            <Input
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                disabled={!isAdmin}
                                                placeholder="+7 (___) ___-__-__"
                                                className="h-10 px-4 border-[#E2E8F0] bg-white text-[14px] font-medium text-[#0F172A] rounded-full focus:ring-4 focus:ring-[#2563EB]/5 focus:border-[#2563EB] transition-all font-inter"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[12px] font-bold text-[#64748B] ml-1 font-inter">Дата рождения</Label>
                                            <Input
                                                value={formData.birthYear}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/\D/g, "");
                                                    let formatted = value;
                                                    if (value.length > 2 && value.length <= 4) {
                                                        formatted = `${value.slice(0, 2)}.${value.slice(2)}`;
                                                    } else if (value.length > 4) {
                                                        formatted = `${value.slice(0, 2)}.${value.slice(2, 4)}.${value.slice(4, 8)}`;
                                                    }
                                                    setFormData({ ...formData, birthYear: formatted });
                                                }}
                                                disabled={!isAdmin}
                                                placeholder="ДД.ММ.ГГГГ"
                                                maxLength={10}
                                                className="h-10 px-4 border-[#E2E8F0] bg-white text-[14px] font-medium text-[#0F172A] rounded-full focus:ring-4 focus:ring-[#2563EB]/5 focus:border-[#2563EB] transition-all font-inter"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[12px] font-bold text-[#64748B] ml-1 font-inter">Пол</Label>
                                            <Select
                                                value={formData.gender}
                                                onValueChange={(val) => setFormData({ ...formData, gender: val })}
                                                disabled={!isAdmin}
                                            >
                                                <SelectTrigger className="h-10 w-full shadow-none px-4 border-[#E2E8F0] bg-white text-[14px] font-medium text-[#0F172A] rounded-full focus:ring-4 focus:ring-[#2563EB]/5 focus:border-[#2563EB] transition-all font-inter">
                                                    <SelectValue placeholder="—" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-[16px] border-[#E2E8F0] shadow-xl">
                                                    <SelectItem value="M" className="text-[13px] font-medium">Мужской</SelectItem>
                                                    <SelectItem value="F" className="text-[13px] font-medium">Женский</SelectItem>
                                                    <SelectItem value="O" className="text-[13px] font-medium">Другое</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-[12px] font-bold text-[#64748B] ml-1 font-inter">Гражданство</Label>
                                            <Select
                                                value={formData.citizenship}
                                                onValueChange={(val) => setFormData({ ...formData, citizenship: val })}
                                                disabled={!isAdmin}
                                            >
                                                <SelectTrigger className="h-10 px-4 border-[#E2E8F0] bg-white text-[14px] font-medium text-[#0F172A] rounded-full focus:ring-4 focus:ring-[#2563EB]/5 focus:border-[#2563EB] transition-all font-inter">
                                                    <SelectValue placeholder="Выберите страну" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-[16px] border-[#E2E8F0] shadow-xl">
                                                    <SelectItem value="RU" className="text-[13px] font-medium">RU — Россия</SelectItem>
                                                    <SelectItem value="KZ" className="text-[13px] font-medium">KZ — Казахстан</SelectItem>
                                                    <SelectItem value="BY" className="text-[13px] font-medium">BY — Беларусь</SelectItem>
                                                    <SelectItem value="UZ" className="text-[13px] font-medium">UZ — Узбекистан</SelectItem>
                                                    <SelectItem value="KG" className="text-[13px] font-medium">KG — Кыргызстан</SelectItem>
                                                    <SelectItem value="TJ" className="text-[13px] font-medium">TJ — Таджикистан</SelectItem>
                                                    <SelectItem value="AZ" className="text-[13px] font-medium">AZ — Азербайджан</SelectItem>
                                                    <SelectItem value="AM" className="text-[13px] font-medium">AM — Армения</SelectItem>
                                                    <SelectItem value="MD" className="text-[13px] font-medium">MD — Молдова</SelectItem>
                                                    {formData.citizenship && !["RU", "KZ", "BY", "UZ", "KG", "TJ", "AZ", "AM", "MD"].includes(formData.citizenship) && (
                                                        <SelectItem value={formData.citizenship}>{formData.citizenship}</SelectItem>
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[12px] font-bold text-[#64748B] ml-1 font-inter">Родной язык</Label>
                                            <Input
                                                value={formData.nativeLanguage}
                                                onChange={(e) => setFormData({ ...formData, nativeLanguage: e.target.value })}
                                                disabled={!isAdmin}
                                                placeholder="Русский, Английский..."
                                                className="h-10 px-4 border-[#E2E8F0] bg-white text-[14px] font-medium text-[#0F172A] rounded-full focus:ring-4 focus:ring-[#2563EB]/5 focus:border-[#2563EB] transition-all font-inter"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[12px] font-bold text-[#64748B] ml-1 font-inter">Email</Label>
                                        <Input
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            disabled={!isAdmin}
                                            className="h-10 px-4 border-[#E2E8F0] bg-white text-[14px] font-medium text-[#0F172A] rounded-full focus:ring-4 focus:ring-[#2563EB]/5 focus:border-[#2563EB] transition-all font-inter"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[12px] font-bold text-[#64748B] ml-1 font-inter">Домашний адрес</Label>
                                        <Input
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            disabled={!isAdmin}
                                            placeholder="Город, улица, дом..."
                                            className="h-10 px-4 border-[#E2E8F0] bg-white text-[14px] font-medium text-[#0F172A] rounded-full focus:ring-4 focus:ring-[#2563EB]/5 focus:border-[#2563EB] transition-all font-inter"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3. PHOTO EDITOR MODAL */}
                        <Dialog open={isEditingPhoto} onOpenChange={(open) => {
                            setIsEditingPhoto(open);
                            if (!open) setPendingImage(null);
                        }}>
                            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white border-none shadow-2xl rounded-[32px]">
                                <div className="p-6 border-b border-[#F1F5F9] flex items-center justify-between">
                                    <DialogHeader>
                                        <DialogTitle className="text-[18px] font-black text-[#0F172A] font-inter">
                                            Фото для студенческого паспорта
                                        </DialogTitle>
                                    </DialogHeader>
                                </div>
                                <div className="p-6">
                                    <PassportPhotoEditor
                                        initialImage={pendingImage}
                                        currentPhotoUrl={student.passportPhotoUrl}
                                        onSave={handleSavePhoto}
                                        onCancel={() => {
                                            setIsEditingPhoto(false);
                                            setPendingImage(null);
                                        }}
                                        onDelete={handleDeletePhoto}
                                    />
                                </div>
                            </DialogContent>
                        </Dialog>

                        {/* 4. FOOTER ACTIONS */}
                        {
                            isAdmin && (
                                <div className="pb-2 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider font-inter">Изменено</span>
                                        <span className="text-[12px] font-bold text-[#0F172A] font-inter">{student.createdAt ? new Date(student.createdAt).toLocaleDateString('ru-RU') : '—'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            onClick={handleReset}
                                            disabled={isSaving}
                                            variant="outline"
                                            className="h-10 w-10 p-0 rounded-full border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-all active:scale-95"
                                            title="Сбросить изменения"
                                        >
                                            <RotateCcw className="h-4 w-4" />
                                        </Button>

                                        <ActionGuard actionLabel="Архивация доступна после регистрации">
                                            <Button
                                                onClick={() => {
                                                    if (confirm("Вы уверены, что хотите архивировать студента?")) {
                                                        onAction('archive', student.id);
                                                    }
                                                }}
                                                disabled={isSaving}
                                                variant="outline"
                                                className="h-10 w-10 p-0 rounded-full border-[#EF4444]/20 text-[#EF4444] hover:bg-[#EF4444]/10 hover:border-[#EF4444]/30 transition-all active:scale-95"
                                                title="Архивировать"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </ActionGuard>

                                        <ActionGuard actionLabel="Сохранение профиля доступно после регистрации">
                                            <Button
                                                onClick={handleSaveProfile}
                                                disabled={isSaving}
                                                className="h-10 pl-4 pr-6 bg-[#2563EB] hover:bg-[#2563EB]/90 text-white font-bold text-[13px] rounded-full shadow-lg shadow-[#2563EB]/20 transition-all flex items-center gap-2 active:scale-95 font-inter"
                                            >
                                                <Save className="h-4 w-4" />
                                                Сохранить
                                            </Button>
                                        </ActionGuard>
                                    </div>
                                </div>
                            )
                        }
                    </TabsContent>

                    <TabsContent value="notes" className="m-0 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="space-y-4">
                            <h4 className="text-[11px] font-bold text-[#64748B] uppercase tracking-widest flex items-center gap-2 font-inter">
                                <Info className="h-3.5 w-3.5" />
                                Внутренние комментарии
                            </h4>

                            <div className="p-6 bg-[#F8FAFC] rounded-[24px] border border-[#E2E8F0] space-y-6">
                                <textarea
                                    className="w-full min-h-[200px] p-5 rounded-[20px] border border-[#E2E8F0] bg-white focus:bg-white focus:ring-4 focus:ring-[#2563EB]/5 focus:border-[#2563EB] outline-none transition-all resize-none text-[14px] font-medium text-[#0F172A] placeholder:text-[#94A3B8] font-inter leading-relaxed"
                                    placeholder="Напишите здесь важные примечания о студенте..."
                                    defaultValue={student.notes}
                                />

                                <div className="p-4 bg-[#F59E0B]/5 border border-[#F59E0B]/10 rounded-full flex items-center justify-center gap-2 px-6">
                                    <AlertTriangle className="h-3.5 w-3.5 text-[#F59E0B] shrink-0" />
                                    <p className="text-[12px] text-[#F59E0B] font-bold font-inter tracking-tight">
                                        Эти заметки видны только администраторам и преподавателям.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-2 flex justify-end">
                            <Button className="h-11 px-10 bg-[#2563EB] hover:bg-[#2563EB]/90 text-white font-bold text-[14px] rounded-full shadow-lg shadow-[#2563EB]/20 transition-all flex items-center gap-2 active:scale-95 font-inter">
                                <Save className="h-4 w-4" />
                                Сохранить заметки
                            </Button>
                        </div>
                    </TabsContent>


                    <TabsContent value="progress" className="m-0 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-white border border-[#E5E7EB] rounded-[12px] space-y-2 shadow-sm transition-all hover:shadow-md">
                                <h5 className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest font-inter">Уровни</h5>
                                <div className="flex items-center justify-around py-1">
                                    <div className="flex flex-col items-center gap-0.5 group/select cursor-pointer">
                                        <p className="text-[10px] font-bold text-[#94A3B8] uppercase font-inter tracking-wider transition-colors group-hover/select:text-[#64748B]">Старт</p>
                                        <Select
                                            value={formData.startLevel}
                                            onValueChange={(v) => setFormData({ ...formData, startLevel: v })}
                                        >
                                            <SelectTrigger className="w-auto h-auto p-0 border-none shadow-none bg-transparent focus:ring-0 text-[24px] leading-tight font-black text-[#0F172A] hover:text-[#2563EB] transition-colors font-inter group-hover/select:text-[#2563EB]">
                                                <SelectValue placeholder="—" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {["Start", "A1", "A2", "B1", "B2", "C1", "C2"].map(l => (
                                                    <SelectItem key={l} value={l} className="font-inter font-bold text-[13px]">
                                                        {l}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="h-8 w-[2px] bg-[#F1F5F9] rounded-full" />
                                    <div className="flex flex-col items-center gap-0.5 group/select cursor-pointer">
                                        <p className="text-[10px] font-bold text-[#94A3B8] uppercase font-inter tracking-wider transition-colors group-hover/select:text-[#64748B]">Текущий</p>
                                        <Select
                                            value={formData.currentLevel}
                                            onValueChange={(v) => setFormData({ ...formData, currentLevel: v })}
                                        >
                                            <SelectTrigger className="w-auto h-auto p-0 border-none shadow-none bg-transparent focus:ring-0 text-[24px] leading-tight font-black text-[#2563EB] hover:text-[#1d4ed8] transition-colors font-inter group-hover/select:text-[#1d4ed8]">
                                                <SelectValue placeholder="—" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {["Start", "A1", "A2", "B1", "B2", "C1", "C2"].map(l => (
                                                    <SelectItem key={l} value={l} className="font-inter font-bold text-[13px]">
                                                        {l}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                            <div className="p-3 bg-white border border-[#E5E7EB] rounded-[10px] space-y-2 shadow-sm">
                                <h5 className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest font-inter">Посещаемость</h5>
                                <div className="flex items-end justify-between">
                                    <span className="text-[20px] font-black text-[#0F172A] font-inter">92%</span>
                                    <span className="text-[11px] font-bold text-[#22C55E] font-inter">+4% за мес.</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-[13px] font-bold text-[#64748B] ml-0.5 font-inter">Рекомендация преподавателя</Label>
                                <Input
                                    value={formData.teacherRecommendation}
                                    onChange={(e) => setFormData({ ...formData, teacherRecommendation: e.target.value })}
                                    placeholder="Напр: 'Перевести в группу B2 с марта'"
                                    className="h-10 px-3 border-[#E5E7EB] bg-white text-[14px] font-medium text-[#0F172A] rounded-[8px] transition-all font-inter"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[13px] font-bold text-[#64748B] ml-0.5 font-inter">Академический комментарий</Label>
                                <textarea
                                    className="w-full min-h-[100px] p-4 rounded-[8px] border border-[#E5E7EB] bg-white focus:bg-white text-[14px] font-medium text-[#0F172A] transition-all resize-none font-inter"
                                    placeholder="Особенности усвоения материала..."
                                    value={formData.academicComment}
                                    onChange={(e) => setFormData({ ...formData, academicComment: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="pt-2 flex justify-end">
                            <Button
                                onClick={handleSaveProgress}
                                disabled={isSaving}
                                className="h-11 px-10 bg-[#2563EB] hover:bg-[#2563EB]/90 text-white font-bold text-[14px] rounded-full shadow-lg shadow-[#2563EB]/20 transition-all flex items-center gap-2 active:scale-95 font-inter"
                            >
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Сохранить прогресс
                            </Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="groups" className="m-0 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">


                        <div className="flex justify-between items-center bg-[#F8FAFC] p-6 rounded-[24px] border border-[#E2E8F0]">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-[#2563EB]/10 flex items-center justify-center">
                                    <Users className="h-6 w-6 text-[#2563EB]" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[12px] font-bold text-[#64748B] uppercase tracking-widest font-inter">Текущая нагрузка</span>
                                    <span className="text-[18px] font-black text-[#0F172A] font-inter">{student.groupIds?.length || 0} Групп • {student.level || "Уровень не задан"}</span>
                                </div>
                            </div>
                            <Button className="h-10 px-6 bg-[#2563EB] hover:bg-[#2563EB]/90 text-white font-bold text-[13px] rounded-full shadow-lg shadow-[#2563EB]/20 transition-all font-inter active:scale-95">
                                Зачислить
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            {student.groupIds?.length ? student.groupIds.map((groupId) => (
                                <div key={groupId} className="flex items-center justify-between p-4 bg-white border border-[#E2E8F0] rounded-full hover:border-[#2563EB]/40 transition-all group shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-[#F1F5F9] flex items-center justify-center text-[#2563EB] font-bold text-[13px] border border-[#E2E8F0] font-inter">
                                            {groupId.slice(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="text-[14px] font-bold text-[#0F172A] font-inter">Level Course {groupId}</div>
                                            <div className="text-[11px] font-medium text-[#64748B] font-inter uppercase tracking-tight">Преподаватель: Анна Смирнова</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6 pr-2">
                                        <div className="flex flex-col items-end">
                                            <span className="text-[14px] font-black text-[#0F172A] font-inter">80%</span>
                                            <span className="text-[9px] font-bold text-[#64748B] uppercase font-inter tracking-wider">Успеваемость</span>
                                        </div>
                                        <Badge className="bg-[#22C55E]/10 text-[#22C55E] border-none h-6 px-3 font-bold text-[10px] uppercase tracking-widest rounded-full font-inter">Активен</Badge>
                                    </div>
                                </div>
                            )) : (
                                <div className="py-20 flex flex-col items-center justify-center text-[#64748B] text-center bg-[#F8FAFC] rounded-[24px] border border-dashed border-[#E2E8F0]">
                                    <BookOpen className="h-12 w-12 mb-4 opacity-20" />
                                    <p className="text-[12px] font-bold uppercase tracking-widest leading-relaxed font-inter">Нет активных групп</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="attendance" className="m-0">
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                            {/* Left Column: Calendar (Large) */}
                            <div className="lg:col-span-3 bg-white border border-[#E5E7EB] rounded-[32px] p-6 shadow-sm h-fit">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h5 className="text-[14px] font-black text-[#0F172A] font-inter">История посещений</h5>
                                        <p className="text-[11px] font-medium text-[#64748B] font-inter uppercase tracking-tight">Календарь и статусы</p>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 justify-end">
                                        <div className="flex items-center gap-1 px-2 py-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-full">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                                            <span className="text-[8px] font-bold text-[#64748B] uppercase tracking-tighter">Был</span>
                                        </div>
                                        <div className="flex items-center gap-1 px-2 py-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-full">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#EAB308]" />
                                            <span className="text-[8px] font-bold text-[#64748B] uppercase tracking-tighter">Опоздал</span>
                                        </div>
                                        <div className="flex items-center gap-1 px-2 py-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-full">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
                                            <span className="text-[8px] font-bold text-[#64748B] uppercase tracking-tighter">Пропуск</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-center flex-1 w-full">
                                    <Calendar
                                        mode="single"
                                        locale={ru}
                                        className="p-0 select-none w-full"
                                        showOutsideDays
                                        classNames={{
                                            months: "w-full",
                                            month: "space-y-6 w-full",
                                            caption: "flex justify-center pt-2 relative items-center mb-6",
                                            caption_label: "text-[20px] font-black text-[#0F172A] font-inter capitalize tracking-tight",
                                            nav: "space-x-1 flex items-center",
                                            nav_button: cn(
                                                "h-10 w-10 bg-white border border-[#E2E8F0] p-0 opacity-80 hover:opacity-100 rounded-2xl transition-all hover:bg-[#F8FAFC] shadow-sm active:scale-95"
                                            ),
                                            nav_button_previous: "absolute left-2",
                                            nav_button_next: "absolute right-2",
                                            month_grid: "w-full border-separate border-spacing-y-1.5",
                                            weekdays: "flex w-full mb-4",
                                            weekday: "text-[#94A3B8] font-bold text-[13px] uppercase font-inter flex-1 text-center",
                                            week: "flex w-full gap-2 mt-1",
                                            day: "p-0 relative flex-1 aspect-square flex items-center justify-center",
                                            day_button: cn(
                                                "w-full h-full font-black font-inter text-[18px] text-[#0F172A] flex items-center justify-center rounded-[12px] bg-[#F8FAFC] border border-[#E2E8F0] shadow-sm transition-all hover:bg-white active:scale-95",
                                                "focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none"
                                            ),
                                            selected: "bg-[#F8FAFC] !border-[#2563EB] !text-[#2563EB] shadow-sm z-10",
                                            today: "text-[#2563EB] font-black after:absolute after:bottom-2 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:bg-[#2563EB] after:rounded-full after:content-[''] after:shadow-[0_0_8px_rgba(37,99,235,0.4)]",
                                            outside: "opacity-30 grayscale text-[#94A3B8] border-none shadow-none pointer-events-none",
                                            disabled: "text-muted-foreground opacity-50",
                                            hidden: "invisible",
                                        }}
                                        modifiers={{
                                            present: attendanceRecords.filter(r => r.status === 'PRESENT' && r.date).map(r => new Date(r.date!)),
                                            absent: attendanceRecords.filter(r => r.status === 'ABSENT' && r.date).map(r => new Date(r.date!)),
                                            late: attendanceRecords.filter(r => r.status === 'LATE' && r.date).map(r => new Date(r.date!)),
                                        }}
                                        modifiersClassNames={{
                                            present: "!bg-transparent !border-none !shadow-none",
                                            absent: "!bg-transparent !border-none !shadow-none",
                                            late: "!bg-transparent !border-none !shadow-none",
                                        }}
                                        components={{
                                            DayButton: ({ day, ...props }) => {
                                                const record = attendanceRecords.find(r => r.date && new Date(r.date).toDateString() === day.date.toDateString());
                                                return (
                                                    <button
                                                        {...props}
                                                        onClick={() => {
                                                            if (record) setSelectedDetailRecord(record);
                                                            props.onClick?.(null as any);
                                                        }}
                                                        className={cn(
                                                            props.className,
                                                            "relative overflow-hidden group transition-all rounded-[16px]",
                                                            record?.status === 'PRESENT' && "!bg-[#22C55E] !text-white !border-none shadow-md shadow-[#22C55E]/30",
                                                            record?.status === 'LATE' && "!bg-[#EAB308] !text-white !border-none shadow-md shadow-[#EAB308]/30",
                                                            record?.status === 'ABSENT' && "!bg-[#EF4444] !text-white !border-none shadow-md shadow-[#EF4444]/30",
                                                        )}
                                                    >
                                                        <span className="relative z-10">{props.children}</span>
                                                    </button>
                                                );
                                            }
                                        }}
                                    />
                                </div>

                                {/* Attendance Detail Dialog */}
                                <Dialog
                                    open={!!selectedDetailRecord}
                                    onOpenChange={(open) => {
                                        if (!open) {
                                            setSelectedDetailRecord(null);
                                            setShowHistory(false);
                                        }
                                    }}
                                >
                                    <DialogContent className={cn(
                                        "p-0 overflow-hidden border-none shadow-2xl bg-white transition-all duration-300",
                                        showHistory ? "max-w-[720px] rounded-[24px]" : "max-w-[340px] rounded-[16px]"
                                    )}>
                                        {selectedDetailRecord && (() => {
                                            const details = JSON.parse(selectedDetailRecord.note || "{}");

                                            // Level 1: Compact Card (Default)
                                            if (!showHistory) {
                                                const isStudent = role === 'student';
                                                return (
                                                    <div className="flex flex-col bg-white overflow-hidden">
                                                        {/* Header: Minimalist & Clean */}
                                                        <div className="p-8 pt-10 pb-6 flex flex-col items-center text-center bg-white border-b border-[#F1F5F9] relative group">
                                                            <div className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.4em] leading-none mb-3 opacity-60">Посещаемость</div>
                                                            <div className="text-[22px] font-black text-[#0F172A] tracking-tight leading-none">
                                                                {new Date(selectedDetailRecord.date!).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                            </div>
                                                            <div className="mt-4 flex items-center gap-2">
                                                                <div className={cn(
                                                                    "w-1.5 h-1.5 rounded-full shrink-0",
                                                                    selectedDetailRecord.status === 'PRESENT' ? "bg-[#16A34A]" :
                                                                        selectedDetailRecord.status === 'LATE' ? "bg-[#CA8A04]" : "bg-[#DC2626]"
                                                                )} />
                                                                <span className={cn(
                                                                    "text-[11px] font-black uppercase tracking-widest",
                                                                    selectedDetailRecord.status === 'PRESENT' ? "text-[#16A34A]" :
                                                                        selectedDetailRecord.status === 'LATE' ? "text-[#CA8A04]" : "text-[#DC2626]"
                                                                )}>
                                                                    {selectedDetailRecord.status === 'PRESENT' ? "Явка" :
                                                                        selectedDetailRecord.status === 'LATE' ? "Опоздал" : "Пропуск"}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* List Content with Dotted Lines */}
                                                        <div className="p-8 space-y-6">
                                                            <div className="flex items-end gap-2 group/row">
                                                                <span className="text-[11px] font-black text-[#94A3B8] uppercase tracking-[0.1em] shrink-0 pb-0.5">Студент</span>
                                                                <div className="flex-1 border-b border-dotted border-[#E2E8F0] mb-1" />
                                                                <span className="text-[14px] font-black text-[#1E293B] leading-none tracking-tight">{student?.firstName} {student?.lastName}</span>
                                                            </div>
                                                            <div className="flex items-end gap-2 group/row">
                                                                <span className="text-[11px] font-black text-[#94A3B8] uppercase tracking-[0.1em] shrink-0 pb-0.5">Группа</span>
                                                                <div className="flex-1 border-b border-dotted border-[#E2E8F0] mb-1" />
                                                                <span className="text-[14px] font-black text-[#1E293B] leading-none tracking-tight">{details.group || "Regular Course"}</span>
                                                            </div>
                                                            <div className="flex items-end gap-2 group/row">
                                                                <span className="text-[11px] font-black text-[#94A3B8] uppercase tracking-[0.1em] shrink-0 pb-0.5">Педагог</span>
                                                                <div className="flex-1 border-b border-dotted border-[#E2E8F0] mb-1" />
                                                                <span className="text-[14px] font-black text-[#1E293B] leading-none tracking-tight">{details.teacher || "—"}</span>
                                                            </div>
                                                        </div>

                                                        {/* Compact Footer */}
                                                        <div className="px-8 pb-8 flex flex-col gap-3">
                                                            {!isStudent && (
                                                                <button
                                                                    onClick={() => setShowHistory(true)}
                                                                    className="w-full bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#475569] rounded-xl h-11 font-black text-[11px] uppercase tracking-[0.2em] transition-all"
                                                                >
                                                                    Подробно
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => setSelectedDetailRecord(null)}
                                                                className="w-full bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-xl h-12 font-black text-[12px] uppercase tracking-[0.3em] transition-all shadow-xl shadow-[#0F172A]/10 active:scale-95"
                                                            >
                                                                ЗАКРЫТЬ
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            }

                                            // Level 2: Detailed Modal (Admin/Teacher only)
                                            return (
                                                <div className="flex flex-col bg-white max-h-[90vh] overflow-hidden">
                                                    {/* Double Header */}
                                                    <div className="p-8 pb-6 border-b border-[#F1F5F9]">
                                                        <div className="flex items-center justify-between mb-4">
                                                            <button
                                                                onClick={() => setShowHistory(false)}
                                                                className="flex items-center gap-2 text-[10px] font-black text-[#3B82F6] uppercase tracking-widest hover:opacity-70 transition-opacity"
                                                            >
                                                                ← Назад
                                                            </button>
                                                            <div className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.4em] opacity-60">История изменений</div>
                                                        </div>
                                                        <div className="flex items-end justify-between">
                                                            <div className="space-y-1">
                                                                <div className="text-[24px] font-black text-[#0F172A] tracking-tight">Подробная информация</div>
                                                                <div className="text-[13px] font-bold text-[#64748B]">Запись об отсутствии: {new Date(selectedDetailRecord.date!).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                                                            </div>
                                                            <div className={cn(
                                                                "px-6 py-2 rounded-xl font-black text-[12px] uppercase tracking-widest text-white shadow-xl",
                                                                selectedDetailRecord.status === 'PRESENT' ? "bg-[#16A34A] shadow-[#16A34A]/20" :
                                                                    selectedDetailRecord.status === 'LATE' ? "bg-[#CA8A04] shadow-[#CA8A04]/20" : "bg-[#DC2626] shadow-[#DC2626]/20"
                                                            )}>
                                                                {selectedDetailRecord.status === 'PRESENT' ? "Явка" :
                                                                    selectedDetailRecord.status === 'LATE' ? "Опоздал" : "Пропуск"}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                                                        {/* Section 1: Event Details */}
                                                        <section>
                                                            <div className="text-[11px] font-black text-[#0F172A] uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                                                                <span>Событие</span>
                                                                <div className="h-px bg-[#E2E8F0] flex-1" />
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                                                                <div className="space-y-1">
                                                                    <div className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Тип</div>
                                                                    <div className="text-[14px] font-bold text-[#1E293B]">Посещаемость</div>
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <div className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Занятие</div>
                                                                    <div className="text-[14px] font-bold text-[#1E293B]">Conversation Club: B2+</div>
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <div className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Группа</div>
                                                                    <div className="text-[14px] font-bold text-[#1E293B]">{details.group || "Regular Course"}</div>
                                                                </div>
                                                            </div>
                                                        </section>

                                                        {/* Section 2: Creation & Last Change */}
                                                        <div className="grid grid-cols-2 gap-12">
                                                            <section className="space-y-6">
                                                                <div className="text-[11px] font-black text-[#0F172A] uppercase tracking-[0.2em] flex items-center gap-3">
                                                                    <span>Создано</span>
                                                                    <div className="h-px bg-[#E2E8F0] flex-1" />
                                                                </div>
                                                                <div className="bg-[#F8FAFC] rounded-2xl p-5 space-y-4 border border-[#F1F5F9]">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-[#E2E8F0] shadow-sm">
                                                                            <User className="w-5 h-5 text-[#64748B]" />
                                                                        </div>
                                                                        <div className="space-y-0.5">
                                                                            <div className="text-[13px] font-black text-[#1E293B]">{details.audit?.created?.by || "System"}</div>
                                                                            <div className="text-[10px] font-bold text-[#3B82F6] uppercase tracking-widest">Преподаватель</div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between text-[#64748B]">
                                                                        <span className="text-[11px] font-bold">{details.audit?.created?.at?.split(' ')[0]}</span>
                                                                        <span className="text-[11px] font-black font-mono">{details.audit?.created?.at?.split(' ')[1]}</span>
                                                                    </div>
                                                                </div>
                                                            </section>

                                                            <section className="space-y-6">
                                                                <div className="text-[11px] font-black text-[#0F172A] uppercase tracking-[0.2em] flex items-center gap-3">
                                                                    <span>Последнее изменение</span>
                                                                    <div className="h-px bg-[#E2E8F0] flex-1" />
                                                                </div>
                                                                <div className="bg-[#F8FAFC] rounded-2xl p-5 space-y-4 border border-[#F1F5F9] relative overflow-hidden">
                                                                    <div className="absolute top-0 right-0 p-2 opacity-10">
                                                                        <Zap className="w-12 h-12 text-[#CA8A04]" />
                                                                    </div>
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-[#E2E8F0] shadow-sm text-[12px] font-black text-[#0F172A]">
                                                                            СИ
                                                                        </div>
                                                                        <div className="space-y-0.5">
                                                                            <div className="text-[13px] font-black text-[#1E293B]">{details.audit?.updated?.by || "—"}</div>
                                                                            <div className="text-[10px] font-bold text-[#CA8A04] uppercase tracking-widest">Администратор</div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="pt-2 border-t border-[#E2E8F0] space-y-2">
                                                                        <div className="flex items-center justify-between text-[#64748B]">
                                                                            <span className="text-[11px] font-bold">{details.audit?.updated?.at?.split(' ')[0]}</span>
                                                                            <span className="text-[11px] font-black font-mono">{details.audit?.updated?.at?.split(' ')[1]}</span>
                                                                        </div>
                                                                        <div className="px-2 py-1 bg-white rounded-lg text-[10px] font-bold text-[#DC2626] border border-[#F1F5F9] inline-block">
                                                                            Опоздал → Пропуск
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </section>
                                                        </div>

                                                        {/* Section 3: History Timeline */}
                                                        <section>
                                                            <div className="text-[11px] font-black text-[#0F172A] uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                                                                <span>История событий</span>
                                                                <div className="h-px bg-[#E2E8F0] flex-1" />
                                                            </div>
                                                            <div className="space-y-4">
                                                                {[
                                                                    { time: details.audit?.created?.at, action: "Создано", role: "Teacher", status: "LATE" },
                                                                    { time: details.audit?.updated?.at, action: "Изменено", role: "Admin", status: selectedDetailRecord.status }
                                                                ].map((h, i) => (
                                                                    <div key={i} className="flex gap-4 group/item">
                                                                        <div className="flex flex-col items-center">
                                                                            <div className="w-2 h-2 rounded-full bg-[#3B82F6] shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                                                                            {i === 0 && <div className="w-px h-full bg-[#E2E8F0] mt-1" />}
                                                                        </div>
                                                                        <div className="pb-4 flex-1">
                                                                            <div className="flex items-center justify-between mb-1">
                                                                                <span className="text-[13px] font-black text-[#1E293B]">{h.action} ({h.role})</span>
                                                                                <span className="text-[11px] font-bold text-[#94A3B8] font-mono">{h.time}</span>
                                                                            </div>
                                                                            <span className="text-[11px] font-bold text-[#64748B]">Статус установлен: <span className="text-[#3B82F6]">{h.status}</span></span>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </section>

                                                        {/* Section 4: Technical IDs */}
                                                        <section className="pt-6 border-t border-[#F1F5F9] grid grid-cols-4 gap-4">
                                                            {[
                                                                { label: "ID Записи", val: selectedDetailRecord.id },
                                                                { label: "ID Студента", val: student?.id },
                                                                { label: "ID Занятия", val: selectedDetailRecord.scheduleId },
                                                                { label: "Организация", val: currentOrganizationId }
                                                            ].map((t, i) => (
                                                                <div key={i} className="space-y-1 opacity-50 hover:opacity-100 transition-opacity cursor-help">
                                                                    <div className="text-[8px] font-black text-[#94A3B8] uppercase tracking-widest">{t.label}</div>
                                                                    <div className="text-[10px] font-mono font-bold text-[#64748B] truncate">{t.val}</div>
                                                                </div>
                                                            ))}
                                                        </section>
                                                    </div>

                                                    <div className="p-8 pt-0 mt-auto bg-white border-t border-[#F1F5F9] flex justify-end gap-3">
                                                        <button
                                                            onClick={() => setSelectedDetailRecord(null)}
                                                            className="px-10 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-xl h-12 font-black text-[12px] uppercase tracking-[0.3em] transition-all shadow-xl shadow-[#0F172A]/10 active:scale-95"
                                                        >
                                                            ПОНЯТНО
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </DialogContent>
                                </Dialog>
                            </div>

                            {/* Right Column: Widgets (Narrower) */}
                            <div className="lg:col-span-2 space-y-4">
                                {/* Radial Score Card */}
                                <div className="bg-white border border-[#E5E7EB] rounded-[32px] p-5 shadow-sm flex flex-col items-center justify-center relative overflow-hidden group min-h-[200px]">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <div className="w-12 h-12 rounded-full border-[6px] border-[#2563EB]/20" />
                                    </div>

                                    <div className="relative w-24 h-24 flex items-center justify-center mb-3">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle cx="48" cy="48" r="42" stroke="#F1F5F9" strokeWidth="8" fill="transparent" />
                                            <circle
                                                cx="48"
                                                cy="48"
                                                r="42"
                                                stroke={
                                                    (attendanceRecords.filter(r => r.status === 'PRESENT').length / (attendanceRecords.length || 1)) * 100 > 85 ? "#22C55E" :
                                                        (attendanceRecords.filter(r => r.status === 'PRESENT').length / (attendanceRecords.length || 1)) * 100 > 60 ? "#F59E0B" : "#EF4444"
                                                }
                                                strokeWidth="8"
                                                strokeDasharray={263.9}
                                                strokeDashoffset={263.9 - (263.9 * (attendanceRecords.filter(r => r.status === 'PRESENT').length / (attendanceRecords.length || 1)))}
                                                strokeLinecap="round"
                                                fill="transparent"
                                                className="transition-all duration-1000 ease-out"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-[20px] font-black text-[#0F172A] font-inter">
                                                {attendanceRecords.length > 0
                                                    ? Math.round((attendanceRecords.filter(r => r.status === 'PRESENT').length / attendanceRecords.length) * 100)
                                                    : 0}%
                                            </span>
                                        </div>
                                    </div>

                                    <div className="text-center space-y-0.5">
                                        <h4 className="text-[12px] font-black text-[#0F172A] font-inter">Посещаемость</h4>
                                        <p className="text-[9px] font-bold text-[#64748B] uppercase tracking-widest">
                                            {attendanceRecords.length > 0 && (attendanceRecords.filter(r => r.status === 'PRESENT').length / attendanceRecords.length) * 100 > 85 ? "Превосходно" :
                                                attendanceRecords.length > 0 && (attendanceRecords.filter(r => r.status === 'PRESENT').length / attendanceRecords.length) * 100 > 60 ? "Хорошо" : "Нужно подтянуться"}
                                        </p>
                                    </div>
                                </div>

                                {/* Recent Streak */}
                                <div className="bg-white border border-[#E5E7EB] rounded-[32px] p-5 shadow-sm">
                                    <h5 className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-3 font-inter text-center">Последний тренд</h5>
                                    <div className="flex gap-1 h-8">
                                        {[...attendanceRecords].sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()).slice(0, 6).reverse().map((record, idx) => (
                                            <div
                                                key={record.id || idx}
                                                className={cn(
                                                    "flex-1 rounded-[6px] flex items-center justify-center transition-all",
                                                    record.status === 'PRESENT' ? "bg-[#22C55E]" :
                                                        record.status === 'LATE' ? "bg-[#EAB308]" : "bg-[#EF4444]"
                                                )}
                                            >
                                                {record.status === 'PRESENT' ? <CheckCircle2 className="h-3 w-3 text-white" /> :
                                                    record.status === 'LATE' ? <Zap className="h-3 w-3 text-white" /> : <Ban className="h-3 w-3 text-white" />}
                                            </div>
                                        ))}
                                        {Array.from({ length: Math.max(0, 6 - attendanceRecords.length) }).map((_, i) => (
                                            <div key={i} className="flex-1 rounded-[6px] bg-[#F1F5F9] border border-[#E2E8F0] border-dashed" />
                                        ))}
                                    </div>
                                    <div className="flex justify-between mt-1 px-1">
                                        <span className="text-[7px] font-bold text-[#94A3B8] uppercase">Раньше</span>
                                        <span className="text-[7px] font-bold text-[#94A3B8] uppercase">Сейчас</span>
                                    </div>
                                </div>

                                {/* Summary Stats */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 bg-[#F8FAFC] rounded-[24px] border border-[#E2E8F0] flex flex-col items-center">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E] mb-1.5" />
                                        <span className="text-[14px] font-black text-[#0F172A]">{attendanceRecords.filter(r => r.status === 'PRESENT').length}</span>
                                        <span className="text-[8px] font-bold text-[#64748B] uppercase tracking-tighter">Было</span>
                                    </div>
                                    <div className="p-3 bg-[#F8FAFC] rounded-[24px] border border-[#E2E8F0] flex flex-col items-center">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#EF4444] mb-1.5" />
                                        <span className="text-[14px] font-black text-[#0F172A]">{attendanceRecords.filter(r => r.status === 'ABSENT').length}</span>
                                        <span className="text-[8px] font-bold text-[#64748B] uppercase tracking-tighter">Пропуск</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="payments" className="m-0 space-y-4">
                        {(() => {
                            const cd = getCountdown(financeData.deadlineDate);
                            return (
                                <>
                                    {/* Level 1: Dense Header */}
                                    <div className={cn(
                                        "p-5 rounded-[24px] border transition-all duration-500 relative overflow-hidden group",
                                        cd.isOverdue ? "bg-[#FFF1F2] border-[#FECDD3] shadow-md shadow-red-500/5" :
                                            cd.status === 'warning' ? "bg-[#FFFBEB] border-[#FEF3C7]" : "bg-[#F0FDF4] border-[#DCFCE7]"
                                    )}>
                                        <div className="flex items-center justify-between relative z-10">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <div className={cn(
                                                        "w-1.5 h-1.5 rounded-full animate-pulse",
                                                        cd.isOverdue ? "bg-[#E11D48]" : cd.status === 'warning' ? "bg-[#D97706]" : "bg-[#16A34A]"
                                                    )} />
                                                    <span className="text-[9px] font-black text-[#64748B] uppercase tracking-[0.2em]">Статус</span>
                                                    <button
                                                        onClick={() => setIsSettingsOpen(true)}
                                                        className="ml-auto w-8 h-8 rounded-full bg-white border border-[#E2E8F0] shadow-sm flex items-center justify-center text-[#2563EB] hover:bg-[#F8FAFC] hover:scale-110 active:scale-95 transition-all"
                                                    >
                                                        <Settings className="h-4 w-4" />
                                                    </button>
                                                </div>
                                                <h3 className="text-[20px] font-black text-[#0F172A] tracking-tight leading-tight">
                                                    {cd.isOverdue ? "Задолженность" : "Обучение активно"}
                                                </h3>
                                                <div className="text-[11px] font-bold text-[#64748B] flex items-center gap-1.5">
                                                    {financeData.activeCourse}
                                                    <span className="w-1 h-1 rounded-full bg-[#CBD5E1]" />
                                                    Оплачено до {new Date(financeData.deadlineDate).toLocaleDateString('ru-RU')}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <div className="bg-white/90 backdrop-blur-sm px-4 py-2.5 rounded-[16px] border border-white shadow-sm flex flex-col items-center min-w-[100px]">
                                                    <span className={cn(
                                                        "text-[20px] font-black tracking-tighter leading-none",
                                                        cd.isOverdue ? "text-[#E11D48]" : "text-[#0F172A]"
                                                    )}>
                                                        {financeData.courseType === 'individual' ? financeData.remainingLessons : cd.days}
                                                    </span>
                                                    <span className="text-[8px] font-black text-[#94A3B8] uppercase tracking-widest mt-0.5 text-center leading-none">
                                                        {financeData.courseType === 'individual' ? "уроков" : "дней"} <br />осталось
                                                    </span>
                                                </div>
                                                {cd.isOverdue ? (
                                                    <Button
                                                        onClick={() => setIsTopUpOpen(true)}
                                                        size="sm"
                                                        className="bg-[#E11D48] hover:bg-[#BE123C] text-white font-black text-[11px] uppercase tracking-widest px-4 rounded-xl h-10 transition-all active:scale-95 shadow-lg shadow-red-200"
                                                    >
                                                        Погасить
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        onClick={() => setIsTopUpOpen(true)}
                                                        size="sm"
                                                        className="bg-[#0F172A] hover:bg-[#1E293B] text-white font-black text-[11px] uppercase tracking-widest px-4 rounded-xl h-10 transition-all active:scale-95"
                                                    >
                                                        Пополнить
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Level 2: Consolidated Widgets */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        {/* Payment Plan Widget */}
                                        <div className="bg-white border border-[#E5E7EB] rounded-[24px] p-5 space-y-4 shadow-sm">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em]">Рассрочка</h4>
                                                <div className="text-[12px] font-black text-[#2563EB]">{Math.round((financeData.paidSoFar / financeData.totalPrice) * 100)}%</div>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-[#2563EB] rounded-full transition-all duration-1000"
                                                        style={{ width: `${(financeData.paidSoFar / financeData.totalPrice) * 100}%` }}
                                                    />
                                                </div>
                                                <div className="flex justify-between items-end">
                                                    <div className="space-y-0.5">
                                                        <div className="text-[16px] font-black text-[#0F172A] tracking-tight">{financeData.paidSoFar.toLocaleString()} {getCurrencySymbol(financeData.currency)}</div>
                                                        <div className="text-[9px] font-bold text-[#94A3B8] uppercase">Внесено из {financeData.totalPrice.toLocaleString()} {getCurrencySymbol(financeData.currency)}</div>
                                                    </div>
                                                    <div className="text-[10px] font-bold text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded-full">
                                                        Остаток: {(financeData.totalPrice - financeData.paidSoFar).toLocaleString()} {getCurrencySymbol(financeData.currency)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Info Dotted Rows */}
                                        <div className="bg-white border border-[#E5E7EB] rounded-[24px] p-5 flex flex-col justify-center space-y-3 shadow-sm">
                                            <div className="flex items-end gap-2 group/row">
                                                <span className="text-[9px] font-black text-[#94A3B8] uppercase tracking-[0.1em] shrink-0 pb-0.5">Формат</span>
                                                <div className="flex-1 border-b border-dotted border-[#E2E8F0] mb-1" />
                                                <span className="text-[12px] font-black text-[#1E293B]">{financeData.courseType === 'individual' ? "Индивидуально" : "В группе"}</span>
                                            </div>
                                            <div className="flex items-end gap-2 group/row">
                                                <span className="text-[9px] font-black text-[#94A3B8] uppercase tracking-[0.1em] shrink-0 pb-0.5">Тариф</span>
                                                <div className="flex-1 border-b border-dotted border-[#E2E8F0] mb-1" />
                                                <span className="text-[12px] font-black text-[#1E293B]">{financeData.format} / Regular</span>
                                            </div>
                                            <div className="flex items-end gap-2 group/row">
                                                <span className="text-[9px] font-black text-[#94A3B8] uppercase tracking-[0.1em] shrink-0 pb-0.5">Валюта</span>
                                                <div className="flex-1 border-b border-dotted border-[#E2E8F0] mb-1" />
                                                <span className="text-[12px] font-black text-[#1E293B]">{financeData.currency} ({getCurrencySymbol(financeData.currency)})</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Level 3: Compact Transaction History */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between px-1">
                                            <h4 className="text-[9px] font-black text-[#0F172A] uppercase tracking-[0.2em] flex items-center gap-2">
                                                История операций
                                                <div className="h-px bg-[#E2E8F0] w-12" />
                                            </h4>
                                            <button className="text-[9px] font-black text-[#2563EB] uppercase tracking-widest hover:underline">Весь отчет</button>
                                        </div>
                                        <div className="bg-white border border-[#E5E7EB] rounded-[20px] overflow-hidden shadow-sm">
                                            <div className="divide-y divide-[#F1F5F9]">
                                                {transactions.map((t, i) => (
                                                    <div key={i} className="px-5 py-3 flex items-center justify-between hover:bg-[#F8FAFC] transition-colors group">
                                                        <div className="flex items-center gap-3">
                                                            <div className={cn(
                                                                "w-8 h-8 rounded-full flex items-center justify-center border transition-all text-[14px]",
                                                                t.status === 'plus' ? "bg-[#F0FDF4] border-[#DCFCE7] text-[#16A34A]" : "bg-[#F8FAFC] border-[#F1F5F9] text-[#64748B]"
                                                            )}>
                                                                {t.status === 'plus' ? <CreditCard className="h-3 w-3" /> : <Loader2 className="h-3 w-3" />}
                                                            </div>
                                                            <div className="space-y-0 text-left">
                                                                <div className="text-[13px] font-black text-[#0F172A] tracking-tight leading-tight">{t.label}</div>
                                                                <div className="text-[9px] font-bold text-[#94A3B8] uppercase tracking-tighter flex items-center gap-1.5">
                                                                    {t.date} <span className="w-0.5 h-0.5 rounded-full bg-[#E2E8F0]" /> {t.sub}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className={cn(
                                                            "text-[13px] font-black tracking-tight",
                                                            t.status === 'plus' ? "text-[#16A34A]" : "text-[#0F172A]"
                                                        )}>
                                                            {t.status === 'plus' ? '+' : ''}{t.amount.toLocaleString()} {getCurrencySymbol(financeData.currency)}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            );
                        })()}
                    </TabsContent>

                    <TabsContent value="access" className="m-0 space-y-6">
                        <div className="bg-[#F5F6F8] p-[20px] rounded-[16px] border border-[#E5E7EB] space-y-6 shadow-inner">
                            {[
                                { title: 'Доступ в кабинет', desc: 'Авторизация через email.', active: true },
                                { title: 'Telegram уведомления', desc: 'Авторассылка расписания.', active: false },
                                { title: 'Доступ к материалам', desc: 'Интерактивные курсы и тесты.', active: true }
                            ].map(item => (
                                <div key={item.title} className="flex items-center justify-between">
                                    <div className="flex flex-col pr-8">
                                        <span className="text-[14px] font-bold text-[#0F172A] mb-0.5 font-inter">{item.title}</span>
                                        <span className="text-[12px] font-medium text-[#64748B] leading-tight font-inter">{item.desc}</span>
                                    </div>
                                    <div className={cn(
                                        "w-[40px] h-[22px] rounded-full relative cursor-pointer p-0.5 transition-all shrink-0 shadow-inner",
                                        item.active ? "bg-[#2563EB]" : "bg-[#E5E7EB]"
                                    )}>
                                        <div className={cn(
                                            "bg-white w-[18px] h-[18px] rounded-full shadow-lg transition-all",
                                            item.active ? "translate-x-[18px]" : "translate-x-0"
                                        )} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-8 border border-[#EF4444]/20 bg-[#EF4444]/5 rounded-[16px] flex flex-col items-center text-center">
                            <h5 className="text-[14px] font-bold text-[#EF4444] mb-2 flex items-center gap-2 font-inter">
                                <AlertTriangle className="h-4 w-4" />
                                Опасная зона
                            </h5>
                            <p className="text-[13px] font-medium text-[#64748B] leading-relaxed max-w-[320px] mb-6 font-inter">
                                Блокировка полностью ограничит доступ. Используйте только для отчисленных студентов.
                            </p>
                            <Button variant="outline" className="border-[#EF4444]/20 text-[#EF4444] hover:bg-[#EF4444]/10 font-bold text-[13px] uppercase tracking-widest px-8 rounded-[10px] h-10 font-inter transition-all">
                                Блокировать всё
                            </Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="audit" className="m-0 space-y-3">
                        <div className="bg-white border border-[#E5E7EB] rounded-[12px] overflow-hidden shadow-sm">
                            <table className="w-full text-left font-inter">
                                <thead className="bg-[#F5F6F8] border-b border-[#E5E7EB]">
                                    <tr className="h-10">
                                        <th className="px-4 text-[13px] font-bold text-[#64748B] uppercase tracking-widest">Время</th>
                                        <th className="px-4 text-[13px] font-bold text-[#64748B] uppercase tracking-widest">Действие</th>
                                        <th className="px-4 text-[13px] font-bold text-[#64748B] uppercase tracking-widest">Кто</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E5E7EB]">
                                    {student.auditLog?.length ? student.auditLog.map((event) => (
                                        <tr key={event.id} className="h-11 hover:bg-[#F5F6F8] transition-all">
                                            <td className="px-4 text-[12px] font-medium text-[#64748B] whitespace-nowrap">{new Date(event.at).toLocaleString()}</td>
                                            <td className="px-4">
                                                <div className="text-[14px] font-bold text-[#0F172A] font-inter">{event.action}</div>
                                                <div className="text-[12px] text-[#64748B] font-inter">{event.description}</div>
                                            </td>
                                            <td className="px-4 text-[13px] font-medium text-[#64748B] font-inter">{event.by}</td>
                                        </tr>
                                    )) : (
                                        <tr className="h-24">
                                            <td colSpan={3} className="px-4 text-center">
                                                <p className="text-[12px] font-bold text-[#64748B] uppercase tracking-widest opacity-20 font-inter">Событий не зафиксировано</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </TabsContent>
                </div>
            </Tabs >
            {/* Top Up Dialog */}
            <Dialog open={isTopUpOpen} onOpenChange={setIsTopUpOpen}>
                <DialogContent className="sm:max-w-[400px] rounded-[32px] border-none shadow-2xl p-0 overflow-hidden">
                    <div className="bg-[#F8FAFC] p-8 pb-6 border-b border-[#F1F5F9]">
                        <DialogHeader>
                            <DialogTitle className="text-[20px] font-black text-[#0F172A] tracking-tight">Пополнение баланса</DialogTitle>
                        </DialogHeader>
                        <div className="mt-4 flex items-center gap-4 p-4 bg-white rounded-2xl border border-[#E2E8F0] shadow-sm">
                            <div className="w-12 h-12 rounded-full bg-[#F0FDF4] flex items-center justify-center text-[#16A34A]">
                                <Wallet className="h-6 w-6" />
                            </div>
                            <div>
                                <div className="text-[11px] font-black text-[#94A3B8] uppercase tracking-widest">Текущий баланс</div>
                                <div className="text-[18px] font-black text-[#0F172A]">{financeData.paidSoFar.toLocaleString()} {getCurrencySymbol(financeData.currency)}</div>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 space-y-6 bg-white">
                        <div className="space-y-2">
                            <Label className="text-[11px] font-black text-[#64748B] uppercase tracking-widest ml-1">Сумма оплаты ({getCurrencySymbol(financeData.currency)})</Label>
                            <Input
                                type="number"
                                placeholder="0"
                                className="h-12 rounded-[16px] border-[#E2E8F0] focus:ring-[#2563EB] font-bold text-[16px]"
                                id="payment-amount"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[11px] font-black text-[#64748B] uppercase tracking-widest ml-1">Метод оплаты</Label>
                            <Select defaultValue="card">
                                <SelectTrigger className="h-12 rounded-[16px] border-[#E2E8F0] font-bold text-[14px]">
                                    <SelectValue placeholder="Выберите способ" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-[#E2E8F0]">
                                    <SelectItem value="card" className="rounded-xl font-bold">Банковская карта</SelectItem>
                                    <SelectItem value="cash" className="rounded-xl font-bold">Наличные</SelectItem>
                                    <SelectItem value="transfer" className="rounded-xl font-bold">Перевод по реквизитам</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="pt-2 flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setIsTopUpOpen(false)}
                                className="flex-1 h-12 rounded-[16px] border-[#E2E8F0] text-[#64748B] font-black text-[12px] uppercase tracking-widest hover:bg-[#F8FAFC]"
                            >
                                Отмена
                            </Button>
                            <Button
                                onClick={() => {
                                    const amountInput = document.getElementById('payment-amount') as HTMLInputElement;
                                    const amount = parseInt(amountInput?.value || "0");
                                    if (amount > 0) {
                                        setFinanceData(prev => ({
                                            ...prev,
                                            paidSoFar: prev.paidSoFar + amount
                                        }));

                                        // Add new transaction
                                        const today = new Date();
                                        const dateStr = `${today.getDate().toString().padStart(2, '0')}.${(today.getMonth() + 1).toString().padStart(2, '0')}.${today.getFullYear().toString().slice(-2)}`;

                                        setTransactions(prev => [
                                            {
                                                date: dateStr,
                                                label: 'Пополнение баланса',
                                                sub: 'Оплата в кабинете',
                                                amount: amount,
                                                status: 'plus'
                                            },
                                            ...prev
                                        ]);

                                        setIsTopUpOpen(false);
                                    }
                                }}
                                className="flex-1 h-12 rounded-[16px] bg-[#0F172A] hover:bg-[#1E293B] text-white font-black text-[12px] uppercase tracking-widest shadow-lg shadow-gray-200 active:scale-95 transition-all"
                            >
                                Подтвердить
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
            {/* Course Settings Dialog */}
            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogContent className="sm:max-w-[450px] rounded-[32px] border-none shadow-2xl p-0 overflow-hidden">
                    <div className="bg-[#F8FAFC] p-8 pb-6 border-b border-[#F1F5F9]">
                        <DialogHeader>
                            <DialogTitle className="text-[20px] font-black text-[#0F172A] tracking-tight">Параметры обучения</DialogTitle>
                        </DialogHeader>
                    </div>

                    <div className="p-8 space-y-6 bg-white">
                        <div className="space-y-2">
                            <Label className="text-[11px] font-black text-[#64748B] uppercase tracking-widest ml-1">Выбрать из каталога</Label>
                            <Select onValueChange={(val) => {
                                const course = availableCourses.find(c => c.id === val);
                                if (course) {
                                    setTempSettings(prev => ({
                                        ...prev,
                                        activeCourse: course.name,
                                        totalPrice: course.basePrice || prev.totalPrice,
                                        currency: course.currency || prev.currency
                                    }));
                                }
                            }}>
                                <SelectTrigger className="h-12 rounded-[16px] border-[#E2E8F0] font-bold bg-[#F8FAFC]">
                                    <SelectValue placeholder="Выберите курс..." />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl">
                                    {availableCourses.length > 0 ? (
                                        availableCourses.map(course => (
                                            <SelectItem key={course.id} value={course.id} className="font-bold">
                                                {course.name} {course.basePrice ? `— ${course.basePrice} ${course.currency === 'USD' ? '$' : course.currency === 'EUR' ? '€' : course.currency === 'TJS' ? 'смн' : '₽'}` : ''}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <div className="p-3 text-sm text-muted-foreground text-center">Нет активных курсов</div>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[11px] font-black text-[#64748B] uppercase tracking-widest ml-1">Название курса (или вручную)</Label>
                            <Input
                                value={tempSettings.activeCourse}
                                onChange={(e) => setTempSettings(prev => ({ ...prev, activeCourse: e.target.value }))}
                                className="h-12 rounded-[16px] border-[#E2E8F0] font-bold"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[11px] font-black text-[#64748B] uppercase tracking-widest ml-1">Тип обучения</Label>
                                <Select
                                    value={tempSettings.courseType}
                                    onValueChange={(val: any) => setTempSettings(prev => ({ ...prev, courseType: val }))}
                                >
                                    <SelectTrigger className="h-12 rounded-[16px] border-[#E2E8F0] font-bold">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl">
                                        <SelectItem value="individual" className="font-bold">Индивидуально</SelectItem>
                                        <SelectItem value="group" className="font-bold">В группе</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[11px] font-black text-[#64748B] uppercase tracking-widest ml-1">Валюта</Label>
                                <Select
                                    value={tempSettings.currency}
                                    onValueChange={(val: any) => setTempSettings(prev => ({ ...prev, currency: val }))}
                                >
                                    <SelectTrigger className="h-12 rounded-[16px] border-[#E2E8F0] font-bold">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl">
                                        <SelectItem value="RUB" className="font-bold">RUB (₽)</SelectItem>
                                        <SelectItem value="TJS" className="font-bold">TJS (смн)</SelectItem>
                                        <SelectItem value="USD" className="font-bold">USD ($)</SelectItem>
                                        <SelectItem value="EUR" className="font-bold">EUR (€)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[11px] font-black text-[#64748B] uppercase tracking-widest ml-1">Общая стоимость</Label>
                                <Input
                                    type="number"
                                    value={tempSettings.totalPrice}
                                    onChange={(e) => setTempSettings(prev => ({ ...prev, totalPrice: parseInt(e.target.value || "0") }))}
                                    className="h-12 rounded-[16px] border-[#E2E8F0] font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[11px] font-black text-[#64748B] uppercase tracking-widest ml-1">Оплачено до</Label>
                                <Input
                                    type="date"
                                    value={new Date(tempSettings.deadlineDate).toISOString().split('T')[0]}
                                    onChange={(e) => setTempSettings(prev => ({ ...prev, deadlineDate: new Date(e.target.value).toISOString() }))}
                                    className="h-12 rounded-[16px] border-[#E2E8F0] font-bold"
                                />
                            </div>
                        </div>

                        <div className="pt-2 flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setIsSettingsOpen(false)}
                                className="flex-1 h-12 rounded-[16px] border-[#E2E8F0] text-[#64748B] font-black text-[12px] uppercase tracking-widest hover:bg-[#F8FAFC]"
                            >
                                Отмена
                            </Button>
                            <Button
                                onClick={() => {
                                    setFinanceData(prev => ({
                                        ...prev,
                                        ...tempSettings,
                                        format: prev.format, // Ensure we keep original fields if not in tempSettings
                                        paidSoFar: prev.paidSoFar,
                                        remainingLessons: prev.remainingLessons,
                                        courseType: tempSettings.courseType as any
                                    }));
                                    setIsSettingsOpen(false);
                                }}
                                className="flex-1 h-12 rounded-[16px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-black text-[12px] uppercase tracking-widest shadow-lg shadow-blue-100 active:scale-95 transition-all"
                            >
                                Сохранить
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div >
    );
}
