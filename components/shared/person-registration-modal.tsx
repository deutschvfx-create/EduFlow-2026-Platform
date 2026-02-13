'use client';

import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { UserPlus, Loader2, QrCode, Link as LinkIcon, Edit3, Check, Copy, Database, Search, Users, Share2, UserCheck, Smartphone, Camera, Plus } from "lucide-react";
import { useOrganization } from "@/hooks/use-organization";
import { generateId } from "@/lib/utils";
import { db } from "@/lib/firebase";
import QRCode from "react-qr-code";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Group } from "@/lib/types/group";
import { TeacherRole } from "@/lib/types/teacher";
import { useGroups } from "@/hooks/use-groups";
import { useStudents } from "@/hooks/use-students";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Scanner } from "@yudiel/react-qr-scanner";

interface PersonRegistrationModalProps {
    role: "student" | "teacher";
    group?: Group; // Context for student (optional)
    customTrigger?: React.ReactNode;
    onSuccess?: () => void;
}

type TabMode = "database" | "handshake" | "manual" | "invite";

export function PersonRegistrationModal({ role, group: initialGroup, customTrigger, onSuccess }: PersonRegistrationModalProps) {
    const { currentOrganizationId } = useOrganization();
    const { groups } = useGroups();
    const { students } = useStudents(); // Need teachers hook if we want to search existing teachers too? Usually searching *users* is enough.

    // UI State
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState<TabMode>("manual"); // Default to manual for teachers, maybe handshake for students?
    const [handshakeMode, setHandshakeMode] = useState<"scan" | "show">("scan");
    const [copied, setCopied] = useState(false);
    const [search, setSearch] = useState("");
    const [processingId, setProcessingId] = useState<string | null>(null);

    // Common Form State
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [birthDateRaw, setBirthDateRaw] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Teacher Specific State
    const [specialization, setSpecialization] = useState("");
    const [teacherRole, setTeacherRole] = useState<TeacherRole>("teacher");
    const [gender, setGender] = useState("");
    const [showAdvanced, setShowAdvanced] = useState(false);

    // Student Specific State
    const [selectedGroupId, setSelectedGroupId] = useState<string>(initialGroup?.id || "none");

    // Derived Group (for Students)
    const group = role === 'student' ? (initialGroup || groups.find(g => g.id === selectedGroupId)) : undefined;

    const getBaseUrl = () => {
        if (typeof window === 'undefined') return '';
        const origin = window.location.origin;
        // If testing locally on localhost, use the machine's IP so phone can connect via Wi-Fi
        if (origin.includes('localhost')) {
            return origin.replace('localhost', '192.168.0.60');
        }
        return origin;
    };

    const inviteLink = role === 'student'
        ? group
            ? `${getBaseUrl()}/invite/${currentOrganizationId}/${group.id}`
            : `${getBaseUrl()}/invite/${currentOrganizationId}/students`
        : `${getBaseUrl()}/invite/${currentOrganizationId}/teachers`;

    // --- LOGIC ---

    // Helper: Input Normalization
    const normalizeName = (str: string) => str.trim().charAt(0).toUpperCase() + str.trim().slice(1).toLowerCase();

    // Helper: Birthday Input Mask
    const handleBirthDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 8) value = value.slice(0, 8);

        // Format as DD.MM.YYYY
        if (value.length > 4) {
            value = `${value.slice(0, 2)}.${value.slice(2, 4)}.${value.slice(4)}`;
        } else if (value.length > 2) {
            value = `${value.slice(0, 2)}.${value.slice(2)}`;
        }
        setBirthDateRaw(value);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const resetForm = () => {
        setFirstName("");
        setLastName("");
        setBirthDateRaw("");
        setPhone("");
        setEmail("");
        setPassword("");
        setSpecialization("");
        setTeacherRole("teacher");
    };

    const handleSubmit = async () => {
        if (!currentOrganizationId) return;
        if (!firstName || !lastName || !birthDateRaw) {
            alert("Пожалуйста, заполните все обязательные поля");
            return;
        }

        // Validate Date
        const dateRegex = /^(\d{2})\.(\d{2})\.(\d{4})$/;
        if (!dateRegex.test(birthDateRaw)) {
            alert("Введите дату рождения в формате ДД.ММ.ГГГГ");
            return;
        }

        const [day, month, year] = birthDateRaw.split('.').map(Number);
        const dateObj = new Date(year, month - 1, day);
        if (dateObj.getFullYear() !== year || dateObj.getMonth() !== month - 1 || dateObj.getDate() !== day) {
            alert("Некорректная дата");
            return;
        }

        if (year < 1900 || year > new Date().getFullYear()) {
            alert("Некорректный год");
            return;
        }

        const formattedBirthDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

        setLoading(true);
        try {
            const cleanFirstName = normalizeName(firstName);
            const cleanLastName = normalizeName(lastName);

            if (role === 'student') {
                const { runTransaction, collection, query, where, getDocs, doc, setDoc } = await import("firebase/firestore");

                // 1. PRE-FLIGHT: Look for duplicates
                const usersRef = collection(db, "users");
                const q = query(
                    usersRef,
                    where("organizationId", "==", currentOrganizationId!),
                    where("lastName", "==", cleanLastName),
                    where("firstName", "==", cleanFirstName),
                    where("birthDate", "==", formattedBirthDate)
                );
                const querySnapshot = await getDocs(q);

                let action: "LINK" | "CREATE" = "CREATE";
                let targetId = generateId();
                let existingData: any = null;

                if (!querySnapshot.empty) {
                    const existingStudent = querySnapshot.docs[0].data();
                    const existingId = querySnapshot.docs[0].id;

                    if (!group) {
                        alert(`Студент ${cleanFirstName} ${cleanLastName} (${formattedBirthDate}) уже существует в системе!`);
                        setLoading(false);
                        return;
                    }

                    if (existingStudent.groupIds?.includes(group.id)) {
                        alert(`Студент ${cleanFirstName} ${cleanLastName} уже состоит в этой группе!`);
                        setLoading(false);
                        return;
                    }

                    const confirmAdd = window.confirm(
                        `Найден существующий студент:\n${cleanFirstName} ${cleanLastName} (${formattedBirthDate})\n\nДобавить его в группу "${group.name}"?`
                    );

                    if (confirmAdd) {
                        action = "LINK";
                        targetId = existingId;
                        existingData = existingStudent;
                    } else {
                        // Force Create New if they insisted? Usually we should just stop them or create a distinct record.
                        // For safety, let's keep it as CREATE with a new ID.
                        action = "CREATE";
                    }
                }

                // 2. EXECUTION (Transaction if Group, Simple Set if No Group)
                if (group) {
                    await runTransaction(db, async (transaction) => {
                        const groupRef = doc(db, "groups", group.id);
                        const groupDoc = await transaction.get(groupRef);
                        if (!groupDoc.exists()) throw "Group not found";

                        const groupData = groupDoc.data() as Group;

                        if (groupData.maxStudents && (groupData.studentsCount || 0) >= groupData.maxStudents) {
                            throw "Группа переполнена (места закончились только что)";
                        }

                        if (action === "LINK") {
                            const userRef = doc(db, "users", targetId);
                            transaction.update(userRef, {
                                groupIds: [...(existingData.groupIds || []), group.id]
                            });
                        } else {
                            const newUserRef = doc(db, "users", targetId);
                            transaction.set(newUserRef, {
                                id: targetId,
                                organizationId: currentOrganizationId!,
                                firstName: cleanFirstName,
                                lastName: cleanLastName,
                                birthDate: formattedBirthDate,
                                status: 'ACTIVE',
                                academicStatus: 'ACTIVE',
                                role: 'student',
                                groupIds: [group.id],
                                createdAt: new Date().toISOString()
                            });
                        }

                        transaction.update(groupRef, {
                            studentsCount: (groupData.studentsCount || 0) + 1
                        });
                    });
                } else {
                    if (action === "LINK") {
                        alert("Уже существует");
                        setLoading(false);
                        return;
                    }

                    const newUserRef = doc(db, "users", targetId);
                    await setDoc(newUserRef, {
                        id: targetId,
                        organizationId: currentOrganizationId!,
                        firstName: cleanFirstName,
                        lastName: cleanLastName,
                        birthDate: formattedBirthDate,
                        status: 'ACTIVE',
                        academicStatus: 'ACTIVE',
                        role: 'student',
                        groupIds: [],
                        createdAt: new Date().toISOString()
                    });
                }
            } else {
                // TEACHER
                const { teachersRepo } = await import("@/lib/data/teachers.repo");
                const { collection, query, where, getDocs } = await import("firebase/firestore");
                // Removed client-side auth imports
                const { createTeacherByAdminAction } = await import("@/lib/actions/auth.actions");

                if (!email || !password) {
                    throw "Email и Пароль обязательны для регистрации учителя";
                }

                if (password.length < 6) {
                    throw "Пароль должен быть не менее 6 символов";
                }

                const normalizedRole = teacherRole.toLowerCase();
                const generatedEmail = email.trim().toLowerCase();

                // 2. CALL SERVER ACTION
                const result = await createTeacherByAdminAction({
                    orgId: currentOrganizationId!,
                    firstName: cleanFirstName,
                    lastName: cleanLastName,
                    email: generatedEmail,
                    phone: phone,
                    gender: gender as any,
                    birthDate: formattedBirthDate,
                    password: password,
                    specialization: specialization,
                    role: normalizedRole as any
                });

                if (!result.success) {
                    throw result.error;
                }

                setOpen(false);
                resetForm();
                if (onSuccess) onSuccess();
                window.location.reload();
            }

        } catch (e: any) {
            console.error(e);
            alert(typeof e === 'string' ? e : "Ошибка сохранения");
        } finally {
            setLoading(false);
        }
    };

    const handleAssignExisting = async (studentId: string) => {
        if (!group || !currentOrganizationId) return;
        setProcessingId(studentId);
        try {
            const { studentsRepo } = await import("@/lib/data/students.repo");
            const { groupsRepo } = await import("@/lib/data/groups.repo");

            const student = students.find(s => s.id === studentId);
            if (!student) return;

            const newGroupIds = [...(student.groupIds || []), group.id];
            await studentsRepo.update(currentOrganizationId, studentId, { groupIds: newGroupIds });

            await groupsRepo.update(currentOrganizationId, group.id, {
                studentsCount: (group.studentsCount || 0) + 1
            });

            window.location.reload();
        } catch (e) {
            console.error(e);
            alert("Ошибка при добавлении");
        } finally {
            setProcessingId(null);
        }
    };

    const handleHandshakeScan = async (result: any) => {
        if (!result?.[0]?.rawValue || !currentOrganizationId) return;

        try {
            const data = JSON.parse(result[0].rawValue);
            if (data.type !== 'EF_PROFILE') return;

            setLoading(true);
            const { studentsRepo } = await import("@/lib/data/students.repo");
            const { groupsRepo } = await import("@/lib/data/groups.repo");

            if (role === 'student') {
                const existing = students.find(s => s.id === data.id);

                if (existing) {
                    if (group) {
                        await handleAssignExisting(existing.id);
                    } else {
                        alert("Студент уже существует в школе (ID: " + existing.id + ")");
                        setLoading(false);
                    }
                } else {
                    const studentId = data.id || generateId();
                    const groupIds = group ? [group.id] : [];

                    await studentsRepo.add(currentOrganizationId, {
                        id: studentId,
                        organizationId: currentOrganizationId,
                        firstName: data.firstName,
                        lastName: data.lastName,
                        birthDate: data.birthDate,
                        status: 'ACTIVE',
                        academicStatus: 'ACTIVE',
                        groupIds: groupIds,
                        createdAt: new Date().toISOString()
                    } as any);

                    if (group) {
                        await groupsRepo.update(currentOrganizationId, group.id, {
                            studentsCount: (group.studentsCount || 0) + 1
                        });
                    }

                    window.location.reload();
                }
            } else {
                // TEACHER Handshake
                const { teachersRepo } = await import("@/lib/data/teachers.repo");
                const teacherId = data.id || generateId();

                await teachersRepo.add(currentOrganizationId, {
                    id: teacherId,
                    organizationId: currentOrganizationId,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email || `${data.firstName.toLowerCase()}.${data.lastName.toLowerCase()}@eduflow.com`,
                    birthDate: data.birthDate,
                    status: 'ACTIVE',
                    emailVerified: true,
                    role: 'teacher',
                    groupIds: [],
                    createdAt: new Date().toISOString(),
                    permissions: {
                        canCreateGroups: false,
                        canManageStudents: true,
                        canMarkAttendance: true,
                        canGradeStudents: true,
                        canSendAnnouncements: false,
                        canUseChat: true,
                        canInviteStudents: false
                    }
                });
                window.location.reload();
            }
        } catch (e) {
            console.error("Invalid handshake data:", e);
        } finally {
            setLoading(false);
        }
    };


    // Tabs Config
    const availableTabs = [
        { id: 'handshake', icon: Smartphone, label: 'Вход', show: true },
        { id: 'manual', icon: Edit3, label: role === 'student' ? 'Группа' : 'Вручную', show: true },
        { id: 'database', icon: Users, label: 'База', show: true },
        { id: 'invite', icon: Share2, label: 'Инвайт', show: true },
    ].filter(t => t.show);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {customTrigger || (
                    <Button
                        size="xs"
                        className={role === 'teacher'
                            ? "!h-6 !px-2.5 bg-[#0F4C3D] hover:bg-[#0F4C3D]/90 text-white font-black text-[9px] uppercase tracking-[0.05em] rounded-full shadow-md shadow-[#0F4C3D]/20 flex items-center gap-1 transition-all font-inter active:scale-95 shrink-0 border-none"
                            : "!h-6 !px-2.5 bg-[#2563EB] hover:bg-[#2563EB]/90 text-white font-black text-[9px] uppercase tracking-[0.05em] rounded-full shadow-md shadow-[#2563EB]/20 flex items-center gap-1 transition-all font-inter active:scale-95 shrink-0 border-none"
                        }
                    >
                        <Plus className="h-2.5 w-2.5" />
                        <span>Добавить</span>
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="w-[440px] max-w-[95vw] bg-background border-border text-foreground p-0 overflow-hidden rounded-[2rem]">
                <div className="p-6 pb-4">
                    <DialogHeader className="mb-4">
                        <DialogTitle className="text-xl font-black uppercase tracking-tight">
                            {role === 'student' ? "Добавить студента" : "Новый преподаватель"}
                        </DialogTitle>
                        <DialogDescription className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            {role === 'student' && group ? `Группа: ${group.name}` :
                                role === 'student' ? "В общешкольную базу" :
                                    "Быстрое добавление сотрудника"}
                        </DialogDescription>
                    </DialogHeader>

                    {/* Tabs */}
                    <div className="grid grid-cols-4 p-1 bg-card/50 rounded-xl border border-border mb-6 w-full gap-1">
                        {availableTabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setMode(tab.id as TabMode)}
                                className={cn(
                                    "flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all duration-300 min-w-0 w-full overflow-hidden col-span-1",
                                    mode === tab.id
                                        ? "bg-primary text-white shadow-lg shadow-cyan-500/20"
                                        : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                                )}
                                style={{ gridColumn: `span ${4 / availableTabs.length}` }}
                            >
                                <tab.icon className="h-3 w-3 shrink-0" />
                                <span className="text-[9px] font-black uppercase tracking-tighter truncate">{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="min-h-[350px]">
                        <AnimatePresence mode="wait">
                            {/* MANUAL TAB */}
                            {mode === 'manual' && (
                                <motion.div
                                    key="manual"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-4"
                                >
                                    {/* Student: Group Select */}
                                    {role === 'student' && !initialGroup && (
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Выберите группу (опционально)</Label>
                                            <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                                                <SelectTrigger className="bg-card border-border rounded-xl h-11 text-xs font-bold">
                                                    <SelectValue placeholder="Выберите группу" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">БЕЗ ГРУППЫ</SelectItem>
                                                    {groups.map(g => (
                                                        <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Имя</Label>
                                        <Input
                                            placeholder="Иван"
                                            className="bg-card border-border rounded-xl h-11 text-xs font-bold"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Фамилия</Label>
                                        <Input
                                            placeholder="Иванов"
                                            className="bg-card border-border rounded-xl h-11 text-xs font-bold"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                        />
                                    </div>

                                    {/* TEACHER SPECIFIC FIELDS */}
                                    {role === 'teacher' && (
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Специализация</Label>
                                            <Input
                                                placeholder="Например: Английский"
                                                className="bg-card border-border rounded-xl h-11 text-xs font-bold"
                                                value={specialization}
                                                onChange={(e) => setSpecialization(e.target.value)}
                                            />
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Дата рождения</Label>
                                        <Input
                                            placeholder="ДД.ММ.ГГГГ"
                                            className="bg-card border-border rounded-xl h-11 text-xs font-bold"
                                            value={birthDateRaw}
                                            onChange={handleBirthDateChange}
                                            maxLength={10}
                                        />
                                    </div>

                                    {/* TEACHER ADVANCED TOGGLE */}
                                    {role === 'teacher' && (
                                        <>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setShowAdvanced(!showAdvanced)}
                                                    className="h-8 px-2 text-[10px] font-bold uppercase text-primary hover:bg-primary/5 transition-colors"
                                                >
                                                    {showAdvanced ? "Скрыть детали" : "+ Заполнить детали (Email, Роль, Телефон)"}
                                                </Button>
                                            </div>
                                            {showAdvanced && (
                                                <div className="space-y-4 pt-2 animate-in slide-in-from-top-2 fade-in duration-200">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Телефон</Label>
                                                            <Input
                                                                placeholder="+7"
                                                                className="bg-card border-border rounded-xl h-11 text-xs font-bold"
                                                                value={phone}
                                                                onChange={(e) => setPhone(e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email</Label>
                                                            <Input
                                                                placeholder="email@example.com"
                                                                className="bg-card border-border rounded-xl h-11 text-xs font-bold"
                                                                value={email}
                                                                onChange={(e) => setEmail(e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Пароль</Label>
                                                            <Input
                                                                type="password"
                                                                placeholder="Мин. 6 символов"
                                                                className="bg-card border-border rounded-xl h-11 text-xs font-bold"
                                                                value={password}
                                                                onChange={(e) => setPassword(e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Роль</Label>
                                                        <Select value={teacherRole} onValueChange={(r) => setTeacherRole(r as TeacherRole)}>
                                                            <SelectTrigger className="bg-card border-border rounded-xl h-11 text-xs font-bold">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="teacher">Преподаватель</SelectItem>
                                                                <SelectItem value="curator">Куратор</SelectItem>
                                                                <SelectItem value="admin">Администратор</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}

                                    <Button
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className="w-full bg-primary hover:bg-primary text-foreground rounded-xl h-12 font-black uppercase tracking-widest mt-4"
                                    >
                                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Добавить"}
                                    </Button>
                                </motion.div>
                            )}

                            {/* HANDSHAKE TAB */}
                            {mode === 'handshake' && (
                                <motion.div
                                    key="handshake"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-4"
                                >
                                    <div className="flex p-1 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                                        <button
                                            onClick={() => setHandshakeMode("scan")}
                                            className={cn(
                                                "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-bold uppercase transition-all",
                                                handshakeMode === "scan" ? "bg-white text-[#0F172A] shadow-sm" : "text-[#64748B]"
                                            )}
                                        >
                                            <Camera className="h-3 w-3" />
                                            Сканировать
                                        </button>
                                        <button
                                            onClick={() => setHandshakeMode("show")}
                                            className={cn(
                                                "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-bold uppercase transition-all",
                                                handshakeMode === "show" ? "bg-white text-[#0F172A] shadow-sm" : "text-[#64748B]"
                                            )}
                                        >
                                            <QrCode className="h-3 w-3" />
                                            Показать мой
                                        </button>
                                    </div>

                                    {handshakeMode === "scan" ? (
                                        <div className="relative aspect-square w-full rounded-[1.5rem] overflow-hidden border border-border bg-black">
                                            <Scanner
                                                onScan={handleHandshakeScan}
                                                allowMultiple={false}
                                                scanDelay={1000}
                                            />
                                            <div className="absolute inset-0 border-[30px] border-black/40 pointer-events-none">
                                                <div className="w-full h-full border-2 border-primary/50 relative">
                                                    <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-primary rounded-tl-sm" />
                                                    <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-primary rounded-tr-sm" />
                                                    <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-primary rounded-bl-sm" />
                                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-primary rounded-br-sm" />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-6 bg-white rounded-[1.5rem] border border-slate-100 shadow-inner">
                                            <QRCode value={JSON.stringify({ type: 'EF_JOIN_GROUP', orgId: currentOrganizationId || '', groupId: group?.id || 'none' })} size={180} />
                                            <p className="text-[10px] font-black text-muted-foreground mt-4 uppercase tracking-[0.2em] text-center px-6">
                                                {role === 'student' ? 'Студент' : 'Коллега'} сканирует этот код<br />через внутренний сканер приложения
                                            </p>
                                            <p className="text-[9px] font-bold text-primary mt-2 uppercase tracking-tight opacity-60">
                                                Для камеры телефона используйте раздел "ИНВАЙТ"
                                            </p>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* DATABASE TAB */}
                            {mode === 'database' && (
                                <motion.div
                                    key="database"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-4"
                                >
                                    {role === 'teacher' || !group ? (
                                        <div className="flex flex-col items-center justify-center py-12 text-center h-[300px]">
                                            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                                                <Users className="h-8 w-8 text-primary" />
                                            </div>
                                            <h3 className="text-sm font-black text-foreground mb-2">Выберите группу</h3>
                                            <p className="text-xs text-muted-foreground max-w-[240px] mb-6">Чтобы добавить существующего человека, необходимо выбрать группу.</p>
                                            {role === 'student' && (
                                                <div className="w-full max-w-[240px]">
                                                    <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                                                        <SelectTrigger className="bg-card border-border rounded-xl h-11 text-xs font-bold w-full">
                                                            <SelectValue placeholder="Выберите группу" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {groups.map(g => (
                                                                <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <>
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    placeholder="Поиск по базе..."
                                                    className="pl-9 bg-card border-border rounded-xl h-11 text-xs font-bold"
                                                    value={search}
                                                    onChange={(e) => setSearch(e.target.value)}
                                                />
                                            </div>

                                            <ScrollArea className="h-[280px] pr-2">
                                                <div className="space-y-2">
                                                    {(role === 'student' ? students : []).filter(s => {
                                                        const isNotInGroup = !s.groupIds?.includes(group.id);
                                                        const matchesSearch =
                                                            `${s.firstName} ${s.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
                                                            (s as any).email?.toLowerCase().includes(search.toLowerCase());
                                                        return isNotInGroup && matchesSearch;
                                                    }).map((person: any) => (
                                                        <div
                                                            key={person.id}
                                                            className="flex items-center gap-3 p-2.5 rounded-xl border border-border bg-card/30 hover:bg-card transition-colors group"
                                                        >
                                                            <Avatar className="h-9 w-9 border border-border">
                                                                <AvatarImage src={person.passportPhotoUrl} />
                                                                <AvatarFallback className="text-[10px] font-bold">
                                                                    {person.firstName[0]}{person.lastName[0]}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-[11px] font-bold text-foreground truncate">
                                                                    {person.lastName} {person.firstName}
                                                                </p>
                                                                <p className="text-[9px] text-muted-foreground uppercase tracking-tight">
                                                                    {new Date(person.birthDate).getFullYear()} • {person.level || "BASIC"}
                                                                </p>
                                                            </div>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => handleAssignExisting(person.id)}
                                                                disabled={!!processingId}
                                                                className="h-8 w-8 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all opacity-0 group-hover:opacity-100"
                                                            >
                                                                {processingId === person.id ? (
                                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                                ) : (
                                                                    <UserCheck className="h-4 w-4" />
                                                                )}
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </ScrollArea>
                                        </>
                                    )}
                                </motion.div>
                            )}

                            {/* INVITE TAB */}
                            {mode === 'invite' && (
                                <motion.div
                                    key="invite"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-6"
                                >
                                    <div className="flex flex-col items-center justify-center py-6 bg-white rounded-[1.5rem] border border-slate-100 shadow-inner">
                                        <QRCode value={inviteLink} size={160} />
                                        <p className="text-[10px] font-black text-muted-foreground mt-4 uppercase tracking-[0.2em]">QR Код для {role === 'student' ? "студента" : "преподавателя"}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between px-1">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Прямая ссылка</Label>
                                            <button
                                                onClick={handleCopy}
                                                className="text-[10px] font-black text-primary uppercase hover:bg-primary/5 px-2 py-1 rounded-md transition-all active:scale-95"
                                            >
                                                {copied ? "Скопировано!" : "Копировать"}
                                            </button>
                                        </div>
                                        <div className="p-4 bg-card/50 rounded-2xl border border-border flex items-center gap-3 shadow-inner overflow-hidden w-full">
                                            <p className="flex-1 text-[11px] font-mono text-muted-foreground break-all min-w-0 line-clamp-2">{inviteLink}</p>
                                            <Check className={cn("h-4 w-4 text-emerald-500 transition-all shrink-0", copied ? "scale-100 opacity-100" : "scale-50 opacity-0")} />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
                <div className="h-1 w-full bg-primary/20 mt-2" />
            </DialogContent>
        </Dialog>
    );
}
