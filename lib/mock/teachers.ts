import { Teacher, TeacherPermissions } from "@/lib/types/teacher";

const DEFAULT_PERMISSIONS: TeacherPermissions = {
    canCreateGroups: false,
    canManageStudents: true,
    canMarkAttendance: true,
    canGradeStudents: true,
    canSendAnnouncements: true,
    canUseChat: true,
    canInviteStudents: false
};

const ADMIN_PERMISSIONS: TeacherPermissions = {
    canCreateGroups: true,
    canManageStudents: true,
    canMarkAttendance: true,
    canGradeStudents: true,
    canSendAnnouncements: true,
    canUseChat: true,
    canInviteStudents: true
};

export const MOCK_TEACHERS: Teacher[] = [
    {
        id: "t1",
        firstName: "Ирина",
        lastName: "Васильева",
        specialization: "Английский язык",
        status: "ACTIVE",
        role: "CURATOR",
        permissions: { ...DEFAULT_PERMISSIONS, canCreateGroups: true, canInviteStudents: true },
        groups: [{ id: "g1", name: "English A1" }, { id: "g2", name: "English B1" }],
        createdAt: "2024-08-15T10:00:00Z",
        lastActivityAt: "2026-01-25T09:30:00Z",
        email: "irina.v@school.com"
    },
    {
        id: "t2",
        firstName: "Олег",
        lastName: "Сидоров",
        specialization: "Математика",
        status: "ACTIVE",
        role: "TEACHER",
        permissions: DEFAULT_PERMISSIONS,
        groups: [{ id: "g3", name: "Math Club" }],
        createdAt: "2025-01-10T11:00:00Z",
        lastActivityAt: "2026-01-24T15:45:00Z",
        email: "oleg.math@school.com"
    },
    {
        id: "t3",
        firstName: "Екатерина",
        lastName: "Михайлова",
        specialization: "Немецкий язык",
        status: "INVITED",
        role: "TEACHER",
        permissions: DEFAULT_PERMISSIONS,
        groups: [],
        createdAt: "2026-01-20T14:20:00Z",
        email: "katya.de@gmail.com"
    },
    {
        id: "t4",
        firstName: "Админ",
        lastName: "Главный",
        specialization: "Директор",
        status: "ACTIVE",
        role: "ADMIN",
        permissions: ADMIN_PERMISSIONS,
        groups: [],
        createdAt: "2024-01-01T00:00:00Z",
        lastActivityAt: "2026-01-25T10:00:00Z",
        email: "admin@school.com"
    },
    {
        id: "t5",
        firstName: "Сергей",
        lastName: "Петров",
        specialization: "Робототехника",
        status: "SUSPENDED",
        role: "TEACHER",
        permissions: DEFAULT_PERMISSIONS,
        groups: [{ id: "g4", name: "Robotics" }],
        createdAt: "2024-11-05T09:00:00Z",
        lastActivityAt: "2025-12-15T16:00:00Z",
        email: "sergey@school.com"
    }
];
